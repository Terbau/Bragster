"""Finds the rallies in a timeline, and guesses who won each of them.

A rally is a stretch with more going on than the rest of the video: players
moving fast, the ball flying and the ball being hit. Everything is compared
with the video itself, so the light, the camera position and the noise from
other courts matter less.
"""

from __future__ import annotations

import warnings
from dataclasses import asdict, dataclass

import numpy as np

from .features import SAMPLE_RATE, Timeline

# Bump when the results change, so old videos can be analysed again
VERSION = 1

BIN_SECONDS = 0.5
SMOOTH_SECONDS = 2.5
MIN_RALLY_SECONDS = 3.0
# Shorter breaks are part of the rally, like waiting for a high lob to come down
MERGE_GAP_SECONDS = 4.0
# A rally lasts while the activity is this far from the usual level to the
# level that starts a rally
LOW_LEVEL_SHARE = 0.3
# Longer stretches are points played back to back, and are split
MAX_RALLY_SECONDS = 60.0
# Clips start a little before and end a little after the action
PAD_BEFORE_SECONDS = 0.5
PAD_AFTER_SECONDS = 1.5

WEIGHTS = {"motion": 0.55, "ball": 0.25, "hits": 0.2}

# Ball candidates this big are close to the camera, and this small far away
NEAR_BALL_AREA = 10
FAR_BALL_AREA = 4
# How sure the ball can make the guess of who won
MAX_WINNER_LEAN = 0.2


@dataclass
class Rally:
    start: float
    end: float
    # Probability that the team nearest the camera won the point
    near_win_probability: float
    hits: int

    def to_json(self) -> dict:
        data = asdict(self)
        return {
            "start": round(data["start"], 2),
            "end": round(data["end"], 2),
            "nearWinProbability": round(data["near_win_probability"], 3),
            "hits": data["hits"],
        }


def _bins(values: np.ndarray, size: int, reduce) -> np.ndarray:
    count = int(np.ceil(len(values) / size))
    padded = np.full(count * size, np.nan)
    padded[: len(values)] = values
    # Bins without any known value are nan
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=RuntimeWarning)
        return reduce(padded.reshape(count, size), axis=1)


def _robust_score(values: np.ndarray) -> np.ndarray:
    """How unusual each value is for this video, nan counts as usual"""
    known = values[~np.isnan(values)]
    if len(known) == 0:
        return np.zeros_like(values)
    median = np.median(known)
    spread = 1.4826 * np.median(np.abs(known - median))
    if spread < 1e-9:
        spread = max(float(np.std(known)), 1e-9)
    score = (values - median) / spread
    return np.clip(np.nan_to_num(score, nan=0.0), -3, 6)


def _otsu(values: np.ndarray) -> tuple[float, float]:
    """
    The threshold that best splits the values in two groups, and how clearly
    they split, from 0 (not at all) to 1 (two tight groups)
    """
    ordered = np.sort(values)
    count = len(ordered)
    if count < 2 or ordered[0] == ordered[-1]:
        return (float(ordered[0]) if count else 0.0), 0.0
    sums = np.cumsum(ordered)
    low_count = np.arange(1, count)
    low_mean = sums[:-1] / low_count
    high_mean = (sums[-1] - sums[:-1]) / (count - low_count)
    between = low_count * (count - low_count) * (low_mean - high_mean) ** 2 / count**2
    best = int(np.argmax(between))
    threshold = float((ordered[best] + ordered[best + 1]) / 2)
    return threshold, float(between[best] / ordered.var())


def activity(timeline: Timeline) -> np.ndarray:
    """
    How much is going on in every BIN_SECONDS of the video. A signal that
    clearly switches between two levels, like hits that come and go with the
    rallies, counts more than one that is noisy throughout, like music.
    """
    size = int(BIN_SECONDS * SAMPLE_RATE)
    signals = {
        "motion": _bins(
            timeline.motion, size, lambda x, axis: np.nanpercentile(x, 75, axis=axis)
        ),
        "ball": _bins(timeline.ball, size, np.nansum),
        "hits": _bins(timeline.hits, size, np.nansum),
    }
    combined = np.zeros(len(signals["motion"]))
    span = max(1, min(len(combined), int(round(SMOOTH_SECONDS / BIN_SECONDS))))
    kernel = np.ones(span) / span
    total_weight = 0.0
    for name, values in signals.items():
        score = np.convolve(_robust_score(values), kernel, mode="same")
        weight = WEIGHTS[name] * _otsu(score)[1]
        combined += weight * score
        total_weight += weight
    return combined / total_weight if total_weight > 0 else combined


def _stretches(active: np.ndarray) -> list[tuple[int, int]]:
    """Start and end (exclusive) of every run of true values"""
    padded = np.concatenate([[False], active, [False]])
    changes = np.flatnonzero(padded[1:] != padded[:-1])
    return list(zip(changes[::2], changes[1::2]))


def _split_long(start: int, end: int, level: np.ndarray, max_bins: int):
    """Splits a stretch at its quietest moment until every part is short enough"""
    if end - start <= max_bins:
        return [(start, end)]
    margin = int(MIN_RALLY_SECONDS / BIN_SECONDS)
    inner = level[start + margin : end - margin]
    if len(inner) == 0:
        return [(start, end)]
    cut = start + margin + int(np.argmin(inner))
    return _split_long(start, cut, level, max_bins) + _split_long(
        cut, end, level, max_bins
    )


def _near_win_probability(timeline: Timeline, end: float) -> float:
    """
    Where the ball was last seen hints at who lost the point: a point usually
    ends with the ball on the losing side, in the net, behind them or rolling
    on their floor. Close to the camera the ball looks bigger.
    """
    first = max(0, int((end - 2.0) * SAMPLE_RATE))
    last = min(len(timeline.ball_area), int((end + 0.5) * SAMPLE_RATE))
    areas = timeline.ball_area[first:last]
    areas = areas[~np.isnan(areas)]
    near = int(np.sum(areas >= NEAR_BALL_AREA))
    far = int(np.sum(areas <= FAR_BALL_AREA))
    lean = (far - near) / (far + near + 2)
    return float(0.5 + MAX_WINNER_LEAN * lean)


def find_rallies(timeline: Timeline) -> list[Rally]:
    level = activity(timeline)
    if len(level) < 4:
        return []

    # A rally reaches the high level somewhere, and lasts while the level
    # stays clearly above the usual level of the video
    high, _ = _otsu(level)
    usual = float(np.median(level))
    low = usual + LOW_LEVEL_SHARE * (high - usual)

    merge = int(MERGE_GAP_SECONDS / BIN_SECONDS)
    merged: list[tuple[int, int]] = []
    for start, end in _stretches(level >= low):
        if merged and start - merged[-1][1] <= merge:
            merged[-1] = (merged[-1][0], end)
        else:
            merged.append((start, end))
    merged = [(start, end) for start, end in merged if level[start:end].max() >= high]

    max_bins = int(MAX_RALLY_SECONDS / BIN_SECONDS)
    rallies = []
    for start, end in merged:
        for part_start, part_end in _split_long(start, end, level, max_bins):
            if (part_end - part_start) * BIN_SECONDS < MIN_RALLY_SECONDS:
                continue
            core_start = part_start * BIN_SECONDS
            core_end = min(part_end * BIN_SECONDS, timeline.duration)
            first, last = int(core_start * SAMPLE_RATE), int(core_end * SAMPLE_RATE)
            rallies.append(
                Rally(
                    start=max(0.0, core_start - PAD_BEFORE_SECONDS),
                    end=min(timeline.duration, core_end + PAD_AFTER_SECONDS),
                    near_win_probability=_near_win_probability(timeline, core_end),
                    hits=int(timeline.hits[first:last].sum()),
                )
            )

    # Padding can make neighbours overlap
    for previous, current in zip(rallies, rallies[1:]):
        if current.start < previous.end:
            middle = (previous.end + current.start) / 2
            previous.end = current.start = middle
    return rallies
