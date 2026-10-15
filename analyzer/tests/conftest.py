from pathlib import Path

import av
import numpy as np
import pytest

EXAMPLE_VIDEOS = Path(__file__).resolve().parents[2] / "mobile" / "example_videos"


@pytest.fixture
def make_video(tmp_path):
    """Writes frames to an mp4 and returns its path"""

    def make(frames: list[np.ndarray], rate: int = 30, rotation: int = 0, name="video.mp4"):
        path = tmp_path / name
        with av.open(str(path), "w") as container:
            stream = container.add_stream("mpeg4", rate=rate)
            stream.height, stream.width = frames[0].shape[:2]
            stream.pix_fmt = "yuv420p"
            if rotation:
                stream.set_display_rotation(rotation)
            for frame in frames:
                for packet in stream.encode(av.VideoFrame.from_ndarray(frame, format="rgb24")):
                    container.mux(packet)
            for packet in stream.encode():
                container.mux(packet)
        return path

    return make
