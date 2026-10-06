"use server";

import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import {
  CreatePadelGameSchema,
  type CreatePadelGameInput,
  type PadelGameWithRounds,
  PadelMatchScoreSchema,
  padelGameInclude,
  ReorderPadelRoundsSchema,
} from "@/types/padel";
import {
  createPadelSchedule,
  isPadelRoundPlayed,
  isPadelRoundStarted,
} from "@/utils/padel";
import { redirect } from "next/navigation";
import type { z } from "zod";

const requireUser = async () => {
  const session = await getSession();
  if (!session?.user) {
    return redirect("/auth/sign-in");
  }
  return session.user;
};

const getOwnedGame = async (
  gameId: string,
  userId: string,
): Promise<PadelGameWithRounds> => {
  const game = await prisma.padelGame.findUnique({
    where: { id: gameId },
    include: padelGameInclude,
  });
  // Other users' games are reported as missing
  if (!game || game.userId !== userId) {
    throw new Error("Game not found");
  }
  return game;
};

export const getPadelGames = async (): Promise<PadelGameWithRounds[]> => {
  const user = await requireUser();
  return prisma.padelGame.findMany({
    where: { userId: user.id },
    include: padelGameInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getPadelGame = async (
  gameId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  return getOwnedGame(gameId, user.id);
};

export interface PreviousPadelPlayer {
  name: string;
  games: number;
  lastPlayedAt: Date;
}

/** Everyone the user has played with, the most recent first */
export const getPreviousPadelPlayers = async (): Promise<
  PreviousPadelPlayer[]
> => {
  const user = await requireUser();
  const players = await prisma.padelPlayer.findMany({
    where: { game: { userId: user.id } },
    select: { name: true, game: { select: { createdAt: true } } },
    orderBy: [{ game: { createdAt: "desc" } }, { position: "asc" }],
    take: 2000,
  });

  const byName: Record<string, PreviousPadelPlayer> = {};
  const result: PreviousPadelPlayer[] = [];
  for (const player of players) {
    const key = player.name.toLowerCase();
    const existing = byName[key];
    if (existing) {
      existing.games++;
    } else {
      // Players come newest first, so this is the latest spelling
      byName[key] = {
        name: player.name,
        games: 1,
        lastPlayedAt: player.game.createdAt,
      };
      result.push(byName[key]);
    }
  }
  return result.slice(0, 100);
};

export const createPadelGame = async (
  input: CreatePadelGameInput,
): Promise<{ id: string }> => {
  const user = await requireUser();
  const { name, playerNames, courts, pointsPerMatch } =
    CreatePadelGameSchema.parse(input);

  // Ids are made here so everything can be created in two queries
  const gameId = randomUUID();
  const players = playerNames.map((playerName, position) => ({
    id: randomUUID(),
    name: playerName,
    position,
  }));
  const { rounds, matches } = planSeries(
    players.map((player) => player.id),
    courts,
    1,
    0,
  );

  await prisma.$transaction([
    prisma.padelGame.create({
      data: {
        id: gameId,
        name,
        courts,
        pointsPerMatch,
        createdBy: { connect: { id: user.id } },
        players: { createMany: { data: players } },
        rounds: { createMany: { data: rounds } },
      },
    }),
    prisma.padelMatch.createMany({ data: matches }),
  ]);

  return { id: gameId };
};

/** Rounds and matches of a new series, with a freshly shuffled schedule */
const planSeries = (
  playerIds: string[],
  courts: number,
  series: number,
  firstPosition: number,
) => {
  const schedule = createPadelSchedule(playerIds.length, courts);
  const rounds = schedule.map((_, index) => ({
    id: randomUUID(),
    position: firstPosition + index,
    series,
  }));
  const matches = schedule.flatMap((roundMatches, index) =>
    roundMatches.map(([team1, team2], court) => ({
      roundId: rounds[index].id,
      court: court + 1,
      team1: team1.map((player) => playerIds[player]),
      team2: team2.map((player) => playerIds[player]),
    })),
  );
  return { rounds, matches };
};

/**
 * Plays everyone with everyone once more, with the same players but a new
 * random order and new matchups. Only when every match has been played.
 */
export const addPadelSeries = async (
  gameId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  const game = await getOwnedGame(gameId, user.id);
  if (!game.rounds.every(isPadelRoundPlayed)) {
    throw new Error("Finish all matches before starting a new series");
  }

  const { rounds, matches } = planSeries(
    game.players.map((player) => player.id),
    game.courts,
    Math.max(0, ...game.rounds.map((round) => round.series)) + 1,
    game.rounds.length,
  );
  await prisma.$transaction([
    prisma.padelRound.createMany({
      data: rounds.map((round) => ({ ...round, gameId })),
    }),
    prisma.padelMatch.createMany({ data: matches }),
    prisma.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return getOwnedGame(gameId, user.id);
};

export const updatePadelMatchScore = async (
  gameId: string,
  matchId: string,
  input: z.infer<typeof PadelMatchScoreSchema>,
) => {
  const user = await requireUser();
  const { team1Score, team2Score } = PadelMatchScoreSchema.parse(input);
  const game = await getOwnedGame(gameId, user.id);

  const match = game.rounds
    .flatMap((round) => round.matches)
    .find((m) => m.id === matchId);
  if (!match) {
    throw new Error("Match not found");
  }
  if (
    team1Score !== null &&
    team2Score !== null &&
    team1Score + team2Score !== game.pointsPerMatch
  ) {
    throw new Error(`The scores must add up to ${game.pointsPerMatch}`);
  }

  const [updated] = await prisma.$transaction([
    prisma.padelMatch.update({
      where: { id: matchId },
      data: { team1Score, team2Score },
    }),
    prisma.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return updated;
};

/** Changes the play order. Rounds with a score stay where they are. */
export const reorderPadelRounds = async (
  gameId: string,
  input: z.infer<typeof ReorderPadelRoundsSchema>,
) => {
  const user = await requireUser();
  const { roundIds } = ReorderPadelRoundsSchema.parse(input);
  const game = await getOwnedGame(gameId, user.id);

  const current = game.rounds.map((round) => round.id);
  if (
    roundIds.length !== current.length ||
    new Set(roundIds).size !== roundIds.length ||
    roundIds.some((id) => current.indexOf(id) === -1)
  ) {
    throw new Error("The rounds don't match the game, reload and try again");
  }
  game.rounds.forEach((round, index) => {
    if (isPadelRoundStarted(round) && roundIds[index] !== round.id) {
      throw new Error("Rounds that have been played can't be moved");
    }
  });

  const changed = roundIds.flatMap((id, position) =>
    current[position] === id ? [] : [{ id, position }],
  );
  await prisma.$transaction([
    ...changed.map(({ id, position }) =>
      prisma.padelRound.update({ where: { id }, data: { position } }),
    ),
    prisma.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return getOwnedGame(gameId, user.id);
};

export const deletePadelGame = async (gameId: string) => {
  const user = await requireUser();
  await getOwnedGame(gameId, user.id);
  await prisma.padelGame.delete({ where: { id: gameId } });
};
