"""Turns a video into a timeline of simple signals.

The camera stands still behind the glass at one end of the court, so the
signals are about change: how much of the picture moves, small fast yellow
blobs that may be the ball, and sharp sounds that may be the ball being hit.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

import av
import cv2
import numpy as np

# Frames looked at per second. The rest are decoded but skipped.
SAMPLE_RATE = 10
# Frames are scaled down so their short side is this many pixels
FRAME_SHORT_SIDE = 360
# A pixel has changed when its brightness changes more than this
CHANGE_THRESHOLD = 18
# With more of the picture changing, the camera moved or the light changed
MAX_CHANGED_SHARE = 0.35
# Ball candidates are this many pixels, at FRAME_SHORT_SIDE
MIN_BALL_AREA = 2
MAX_BALL_AREA = 150
MAX_BALL_SIDE = 20

AUDIO_RATE = 16000
AUDIO_WINDOW = 256
AUDIO_HOP = 160  # 10 ms
# Ball hits are short and bright, so only high frequencies are used
HIT_BAND_HZ = (2000, 7000)
# A hit is this many dB louder than the sound around it
HIT_MIN_RISE_DB = 9.0
HIT_MIN_INTERVAL = 0.12


@dataclass
class Timeline:
    """Signals sampled SAMPLE_RATE times per second, from the start of the video"""

    duration: float
    width: int
    height: int
    # Share of the picture that changed since the previous sample, nan when
    # the camera moved
    motion: np.ndarray
    # Ball candidates seen
    ball: np.ndarray
    # Median size of the ball candidates in pixels, nan without candidates
    ball_area: np.ndarray
    # Sharp sounds heard
    hits: np.ndarray

    @property
    def step(self) -> float:
        return 1 / SAMPLE_RATE


def _rotate(image: np.ndarray, rotation: float) -> np.ndarray:
    """Turns the frame the way it is shown, like a phone filmed in portrait"""
    turns = int(round(rotation / 90)) % 4
    return np.ascontiguousarray(np.rot90(image, k=turns)) if turns else image


def _ball_candidates(image: np.ndarray, changed: np.ndarray) -> list[int]:
    """Sizes of the small, moving, yellow blobs in the frame"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hue, saturation, value = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    yellow = (hue >= 22) & (hue <= 45) & (saturation >= 80) & (value >= 110)
    mask = (yellow & changed).astype(np.uint8)
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    sizes = []
    for index in range(1, count):
        width = stats[index, cv2.CC_STAT_WIDTH]
        height = stats[index, cv2.CC_STAT_HEIGHT]
        area = stats[index, cv2.CC_STAT_AREA]
        if (
            MIN_BALL_AREA <= area <= MAX_BALL_AREA
            and max(width, height) <= MAX_BALL_SIDE
        ):
            sizes.append(int(area))
    return sizes


def sampled_frames(container: av.container.InputContainer, samples: int):
    """
    Yields (sample index, frame) SAMPLE_RATE times per second, scaled down
    and turned the way the video is shown
    """
    stream = container.streams.video[0]
    stream.thread_type = "AUTO"
    # Only a few frames a second are looked at, so with a high frame rate the
    # frames no other frame depends on aren't decoded at all
    if stream.average_rate and stream.average_rate > 2.5 * SAMPLE_RATE:
        stream.codec_context.skip_frame = "NONREF"
    start = float(stream.start_time * stream.time_base) if stream.start_time else 0.0
    previous_index = -1
    for frame in container.decode(stream):
        if frame.time is None:
            continue
        index = int(round((frame.time - start) * SAMPLE_RATE))
        if index <= previous_index or index < 0:
            continue
        if index >= samples:
            break
        previous_index = index
        scale = FRAME_SHORT_SIDE / min(frame.width, frame.height)
        image = frame.reformat(
            width=int(round(frame.width * scale / 2)) * 2,
            height=int(round(frame.height * scale / 2)) * 2,
            format="bgr24",
        ).to_ndarray()
        yield index, _rotate(image, frame.rotation or 0)


def _video_signals(container: av.container.InputContainer, duration: float):
    samples = int(np.ceil(duration * SAMPLE_RATE)) + 1
    motion = np.full(samples, np.nan)
    ball = np.zeros(samples)
    ball_area = np.full(samples, np.nan)

    previous = None
    previous_index = -10
    width = height = 0
    for index, image in sampled_frames(container, samples):
        height, width = image.shape[:2]
        gray = cv2.GaussianBlur(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), (3, 3), 0)
        # Only compare with a sample close in time, frames can be missing
        if previous is not None and index - previous_index <= 2:
            changed = cv2.absdiff(gray, previous) > CHANGE_THRESHOLD
            share = float(changed.mean())
            if share <= MAX_CHANGED_SHARE:
                motion[index] = share
                sizes = _ball_candidates(image, changed)
                ball[index] = min(len(sizes), 3)
                if sizes:
                    ball_area[index] = float(np.median(sizes))
        previous = gray
        previous_index = index
    return motion, ball, ball_area, width, height


def _audio_signals(container: av.container.InputContainer, duration: float):
    samples = int(np.ceil(duration * SAMPLE_RATE)) + 1
    hits = np.zeros(samples)
    if not container.streams.audio:
        return hits

    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format="flt", layout="mono", rate=AUDIO_RATE)
    frequencies = np.fft.rfftfreq(AUDIO_WINDOW, 1 / AUDIO_RATE)
    band = (frequencies >= HIT_BAND_HZ[0]) & (frequencies <= HIT_BAND_HZ[1])
    window = np.hanning(AUDIO_WINDOW).astype(np.float32)

    # Energy of the hit band every AUDIO_HOP samples
    energies: list[np.ndarray] = []
    pending = np.zeros(0, dtype=np.float32)

    def take_hops(buffer: np.ndarray) -> np.ndarray:
        count = (len(buffer) - AUDIO_WINDOW) // AUDIO_HOP + 1
        if count <= 0:
            return buffer
        frames = np.lib.stride_tricks.sliding_window_view(buffer, AUDIO_WINDOW)[
            ::AUDIO_HOP
        ][:count]
        spectrum = np.abs(np.fft.rfft(frames * window, axis=1)) ** 2
        energies.append(spectrum[:, band].sum(axis=1))
        return buffer[count * AUDIO_HOP :]

    for frame in container.decode(stream):
        for resampled in resampler.resample(frame):
            pending = np.concatenate([pending, resampled.to_ndarray().ravel()])
            if len(pending) >= AUDIO_RATE:
                pending = take_hops(pending)
    for resampled in resampler.resample(None):
        pending = np.concatenate([pending, resampled.to_ndarray().ravel()])
    take_hops(pending)
    if not energies:
        return hits

    level = 10 * np.log10(np.concatenate(energies) + 1e-10)
    hop_rate = AUDIO_RATE / AUDIO_HOP
    # The sound around each moment, over half a second
    span = int(hop_rate / 2) | 1
    around = np.convolve(level, np.ones(span) / span, mode="same")
    rise = level - around
    is_peak = (
        (rise >= HIT_MIN_RISE_DB)
        & (level >= np.roll(level, 1))
        & (level >= np.roll(level, -1))
    )
    last_hit = -np.inf
    for hop in np.flatnonzero(is_peak):
        time = hop * AUDIO_HOP / AUDIO_RATE
        if time - last_hit < HIT_MIN_INTERVAL:
            continue
        last_hit = time
        index = int(time * SAMPLE_RATE)
        if index < samples:
            hits[index] += 1
    return hits


def _open(source: str | Path | BinaryIO) -> av.container.InputContainer:
    """Opens a file, or something that reads like one, from the start"""
    if isinstance(source, (str, Path)):
        return av.open(str(source))
    source.seek(0)
    return av.open(source)


def read_timeline(source: str | Path | BinaryIO) -> Timeline:
    """`source` is a path, or a file object like a video read from storage"""
    with _open(source) as container:
        if not container.streams.video:
            raise ValueError("The file has no video")
        duration = (
            container.duration / av.time_base
            if container.duration
            else float(
                container.streams.video[0].duration
                * container.streams.video[0].time_base
            )
        )
        motion, ball, ball_area, width, height = _video_signals(container, duration)
    # Audio is read separately, so a long video is never kept in memory
    with _open(source) as container:
        hits = _audio_signals(container, duration)
    return Timeline(
        duration=duration,
        width=width,
        height=height,
        motion=motion,
        ball=ball,
        ball_area=ball_area,
        hits=hits,
    )
