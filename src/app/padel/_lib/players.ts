// Player statistics, loaded for a given user. Not server actions, so they
// can't be called from the browser with someone else's user id.

import { isVideoStorageEnabled } from "@/lib/azure/storage";
import { prisma } from "@/prisma";
import { padelGameInclude } from "@/types/padel";
import {
  buildPadelPlayerProfile,
  buildPadelPlayerSummaries,
  type PadelPlayerProfile,
} from "@/utils/padelStats";
import {
  buildPadelPlayerVideoStats,
  type PadelPlayerVideoStats,
} from "@/utils/padelVideo";
import { recordingInclude } from "./videos";

export interface PadelPlayerProfileWithVideo extends PadelPlayerProfile {
  /** Null when the player hasn't been filmed */
  video: PadelPlayerVideoStats | null;
}

/** All the user's games, oldest first */
export const getAllPadelGames = (userId: string) =>
  prisma.padelGame.findMany({
    where: { userId },
    include: padelGameInclude,
    orderBy: { createdAt: "asc" },
  });

/** Everyone the user has played with, highest rating first */
export const loadPadelPlayerSummaries = async (userId: string) =>
  buildPadelPlayerSummaries(await getAllPadelGames(userId));

/** `key` is the player's name, in any case. Null when there's no such player. */
export const loadPadelPlayerProfile = async (
  userId: string,
  key: string,
): Promise<PadelPlayerProfileWithVideo | null> => {
  const games = await getAllPadelGames(userId);
  const profile = buildPadelPlayerProfile(games, key);
  if (!profile) return null;

  const recordings = isVideoStorageEnabled()
    ? await prisma.padelRecording.findMany({
        where: { game: { userId }, status: "READY" },
        include: recordingInclude,
      })
    : [];
  const video = buildPadelPlayerVideoStats(
    recordings.flatMap((recording) => {
      const game = games.find((g) => g.id === recording.gameId);
      return game ? [{ game, recording }] : [];
    }),
    key,
  );
  return { ...profile, video };
};

/** The user who shared their players with this token, if any */
export const findPadelPlayersOwner = async (token: string) => {
  const share = await prisma.padelPlayersShare.findUnique({
    where: { token },
    select: { userId: true },
  });
  return share?.userId ?? null;
};
