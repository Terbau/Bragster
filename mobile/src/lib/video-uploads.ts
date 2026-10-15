import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { useSyncExternalStore } from "react";
import { ApiError, api, getErrorMessage } from "./api";
import type { PadelRecording, PadelTeamNumber, PadelVideoUpload } from "./types";

// Videos filmed with the app are kept on the phone until they are uploaded.
// Uploads run in an iOS background session, so they go on while the app is
// in the background, and are tried again when the app is opened.

const STORAGE_KEY = "padel-video-uploads";
const VIDEO_DIRECTORY = `${FileSystem.documentDirectory}padel-videos/`;

interface PendingVideo {
  key: string;
  gameId: string;
  /** The match the video starts with */
  matchId: string;
  fileUri: string;
  recordedAt: string;
  /** Seconds */
  duration: number;
  sizeBytes: number;
  nearTeam?: PadelTeamNumber;
  /** Set when the video has been added on the website */
  recordingId?: string;
  upload?: PadelVideoUpload;
}

export interface VideoUploadState {
  key: string;
  gameId: string;
  recordingId?: string;
  recordedAt: string;
  duration: number;
  sizeBytes: number;
  status: "waiting" | "uploading" | "failed";
  /** 0 to 1 */
  progress: number;
  error?: string;
}

let pending: PendingVideo[] = [];
let states: Record<string, Pick<VideoUploadState, "status" | "progress" | "error">> = {};
let snapshot: VideoUploadState[] = [];
let isLoaded = false;
let isRunning = false;
const listeners = new Set<() => void>();
const finishedListeners = new Set<(gameId: string) => void>();

const emit = () => {
  snapshot = pending.map((video) => {
    const state = states[video.key] as (typeof states)[string] | undefined;
    return {
      key: video.key,
      gameId: video.gameId,
      recordingId: video.recordingId,
      recordedAt: video.recordedAt,
      duration: video.duration,
      sizeBytes: video.sizeBytes,
      status: state?.status ?? "waiting",
      progress: state?.progress ?? 0,
      error: state?.error,
    };
  });
  for (const listener of listeners) listener();
};

const setState = (key: string, state: (typeof states)[string]) => {
  states = { ...states, [key]: state };
  emit();
};

const save = () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pending));

const load = async () => {
  if (isLoaded) return;
  isLoaded = true;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    pending = stored ? (JSON.parse(stored) as PendingVideo[]) : [];
  } catch {
    pending = [];
  }
  emit();
};

const videosPath = (video: PendingVideo, path = "") =>
  `/api/mobile/padel/games/${video.gameId}/videos${path}`;

const remove = async (video: PendingVideo) => {
  pending = pending.filter((v) => v.key !== video.key);
  const { [video.key]: _, ...rest } = states;
  states = rest;
  await save();
  await FileSystem.deleteAsync(video.fileUri, { idempotent: true });
  emit();
  for (const listener of finishedListeners) listener(video.gameId);
};

const isGone = (error: unknown) => error instanceof ApiError && error.status === 404;

const upload = async (video: PendingVideo) => {
  setState(video.key, { status: "uploading", progress: 0 });

  if (!video.recordingId) {
    const created = await api<{ recording: PadelRecording; upload: PadelVideoUpload }>(
      videosPath(video),
      {
        method: "POST",
        body: {
          matchId: video.matchId,
          recordedAt: video.recordedAt,
          duration: video.duration,
          sizeBytes: video.sizeBytes,
          nearTeam: video.nearTeam,
        },
      },
    );
    video.recordingId = created.recording.id;
    video.upload = created.upload;
    await save();
    for (const listener of finishedListeners) listener(video.gameId);
  } else {
    // An upload can have finished while the app was closed
    try {
      await api(videosPath(video, `/${video.recordingId}/uploaded`), { method: "POST" });
      await remove(video);
      return;
    } catch (error) {
      if (isGone(error)) {
        await remove(video);
        return;
      }
    }
    // The first link may have expired
    video.upload = await api<PadelVideoUpload>(
      videosPath(video, `/${video.recordingId}/upload`),
      { method: "POST" },
    );
    await save();
  }

  const target = video.upload;
  if (!target) throw new Error("No upload link");
  const task = FileSystem.createUploadTask(
    target.url,
    video.fileUri,
    {
      httpMethod: target.method,
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
      headers: target.headers,
    },
    ({ totalBytesSent, totalBytesExpectedToSend }) =>
      setState(video.key, {
        status: "uploading",
        progress:
          totalBytesExpectedToSend > 0 ? totalBytesSent / totalBytesExpectedToSend : 0,
      }),
  );
  const result = await task.uploadAsync();
  if (!result || result.status < 200 || result.status >= 300) {
    throw new Error(`The upload failed (${result?.status ?? "no answer"})`);
  }
  await api(videosPath(video, `/${video.recordingId}/uploaded`), { method: "POST" });
  await remove(video);
};

/** Uploads the videos waiting on the phone, one at a time */
export const processVideoUploads = async () => {
  await load();
  if (isRunning) return;
  isRunning = true;
  try {
    for (const video of pending.slice()) {
      try {
        const info = await FileSystem.getInfoAsync(video.fileUri);
        if (!info.exists) {
          await remove(video);
          continue;
        }
        await upload(video);
      } catch (error) {
        if (isGone(error)) {
          await remove(video);
        } else {
          setState(video.key, {
            status: "failed",
            progress: 0,
            error: getErrorMessage(error),
          });
        }
      }
    }
  } finally {
    isRunning = false;
  }
};

/** The largest video the app can upload, a little under Azure's 5000 MiB */
export const MAX_APP_UPLOAD_BYTES = 4_800_000_000;

/**
 * Keeps a video that was just filmed or picked, and starts uploading it. The
 * file is moved, so it stays until it has been uploaded.
 */
export const queueVideoUpload = async ({
  uri,
  gameId,
  matchId,
  recordedAt,
  duration,
  nearTeam,
}: {
  uri: string;
  gameId: string;
  matchId: string;
  recordedAt: Date;
  /** Seconds */
  duration: number;
  nearTeam?: PadelTeamNumber;
}) => {
  await load();
  await FileSystem.makeDirectoryAsync(VIDEO_DIRECTORY, { intermediates: true }).catch(
    () => {},
  );
  const key = Crypto.randomUUID();
  const extension = /\.(mov|mp4|m4v)$/i.exec(uri)?.[0].toLowerCase() ?? ".mov";
  const fileUri = `${VIDEO_DIRECTORY}${key}${extension}`;
  await FileSystem.moveAsync({ from: uri, to: fileUri });
  const info = await FileSystem.getInfoAsync(fileUri);
  pending = [
    ...pending,
    {
      key,
      gameId,
      matchId,
      fileUri,
      recordedAt: recordedAt.toISOString(),
      duration,
      sizeBytes: info.exists ? info.size : 0,
      nearTeam,
    },
  ];
  await save();
  emit();
  void processVideoUploads();
};

/** Deletes a video that hasn't been uploaded yet */
export const discardVideoUpload = async (key: string) => {
  const video = pending.find((v) => v.key === key);
  if (!video) return;
  if (video.recordingId) {
    await api(videosPath(video, `/${video.recordingId}`), { method: "DELETE" }).catch(
      () => {},
    );
  }
  await remove(video);
};

/** Called with the game id when a video has been added or uploaded */
export const onVideoUploadChange = (listener: (gameId: string) => void) => {
  finishedListeners.add(listener);
  return () => {
    finishedListeners.delete(listener);
  };
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
};

/** Videos of the game waiting to be uploaded from this phone */
export const useVideoUploads = (gameId: string) => {
  const all = useSyncExternalStore(subscribe, () => snapshot);
  return all.filter((upload) => upload.gameId === gameId);
};
