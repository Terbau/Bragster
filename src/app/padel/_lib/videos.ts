import type { Prisma } from "@/lib/generated/prisma";
import {
  createVideoUrl,
  deleteVideoFiles,
  isVideoStorageEnabled,
} from "@/lib/azure/storage";
import { prisma } from "@/prisma";
import type { PadelGameWithRounds } from "@/types/padel";
import {
  addPadelVideoRally,
  emptyPadelVideoStats,
  layOutPadelVideo,
  type PadelVideoLayout,
  type PadelVideoStats,
} from "@/utils/padelVideo";

export const recordingInclude = {
  rallies: { orderBy: { start: "asc" } },
} satisfies Prisma.PadelRecordingInclude;

export type RecordingWithRallies = Prisma.PadelRecordingGetPayload<{
  include: typeof recordingInclude;
}>;

export type PadelRecordingStatus = RecordingWithRallies["status"];

export interface PadelRecordingView extends PadelVideoLayout {
  id: string;
  gameId: string;
  court: number;
  firstMatchId: string | null;
  status: PadelRecordingStatus;
  error: string | null;
  /** Seconds */
  duration: number | null;
  sizeBytes: number | null;
  recordedAt: Date;
  /** Null until the video is uploaded */
  videoUrl: string | null;
}

export interface PadelGameVideos {
  /** False when video storage isn't set up, see /infra */
  isEnabled: boolean;
  recordings: PadelRecordingView[];
  /** All filmed rallies of the game */
  stats: PadelVideoStats;
}

/** The analysis file the analyzer stores next to the video */
const analysisBlobName = (recordingId: string) =>
  `analysis/${recordingId}.json`;

export const toRecordingView = async (
  game: PadelGameWithRounds,
  recording: RecordingWithRallies,
): Promise<PadelRecordingView> => ({
  id: recording.id,
  gameId: recording.gameId,
  court: recording.court,
  firstMatchId: recording.matchId,
  status: recording.status,
  error: recording.error,
  duration: recording.duration,
  sizeBytes: recording.sizeBytes === null ? null : Number(recording.sizeBytes),
  recordedAt: recording.recordedAt,
  videoUrl:
    recording.status === "UPLOADING"
      ? null
      : await createVideoUrl(recording.blobName),
  ...layOutPadelVideo(game, recording),
});

export const loadGameVideos = async (
  game: PadelGameWithRounds,
): Promise<PadelGameVideos> => {
  const stats = emptyPadelVideoStats();
  if (!isVideoStorageEnabled()) {
    return { isEnabled: false, recordings: [], stats };
  }
  const recordings = await Promise.all(
    (
      await prisma.padelRecording.findMany({
        where: { gameId: game.id },
        include: recordingInclude,
        orderBy: { recordedAt: "asc" },
      })
    ).map((recording) => toRecordingView(game, recording)),
  );
  for (const recording of recordings) {
    for (const rally of [
      ...recording.matches.flatMap((match) => match.rallies),
      ...recording.unplaced,
    ]) {
      addPadelVideoRally(stats, rally);
    }
  }
  return { isEnabled: true, recordings, stats };
};

/** Deletes the files of the videos, before the recordings are deleted */
export const deleteRecordingFiles = async (
  recordings: { id: string; blobName: string }[],
) => {
  if (recordings.length === 0 || !isVideoStorageEnabled()) return;
  await deleteVideoFiles(
    recordings.flatMap((recording) => [
      recording.blobName,
      analysisBlobName(recording.id),
    ]),
  );
};
