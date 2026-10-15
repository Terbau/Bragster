import base64
import json

from padel_analyzer.worker import blob_name_from_message, recording_id_from_blob_name

EVENT = {
    "topic": "/subscriptions/x/resourceGroups/Bragster/providers/Microsoft.Storage/storageAccounts/st",
    "subject": "/blobServices/default/containers/padel-videos/blobs/videos/game/rec-1.mp4",
    "eventType": "Microsoft.Storage.BlobCreated",
    "data": {"api": "PutBlob", "url": "https://st.blob.core.windows.net/padel-videos/videos/game/rec-1.mp4"},
}


def test_reads_event_grid_messages():
    encoded = base64.b64encode(json.dumps(EVENT).encode()).decode()
    assert blob_name_from_message(encoded, "padel-videos") == "videos/game/rec-1.mp4"
    assert blob_name_from_message(json.dumps([EVENT]), "padel-videos") == "videos/game/rec-1.mp4"


def test_reads_messages_from_bragster():
    message = json.dumps({"blobName": "videos/game/rec-2.mov"})
    assert blob_name_from_message(message, "padel-videos") == "videos/game/rec-2.mov"


def test_skips_other_messages():
    assert blob_name_from_message(json.dumps(EVENT), "other-container") is None
    assert blob_name_from_message(json.dumps({"blobName": "analysis/rec.json"}), "padel-videos") is None
    assert blob_name_from_message("not json", "padel-videos") is None
    assert blob_name_from_message("", "padel-videos") is None


def test_recording_id_is_the_file_name():
    assert recording_id_from_blob_name("videos/game/3f2a-11.mp4") == "3f2a-11"


def test_errors_are_described_without_details():
    import av

    from padel_analyzer.worker import describe_error

    error = av.error.InvalidDataError(1094995529, "Invalid data", "/tmp/secret/path.mp4")
    assert describe_error(error) == "The video file couldn't be read"
    assert describe_error(ValueError("The file has no video")) == "The file has no video"
    assert describe_error(KeyError("/tmp/x")) == "Something went wrong (KeyError)"
