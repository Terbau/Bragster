"""
Analyses the videos waiting in the queue and sends the rallies to Bragster.

A message is added to the queue by Event Grid when a video has been uploaded,
or by Bragster when someone asks for a video to be analysed again. Each run
handles at most MAX_MESSAGES messages and stops when the queue is empty.
"""

from __future__ import annotations

import base64
import binascii
import json
import logging
import os
import urllib.error
import urllib.request
from pathlib import PurePosixPath

import av
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.storage.queue import QueueClient

from .analysis import analyze
from .blob_file import AzureBlobRange, BlobFile
from .rallies import BIN_SECONDS, activity

log = logging.getLogger("padel_analyzer")

# A failing video is tried this many times before it is reported as failed
MAX_ATTEMPTS = 3
# Long videos take a while, so other runs leave the message alone meanwhile
VISIBILITY_TIMEOUT_SECONDS = 7 * 60 * 60
RETRY_DELAY_SECONDS = 60
VIDEO_PREFIX = "videos/"
ANALYSIS_PREFIX = "analysis/"


def describe_error(error: Exception) -> str:
    """A message for the app, without file paths or other details"""
    if isinstance(error, av.error.InvalidDataError):
        return "The video file couldn't be read"
    if isinstance(error, ValueError) and str(error):
        return str(error)
    return f"Something went wrong ({type(error).__name__})"


def _env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if not value:
        raise RuntimeError(f"Set the {name} environment variable")
    return value


def _decode(content: str) -> object:
    """Event Grid sends base64 encoded JSON, Bragster sends plain JSON"""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(base64.b64decode(content, validate=True))
    except (binascii.Error, ValueError):
        return None


def blob_name_from_message(content: str, container: str) -> str | None:
    """The name of the uploaded video in the message, if it is one"""
    message = _decode(content)
    if isinstance(message, list):
        message = message[0] if message else None
    if not isinstance(message, dict):
        return None

    name = message.get("blobName")
    # An Event Grid BlobCreated event
    subject = message.get("subject")
    if not name and isinstance(subject, str):
        prefix = f"/blobServices/default/containers/{container}/blobs/"
        if subject.startswith(prefix):
            name = subject[len(prefix) :]
    if isinstance(name, str) and name.startswith(VIDEO_PREFIX):
        return name
    return None


def recording_id_from_blob_name(name: str) -> str:
    """Videos are stored as videos/<game id>/<recording id>.<extension>"""
    return PurePosixPath(name).stem


class Bragster:
    def __init__(self, url: str, secret: str):
        self.url = url.rstrip("/") + "/api/padel/video-analysis"
        self.secret = secret

    def report(self, body: dict) -> bool:
        """Sends a status or result. False when the video has been deleted."""
        request = urllib.request.Request(
            self.url,
            data=json.dumps(body).encode(),
            method="POST",
            headers={
                "Authorization": f"Bearer {self.secret}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=60):
                return True
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return False
            raise


def _timeline_json(timeline, result: dict) -> bytes:
    """What the rallies were found from, kept next to the video for tuning"""

    def rounded(values, digits=4):
        return [None if value != value else round(float(value), digits) for value in values]

    return json.dumps(
        {
            **result,
            "sampleRate": 1 / timeline.step,
            "motion": rounded(timeline.motion),
            "ball": rounded(timeline.ball, 0),
            "ballArea": rounded(timeline.ball_area, 1),
            "hits": rounded(timeline.hits, 0),
            "activityStep": BIN_SECONDS,
            "activity": rounded(activity(timeline), 3),
        }
    ).encode()


def handle(blob_service: BlobServiceClient, container: str, name: str, bragster: Bragster) -> None:
    recording_id = recording_id_from_blob_name(name)
    if not bragster.report({"recordingId": recording_id, "status": "ANALYZING"}):
        log.info("Recording %s is deleted, skipping it", recording_id)
        return

    # The video is read straight from storage a piece at a time, so it
    # doesn't have to fit on the job's disk
    blob = blob_service.get_blob_client(container, name)
    size = blob.get_blob_properties().size
    log.info("Analysing %s (%.0f MB)", name, size / 1e6)
    result, timeline, rallies = analyze(BlobFile(AzureBlobRange(blob), size))

    blob_service.get_blob_client(
        container, f"{ANALYSIS_PREFIX}{recording_id}.json"
    ).upload_blob(
        _timeline_json(timeline, result),
        overwrite=True,
        content_settings=ContentSettings(content_type="application/json"),
    )
    bragster.report({"recordingId": recording_id, "status": "READY", "result": result})
    log.info("Found %d rallies in %s", len(rallies), name)


def run() -> None:
    connection = _env("AZURE_STORAGE_CONNECTION_STRING")
    container = _env("VIDEO_CONTAINER_NAME", "padel-videos")
    queue = QueueClient.from_connection_string(
        connection, _env("ANALYSIS_QUEUE_NAME", "padel-video-analysis")
    )
    blob_service = BlobServiceClient.from_connection_string(connection)
    bragster = Bragster(_env("BRAGSTER_URL"), _env("PADEL_ANALYZER_SECRET"))
    max_messages = int(_env("MAX_MESSAGES", "1"))

    for _ in range(max_messages):
        messages = list(
            queue.receive_messages(
                max_messages=1, visibility_timeout=VISIBILITY_TIMEOUT_SECONDS
            )
        )
        if not messages:
            log.info("The queue is empty")
            return
        message = messages[0]
        name = blob_name_from_message(message.content, container)
        if name is None:
            log.info("Skipping a message that isn't about a video")
            queue.delete_message(message)
            continue

        try:
            handle(blob_service, container, name, bragster)
        except Exception as error:
            log.exception("Analysing %s failed", name)
            if (message.dequeue_count or 1) >= MAX_ATTEMPTS:
                try:
                    bragster.report(
                        {
                            "recordingId": recording_id_from_blob_name(name),
                            "status": "FAILED",
                            "error": describe_error(error),
                        }
                    )
                finally:
                    queue.delete_message(message)
            else:
                # Try again in a minute
                queue.update_message(message, visibility_timeout=RETRY_DELAY_SECONDS)
            continue
        queue.delete_message(message)
