# Padel analyzer

Finds the rallies in padel videos filmed with the Bragster app, and guesses
who won each one. It runs as an Azure Container Apps job that starts when a
video is uploaded (see `../infra`).

## How it works

1. **Signals** (`features.py`). Ten times per second it measures how much of
   the picture changed, and looks for small, fast, yellow blobs that may be
   the ball. It also counts sharp sounds in the 2–7 kHz band, which is where
   the ball being hit is heard.
2. **Rallies** (`rallies.py`). The signals are compared with the rest of the
   same video. A signal that clearly switches between two levels counts more
   than one that is noisy all the time, like music in the hall. A rally
   starts when the activity goes clearly above the usual level, and lasts
   while it stays above it. Short pauses (a high lob) don't end it, and
   stretches over a minute are split at their quietest moment.
3. **Who won** (also `rallies.py`). Where the ball was last seen hints at who
   lost the point. Close to the camera the ball looks bigger. This is only a
   weak guess (between 30% and 70%).

The website then places the rallies in the matches, and adjusts the guesses
to the score that was entered (`src/utils/padelVideo.ts`). A rally is only
labelled when the result is at least 90% likely, otherwise it says "Not sure".
Everything someone corrects by hand is kept, also when a video is analysed
again.

## Run it on a video

```bash
cd analyzer
uv run python -m padel_analyzer analyze path/to/video.mov --debug activity.png
```

It prints the rallies as JSON. `activity.png` draws the activity over time,
with the rallies it found shaded. That makes it easy to see why a rally was
missed or found where there was none, and to tune the constants at the top of
`rallies.py`.

In Azure, the worker reads each video straight from storage with a
short-lived link instead of downloading it, so even big uploaded videos don't
have to fit on the job's disk. With more than 25 frames per second, frames that
no other frame depends on aren't decoded, which roughly halves the work for
60 fps video.

The analyzer also stores the signals of every video it analyses as
`padel-videos/analysis/<recording id>.json`, so they can be looked at later.

## Tests

```bash
uv run pytest
```

`tests/test_features.py` uses the clips in `../mobile/example_videos` when
they are there.

## Worker settings

| Variable | |
|---|---|
| `AZURE_STORAGE_CONNECTION_STRING` | Where the videos and the queue are |
| `VIDEO_CONTAINER_NAME` | Default `padel-videos` |
| `ANALYSIS_QUEUE_NAME` | Default `padel-video-analysis` |
| `BRAGSTER_URL` | The website, like `https://bragster.vercel.app` |
| `PADEL_ANALYZER_SECRET` | The same as the website's |
| `MAX_MESSAGES` | Videos per run, default 1 |

Bump `VERSION` in `rallies.py` when the results change. To analyse an old
video again, use "Find the rallies again" on the video page.
