"use server";

import { randomUUID } from "node:crypto";
import {
  createVideoUpload,
  getVideoSize,
  isVideoStorageEnabled,
  queueVideoAnalysis,
  type VideoUpload,
} from "@/lib/azure/storage";
import { prisma } from "@/prisma";
import {
  type CreatePadelRecordingInput,
  CreatePadelRecordingSchema,
  type UpdatePadelRallyInput,
  UpdatePadelRallySchema,
  type UpdatePadelRecordingInput,
  UpdatePadelRecordingSchema,
} from "@/types/padelVideo";
import { readNearTeams } from "@/utils/padelVideo";
import { getOwnedGame, requireUser } from "./_lib/server";
import {
  deleteRecordingFiles,
  loadGameVideos,
  type PadelGameVideos,
  type PadelRecordingView,
  recordingInclude,
  toRecordingView,
} from "./_lib/videos";

const VIDEO_CONTENT_TYPE = "video/mp4";

const requireStorage = () => {
  if (!isVideoStorageEnabled()) {
    throw new Error("Video storage isn't set up");
  }
};

const getOwnedRecording = async (gameId: string, recordingId: string) => {
  const user = await requireUser();
  const game = await getOwnedGame(gameId, user.id);
  const recording = await prisma.padelRecording.findUnique({
    where: { id: recordingId },
    include: recordingInclude,
  });
  if (!recording || recording.gameId !== gameId) {
    throw new Error("Video not found");
  }
  return { game, recording };
};

const getRecordingView = async (gameId: string, recordingId: string) => {
  const { game, recording } = await getOwnedRecording(gameId, recordingId);
  return toRecordingView(game, recording);
};

export const getPadelGameVideos = async (
  gameId: string,
): Promise<PadelGameVideos> => {
  const user = await requireUser();
  return loadGameVideos(await getOwnedGame(gameId, user.id));
};

/**
 * Adds a video filmed with the app, and returns where to upload it. The video
 * starts with `matchId` and is of that match's court.
 */
export const createPadelRecording = async (
  gameId: string,
  input: CreatePadelRecordingInput,
): Promise<{ recording: PadelRecordingView; upload: VideoUpload }> => {
  requireStorage();
  const user = await requireUser();
  const { matchId, recordedAt, duration, sizeBytes, nearTeam } =
    CreatePadelRecordingSchema.parse(input);
  const game = await getOwnedGame(gameId, user.id);
  const match = game.rounds
    .flatMap((round) => round.matches)
    .find((m) => m.id === matchId);
  if (!match) {
    throw new Error("Match not found, reload the game");
  }

  const id = randomUUID();
  const blobName = `videos/${gameId}/${id}.mp4`;
  const recording = await prisma.padelRecording.create({
    data: {
      id,
      gameId,
      matchId,
      court: match.court,
      blobName,
      contentType: VIDEO_CONTENT_TYPE,
      recordedAt,
      duration,
      sizeBytes,
      nearTeams: nearTeam ? { [matchId]: nearTeam } : {},
    },
    include: recordingInclude,
  });
  return {
    recording: await toRecordingView(game, recording),
    upload: await createVideoUpload(blobName, VIDEO_CONTENT_TYPE),
  };
};

/** A new upload link, when the first one has expired */
export const getPadelRecordingUpload = async (
  gameId: string,
  recordingId: string,
): Promise<VideoUpload> => {
  requireStorage();
  const { recording } = await getOwnedRecording(gameId, recordingId);
  if (recording.status !== "UPLOADING") {
    throw new Error("The video has already been uploaded");
  }
  return createVideoUpload(recording.blobName, recording.contentType);
};

/** Called by the app when the upload has finished */
export const markPadelRecordingUploaded = async (
  gameId: string,
  recordingId: string,
): Promise<PadelRecordingView> => {
  requireStorage();
  const { recording } = await getOwnedRecording(gameId, recordingId);
  const size = await getVideoSize(recording.blobName);
  if (size === null) {
    throw new Error("The video hasn't been uploaded");
  }
  if (recording.status === "UPLOADING") {
    // The analyzer may have started already, so only move on from uploading
    await prisma.padelRecording.updateMany({
      where: { id: recordingId, status: "UPLOADING" },
      data: { status: "UPLOADED", sizeBytes: size },
    });
  }
  return getRecordingView(gameId, recordingId);
};

/**
 * Sets the match the video starts with, how many matches it covers, or the
 * team nearest the camera
 */
export const updatePadelRecording = async (
  gameId: string,
  recordingId: string,
  input: UpdatePadelRecordingInput,
): Promise<PadelRecordingView> => {
  const changes = UpdatePadelRecordingSchema.parse(input);
  const { game, recording } = await getOwnedRecording(gameId, recordingId);

  const firstMatch =
    changes.matchId === undefined
      ? undefined
      : game.rounds
          .flatMap((round) => round.matches)
          .find((match) => match.id === changes.matchId);
  if (changes.matchId !== undefined && !firstMatch) {
    throw new Error("Match not found, reload the game");
  }

  const nearTeams = readNearTeams(recording.nearTeams);
  if (changes.nearTeam) {
    const { matchId, team } = changes.nearTeam;
    if (team === null) {
      delete nearTeams[matchId];
    } else {
      nearTeams[matchId] = team;
    }
  }
  await prisma.padelRecording.update({
    where: { id: recordingId },
    data: {
      ...(firstMatch && { matchId: firstMatch.id, court: firstMatch.court }),
      ...(changes.matchCount !== undefined && {
        matchCount: changes.matchCount,
      }),
      nearTeams,
    },
  });
  return getRecordingView(gameId, recordingId);
};

/** Says who won a rally, or that it wasn't a point */
export const updatePadelRally = async (
  gameId: string,
  recordingId: string,
  rallyId: string,
  input: UpdatePadelRallyInput,
): Promise<PadelRecordingView> => {
  const changes = UpdatePadelRallySchema.parse(input);
  const { game, recording } = await getOwnedRecording(gameId, recordingId);
  if (!recording.rallies.some((rally) => rally.id === rallyId)) {
    throw new Error("Rally not found");
  }
  if (
    changes.winner &&
    !game.rounds.some((round) =>
      round.matches.some((match) => match.id === changes.winner?.matchId),
    )
  ) {
    throw new Error("Match not found, reload the game");
  }

  await prisma.padelRally.update({
    where: { id: rallyId },
    data: {
      ...(changes.winner !== undefined && {
        winnerMatchId: changes.winner?.matchId ?? null,
        winnerTeam: changes.winner?.team ?? null,
      }),
      ...(changes.isIgnored !== undefined && { isIgnored: changes.isIgnored }),
    },
  });
  return getRecordingView(gameId, recordingId);
};

/** Finds the rallies again, keeping who won the rallies that are found again */
export const analyzePadelRecording = async (
  gameId: string,
  recordingId: string,
): Promise<PadelRecordingView> => {
  requireStorage();
  const { recording } = await getOwnedRecording(gameId, recordingId);
  if (recording.status === "UPLOADING") {
    throw new Error("The video is still uploading");
  }
  await queueVideoAnalysis(recording.blobName);
  await prisma.padelRecording.update({
    where: { id: recordingId },
    data: { status: "UPLOADED", error: null },
  });
  return getRecordingView(gameId, recordingId);
};

export const deletePadelRecording = async (
  gameId: string,
  recordingId: string,
) => {
  const { recording } = await getOwnedRecording(gameId, recordingId);
  await deleteRecordingFiles([recording]);
  await prisma.padelRecording.delete({ where: { id: recordingId } });
};
