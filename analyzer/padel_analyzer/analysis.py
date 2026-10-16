from __future__ import annotations

from pathlib import Path
from typing import BinaryIO

import cv2
import numpy as np

from .features import Timeline, read_timeline
from .rallies import BIN_SECONDS, VERSION, Rally, activity, find_rallies


def analyze(source: str | Path | BinaryIO) -> tuple[dict, Timeline, list[Rally]]:
    """The result sent to Bragster, and what it was found from"""
    timeline = read_timeline(source)
    rallies = find_rallies(timeline)
    result = {
        "version": VERSION,
        "duration": round(timeline.duration, 2),
        "width": timeline.width,
        "height": timeline.height,
        "rallies": [rally.to_json() for rally in rallies],
    }
    return result, timeline, rallies


def draw_debug(timeline: Timeline, rallies: list[Rally], path: str | Path) -> None:
    """Draws the activity over time with the rallies on top, for tuning"""
    level = activity(timeline)
    pixels_per_bin = 4
    width, height = max(200, len(level) * pixels_per_bin), 240
    image = np.full((height, width, 3), 255, np.uint8)
    for rally in rallies:
        x1 = int(rally.start / BIN_SECONDS * pixels_per_bin)
        x2 = int(rally.end / BIN_SECONDS * pixels_per_bin)
        shade = int(255 * (1 - rally.near_win_probability))
        cv2.rectangle(image, (x1, 0), (x2, height), (230, 230 - shade // 4, 200), -1)
    low, high = -2.0, 5.0
    points = [
        (index * pixels_per_bin, int(height - (value - low) / (high - low) * height))
        for index, value in enumerate(level)
    ]
    cv2.polylines(image, [np.array(points, np.int32)], False, (40, 40, 40), 1)
    zero = int(height - (0 - low) / (high - low) * height)
    cv2.line(image, (0, zero), (width, zero), (160, 160, 160), 1)
    for second in range(0, int(timeline.duration) + 1, 10):
        x = int(second / BIN_SECONDS * pixels_per_bin)
        cv2.line(image, (x, height - 8), (x, height), (0, 0, 0), 1)
        cv2.putText(image, f"{second}", (x + 2, height - 2), 0, 0.3, (0, 0, 0), 1)
    cv2.imwrite(str(path), image)
