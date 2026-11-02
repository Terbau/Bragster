// Player statistics, loaded for a given space. Not server actions, so they
// can't be called from the browser with a space the user can't see.

import { prisma } from "@/prisma";
import { padelGameInclude } from "@/types/padel";
import {
  buildPadelPlayerProfile,
  buildPadelPlayerSummaries,
  type PadelPlayerProfile,
} from "@/utils/padelStats";

/** All the space's games, oldest first */
export const getAllPadelGames = (spaceId: string) =>
  prisma.padelGame.findMany({
    where: { spaceId },
    include: padelGameInclude,
    orderBy: { createdAt: "asc" },
  });

/** Everyone who has played in the space, highest rating first */
export const loadPadelPlayerSummaries = async (spaceId: string) =>
  buildPadelPlayerSummaries(await getAllPadelGames(spaceId));

/** `key` is the player's name, in any case. Null when there's no such player. */
export const loadPadelPlayerProfile = async (
  spaceId: string,
  key: string,
): Promise<PadelPlayerProfile | null> =>
  buildPadelPlayerProfile(await getAllPadelGames(spaceId), key);

/** The space whose players are shared with this token, if any */
export const findSharedPadelSpace = (token: string) =>
  prisma.padelSpace.findUnique({
    where: { shareToken: token },
    select: { id: true, name: true },
  });
