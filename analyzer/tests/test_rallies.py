import numpy as np

from padel_analyzer.features import SAMPLE_RATE, Timeline
from padel_analyzer.rallies import _otsu, find_rallies


def make_timeline(rallies: list[tuple[float, float]], duration: float, seed=0, hits=True):
    rng = np.random.default_rng(seed)
    count = int(duration * SAMPLE_RATE) + 1
    motion = rng.normal(0.01, 0.003, count).clip(0)
    hit = (rng.random(count) < 0.01).astype(float)
    ball = (rng.random(count) < 0.05).astype(float)
    for start, end in rallies:
        span = slice(int(start * SAMPLE_RATE), int(end * SAMPLE_RATE))
        motion[span] += rng.normal(0.03, 0.01, len(motion[span])).clip(0)
        ball[span] = (rng.random(len(ball[span])) < 0.4).astype(float)
        if hits:
            hit[span][:: int(1.2 * SAMPLE_RATE)] = 1
    return Timeline(
        duration=duration,
        width=360,
        height=640,
        motion=motion,
        ball=ball,
        ball_area=np.full(count, np.nan),
        hits=hit if hits else np.zeros(count),
    )


def test_otsu_splits_two_groups():
    values = np.concatenate([np.zeros(50), np.ones(50) * 4])
    threshold, separation = _otsu(values)
    assert 0 < threshold < 4
    assert separation > 0.99
    assert _otsu(np.ones(10)) == (1.0, 0.0)


def test_finds_rallies_between_breaks():
    truth = [(20, 35), (52, 60), (80, 110), (128, 134)]
    rallies = find_rallies(make_timeline(truth, 150))
    assert len(rallies) == len(truth)
    for rally, (start, end) in zip(rallies, truth):
        assert abs(rally.start - start) < 3
        assert abs(rally.end - end) < 3
        assert 0.3 <= rally.near_win_probability <= 0.7


def test_works_without_sound():
    truth = [(20, 35), (52, 60), (80, 110)]
    rallies = find_rallies(make_timeline(truth, 130, hits=False))
    assert len(rallies) == len(truth)


def test_splits_points_played_back_to_back():
    rallies = find_rallies(make_timeline([(10, 150)], 170))
    assert len(rallies) >= 3
    assert all(rally.end - rally.start <= 62 for rally in rallies)


def test_rallies_do_not_overlap():
    rallies = find_rallies(make_timeline([(10, 20), (23.5, 33)], 60))
    for previous, current in zip(rallies, rallies[1:]):
        assert previous.end <= current.start


def test_nothing_to_find_in_a_short_video():
    assert find_rallies(make_timeline([], 1)) == []
