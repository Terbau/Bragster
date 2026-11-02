// Who may see and change what in a padel space. Not server actions, so they
// can't be called from the browser with someone else's user id.

import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { type PadelGameWithRounds, padelGameInclude } from "@/types/padel";
import { redirect } from "next/navigation";

export const requireUser = async () => {
  const session = await getSession();
  if (!session?.user) {
    return redirect("/auth/sign-in");
  }
  return session.user;
};

/**
 * - `OWNER` made the space, and can change everything in it
 * - `HOST` can create games and keep score
 * - `PLAYER` has their name linked to their account, and can only look
 */
export type PadelSpaceRole = "OWNER" | "HOST" | "PLAYER";

/** The user's role in the space, null when they can't see it */
export const getPadelSpaceRole = async (
  spaceId: string,
  userId: string,
): Promise<PadelSpaceRole | null> => {
  const space = await prisma.padelSpace.findUnique({
    where: { id: spaceId },
    select: {
      ownerId: true,
      hosts: { where: { userId }, select: { userId: true } },
      links: { where: { userId }, select: { userId: true } },
    },
  });
  if (!space) return null;
  if (space.ownerId === userId) return "OWNER";
  if (space.hosts.length > 0) return "HOST";
  if (space.links.length > 0) return "PLAYER";
  return null;
};

export const canHostPadel = (role: PadelSpaceRole | null) =>
  role === "OWNER" || role === "HOST";

/**
 * Throws unless the user has at least the given role. Spaces the user can't
 * see are reported as missing.
 */
export const requirePadelSpaceRole = async (
  spaceId: string,
  userId: string,
  required: PadelSpaceRole,
): Promise<PadelSpaceRole> => {
  const role = await getPadelSpaceRole(spaceId, userId);
  if (!role) {
    throw new Error("Space not found");
  }
  if (required === "OWNER" && role !== "OWNER") {
    throw new Error("Only the owner of the space is allowed to do that");
  }
  if (required === "HOST" && !canHostPadel(role)) {
    throw new Error("Only hosts of the space are allowed to do that");
  }
  return role;
};

export interface PadelGameForUser extends PadelGameWithRounds {
  /** The user's role in the game's space */
  role: PadelSpaceRole;
}

/** A game in a space the user can see. Other games are reported as missing. */
export const getViewableGame = async (
  gameId: string,
  userId: string,
): Promise<PadelGameForUser> => {
  const game = await prisma.padelGame.findUnique({
    where: { id: gameId },
    include: padelGameInclude,
  });
  const role = game ? await getPadelSpaceRole(game.spaceId, userId) : null;
  if (!game || !role) {
    throw new Error("Game not found");
  }
  return { ...game, role };
};

/** A game the user can change, as the owner or a host of its space */
export const getHostedGame = async (
  gameId: string,
  userId: string,
): Promise<PadelGameForUser> => {
  const game = await getViewableGame(gameId, userId);
  if (!canHostPadel(game.role)) {
    throw new Error("Only hosts of the space are allowed to change games");
  }
  return game;
};
