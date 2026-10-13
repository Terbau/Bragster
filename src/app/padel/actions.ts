"use server";

import { randomBytes, randomUUID } from "node:crypto";
import type { Prisma } from "@/lib/generated/prisma";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import {
  CreatePadelGameSchema,
  type CreatePadelGameInput,
  type PadelGameWithRounds,
  PadelMatchScoreSchema,
  padelGameInclude,
  ReorderPadelRoundsSchema,
  UpdatePadelGameSchema,
  type UpdatePadelGameInput,
} from "@/types/padel";
import {
  createPadelSchedule,
  drawMexicanoRound,
  isPadelRoundPlayed,
  isPadelRoundStarted,
  type PadelDrawnMatch,
  padelSeed,
} from "@/utils/padel";
import {
  buildPadelPlayerProfile,
  buildPadelPlayerSummaries,
  type PadelPlayerProfile,
  type PadelPlayerSummary,
} from "@/utils/padelStats";
import { redirect } from "next/navigation";
import type { z } from "zod";

type Transaction = Prisma.TransactionClient;

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

/**
 * Locks the game until the transaction ends, so changes to the same game made
 * at the same time (like two scores saved at once) run one after the other.
 */
const lockGame = (tx: Transaction, gameId: string) =>
  tx.$queryRaw`SELECT "id" FROM "PadelGame" WHERE "id" = ${gameId} FOR UPDATE`;

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
  const {
    name,
    format,
    playerNames,
    courts,
    courtNames,
    pointsPerMatch,
    plannedRounds,
  } = CreatePadelGameSchema.parse(input);

  // Ids are made here so everything can be created in two queries
  const gameId = randomUUID();
  const players = playerNames.map((playerName, position) => ({
    id: randomUUID(),
    name: playerName,
    position,
  }));
  const isMexicano = format === "MEXICANO";
  // A Mexicano starts with a random first round, the rest are drawn later
  const { rounds, matches } = isMexicano
    ? drawRound({ id: gameId, courts, players, rounds: [] }, 0)
    : planSeries(
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
        format,
        courts,
        courtNames,
        pointsPerMatch,
        plannedRounds: isMexicano ? plannedRounds : null,
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

// Mexicano

type DrawGame = Parameters<typeof drawMexicanoRound>[0] & { id: string };

/** The next Mexicano round, drawn from the scores of the rounds so far */
const drawRound = (game: DrawGame, position: number) => {
  const round = { id: randomUUID(), position, series: 1 };
  const matches = drawMexicanoRound(game, padelSeed(game.id)).map(
    (match, index) => ({
      roundId: round.id,
      court: index + 1,
      team1: match.team1,
      team2: match.team2,
    }),
  );
  return { rounds: [round], matches };
};

const isSameDraw = (
  drawn: PadelDrawnMatch[],
  matches: { team1: string[]; team2: string[] }[],
) =>
  drawn.length === matches.length &&
  drawn.every(
    (match, index) =>
      match.team1.join() === matches[index].team1.join() &&
      match.team2.join() === matches[index].team2.join(),
  );

/**
 * Keeps the rounds of a Mexicano in step with the scores. The next round is
 * drawn as soon as every match so far has a score, and drawn again when a
 * score changes before it has started. A round drawn before a score was
 * cleared, or beyond the planned number of rounds, is removed.
 */
const syncMexicanoRounds = async (tx: Transaction, gameId: string) => {
  const game = await tx.padelGame.findUniqueOrThrow({
    where: { id: gameId },
    include: padelGameInclude,
  });
  if (game.format !== "MEXICANO") return;
  const planned = game.plannedRounds ?? game.rounds.length;
  const seed = padelSeed(game.id);

  let rounds = game.rounds;
  const removed: string[] = [];
  // The first round is random, so it stays
  while (rounds.length > 1) {
    const last = rounds[rounds.length - 1];
    const earlier = rounds.slice(0, -1);
    if (
      isPadelRoundStarted(last) ||
      (rounds.length <= planned &&
        earlier.every(isPadelRoundPlayed) &&
        isSameDraw(
          drawMexicanoRound({ ...game, rounds: earlier }, seed),
          last.matches,
        ))
    ) {
      break;
    }
    removed.push(last.id);
    rounds = earlier;
  }

  if (removed.length > 0) {
    await tx.padelRound.deleteMany({ where: { id: { in: removed } } });
  }
  if (rounds.length < planned && rounds.every(isPadelRoundPlayed)) {
    const next = drawRound(
      { ...game, rounds },
      Math.max(-1, ...rounds.map((round) => round.position)) + 1,
    );
    await tx.padelRound.createMany({
      data: next.rounds.map((round) => ({ ...round, gameId })),
    });
    await tx.padelMatch.createMany({ data: next.matches });
  }
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
  if (game.format === "MEXICANO") {
    throw new Error("Add more rounds to a Mexicano instead");
  }
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

  if (
    team1Score !== null &&
    team2Score !== null &&
    team1Score + team2Score !== game.pointsPerMatch
  ) {
    throw new Error(`The scores must add up to ${game.pointsPerMatch}`);
  }

  return prisma.$transaction(async (tx) => {
    await lockGame(tx, gameId);
    // A Mexicano round can have been drawn again in the meantime
    const match = await tx.padelMatch.findFirst({
      where: { id: matchId, round: { gameId } },
    });
    if (!match) {
      throw new Error("Match not found, reload the game");
    }
    const updated = await tx.padelMatch.update({
      where: { id: matchId },
      data: { team1Score, team2Score },
    });
    await tx.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    });
    if (game.format === "MEXICANO") {
      await syncMexicanoRounds(tx, gameId);
    }
    return updated;
  });
};

/** Changes the play order. Rounds with a score stay where they are. */
export const reorderPadelRounds = async (
  gameId: string,
  input: z.infer<typeof ReorderPadelRoundsSchema>,
) => {
  const user = await requireUser();
  const { roundIds } = ReorderPadelRoundsSchema.parse(input);
  const game = await getOwnedGame(gameId, user.id);
  if (game.format === "MEXICANO") {
    throw new Error("Mexicano rounds are drawn one at a time");
  }

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

/**
 * Renames the game or its players, names the courts, or changes the number of
 * rounds of a Mexicano.
 */
export const updatePadelGame = async (
  gameId: string,
  input: UpdatePadelGameInput,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  const changes = UpdatePadelGameSchema.parse(input);
  await getOwnedGame(gameId, user.id);

  await prisma.$transaction(async (tx) => {
    await lockGame(tx, gameId);
    const game = await tx.padelGame.findUniqueOrThrow({
      where: { id: gameId },
      include: padelGameInclude,
    });
    const data: Prisma.PadelGameUpdateInput = { updatedAt: new Date() };

    if (changes.name !== undefined) {
      data.name = changes.name;
    }
    if (changes.courtNames !== undefined) {
      if (changes.courtNames.length > game.courts) {
        throw new Error("There are more court names than courts");
      }
      data.courtNames = changes.courtNames;
    }
    if (changes.plannedRounds !== undefined) {
      if (game.format !== "MEXICANO") {
        throw new Error("Only the number of Mexicano rounds can be changed");
      }
      const started = game.rounds.filter(isPadelRoundStarted).length;
      if (changes.plannedRounds < started) {
        throw new Error(`${started} rounds have already been played`);
      }
      data.plannedRounds = changes.plannedRounds;
    }
    if (changes.players) {
      const newNames: Record<string, string> = {};
      for (const { id, name } of changes.players) {
        if (!game.players.some((player) => player.id === id)) {
          throw new Error("Player not found");
        }
        newNames[id] = name;
      }
      const names = game.players.map((player) =>
        (newNames[player.id] ?? player.name).toLowerCase(),
      );
      if (new Set(names).size !== names.length) {
        throw new Error("Two players have the same name");
      }
      const renamed = game.players.filter(
        (player) =>
          newNames[player.id] !== undefined &&
          newNames[player.id] !== player.name,
      );
      // Names are unique within a game, so players swapping names go through
      // a temporary name first
      for (const player of renamed) {
        await tx.padelPlayer.update({
          where: { id: player.id },
          data: { name: `~${player.id}` },
        });
      }
      for (const player of renamed) {
        await tx.padelPlayer.update({
          where: { id: player.id },
          data: { name: newNames[player.id] },
        });
      }
    }

    await tx.padelGame.update({ where: { id: gameId }, data });
    if (game.format === "MEXICANO") {
      await syncMexicanoRounds(tx, gameId);
    }
  });

  return getOwnedGame(gameId, user.id);
};

/**
 * Turns the live link on or off. Anyone with the link can follow the scores,
 * and turning it on again makes a new link.
 */
export const setPadelGameSharing = async (
  gameId: string,
  isShared: boolean,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  const game = await getOwnedGame(gameId, user.id);
  if (isShared !== (game.shareToken !== null)) {
    await prisma.padelGame.update({
      where: { id: gameId },
      data: {
        shareToken: isShared ? randomBytes(12).toString("base64url") : null,
      },
    });
  }
  return getOwnedGame(gameId, user.id);
};

// Player statistics

const getAllGames = (userId: string) =>
  prisma.padelGame.findMany({
    where: { userId },
    include: padelGameInclude,
    orderBy: { createdAt: "asc" },
  });

/** Everyone the user has played with, highest rating first */
export const getPadelPlayerSummaries = async (): Promise<
  PadelPlayerSummary[]
> => {
  const user = await requireUser();
  return buildPadelPlayerSummaries(await getAllGames(user.id));
};

/** `key` is the player's name, in any case */
export const getPadelPlayerProfile = async (
  key: string,
): Promise<PadelPlayerProfile> => {
  const user = await requireUser();
  const profile = buildPadelPlayerProfile(await getAllGames(user.id), key);
  if (!profile) {
    throw new Error("Player not found");
  }
  return profile;
};
