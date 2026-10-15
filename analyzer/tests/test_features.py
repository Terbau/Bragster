import av
import numpy as np
import pytest

from padel_analyzer.features import SAMPLE_RATE, read_timeline, sampled_frames
from padel_analyzer.rallies import find_rallies

from .conftest import EXAMPLE_VIDEOS


def test_portrait_videos_are_turned_upright(make_video):
    # Stored sideways like a phone filmed in portrait: the left edge is bright,
    # and becomes the top edge when turned a quarter clockwise
    frame = np.zeros((180, 320, 3), np.uint8)
    frame[:, :40] = 255
    path = make_video([frame] * 10, rotation=-90)

    with av.open(str(path)) as container:
        _, image = next(sampled_frames(container, 100))
    height, width = image.shape[:2]
    assert height > width
    assert image[:20].mean() > 200
    assert image[-20:].mean() < 50


def test_reads_the_signals_of_a_video(make_video):
    rng = np.random.default_rng(1)
    still = np.full((180, 320, 3), 90, np.uint8)
    moving = [rng.integers(0, 255, (180, 320, 3), dtype=np.uint8) for _ in range(30)]
    path = make_video([still] * 30 + moving + [still] * 30)

    timeline = read_timeline(path)
    assert timeline.duration == pytest.approx(3, abs=0.1)
    assert (timeline.width, timeline.height) == (640, 360)
    assert len(timeline.motion) == int(np.ceil(timeline.duration * SAMPLE_RATE)) + 1
    # Noise changes everything, which looks like the camera moving
    assert np.isnan(timeline.motion[12:18]).all()
    assert np.nanmax(timeline.motion[3:8]) < 0.01


@pytest.mark.skipif(not EXAMPLE_VIDEOS.exists(), reason="No example videos")
def test_finds_the_rally_in_an_example_video():
    path = next(EXAMPLE_VIDEOS.glob("*d4p90evog65nth6ko6rg*"))
    timeline = read_timeline(path)
    rallies = find_rallies(timeline)
    assert timeline.height > timeline.width
    assert rallies
    # The point is played from about 4 to 17 seconds
    assert any(rally.start < 10 and rally.end > 12 for rally in rallies)
