"use server";

import { randomBytes, randomUUID } from "node:crypto";
import type { Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import {
  CreatePadelGameSchema,
  type CreatePadelGameInput,
  LinkPadelPlayerSchema,
  type PadelGameWithRounds,
  PadelMatchScoreSchema,
  padelGameInclude,
  PadelSpaceSchema,
  ReorderPadelRoundsSchema,
  UpdatePadelGameSchema,
  type UpdatePadelGameInput,
} from "@/types/padel";
import {
  createPadelSchedule,
  drawMexicanoRound,
  getCurrentPadelSeries,
  getPadelUpNext,
  isPadelMatchPlayed,
  isPadelRoundPlayed,
  isPadelRoundStarted,
  type PadelDrawnMatch,
  type PadelScheduleOptions,
  type PadelTeam,
  padelExtraSitOuts,
  padelSeed,
  pickPadelSitOutMore,
} from "@/utils/padel";
import {
  buildPadelMatchRatings,
  buildPadelPlayerSummaries,
  PADEL_START_RATING,
  type PadelMatchRating,
  type PadelPlayerProfile,
  type PadelPlayerSummary,
  padelPlayerKey,
} from "@/utils/padelStats";
import type { z } from "zod";
import {
  getAllPadelGames,
  loadPadelPlayerProfile,
  loadPadelPlayerSummaries,
} from "./_lib/players";
import {
  getHostedGame,
  getViewableGame,
  type PadelGameForUser,
  type PadelSpaceRole,
  requirePadelSpaceRole,
  requireUser,
} from "./_lib/server";

type Transaction = Prisma.TransactionClient;

/**
 * Locks the game until the transaction ends, so changes to the same game made
 * at the same time (like two scores saved at once) run one after the other.
 */
const lockGame = (tx: Transaction, gameId: string) =>
  tx.$queryRaw`SELECT "id" FROM "PadelGame" WHERE "id" = ${gameId} FOR UPDATE`;

/** The space's games, the newest first */
export const getPadelSpaceGames = async (
  spaceId: string,
): Promise<PadelGameWithRounds[]> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  return prisma.padelGame.findMany({
    where: { spaceId },
    include: padelGameInclude,
    orderBy: { createdAt: "desc" },
  });
};

/** A game, with the user's role in its space */
export const getPadelGame = async (
  gameId: string,
): Promise<PadelGameForUser> => {
  const user = await requireUser();
  return getViewableGame(gameId, user.id);
};

export interface PreviousPadelPlayer {
  name: string;
  games: number;
  lastPlayedAt: Date;
}

/** Everyone who has played in the space, the most recent first */
export const getPreviousPadelPlayers = async (
  spaceId: string,
): Promise<PreviousPadelPlayer[]> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  return loadPreviousPlayers(spaceId);
};

const loadPreviousPlayers = async (spaceId: string, limit = 100) => {
  const players = await prisma.padelPlayer.findMany({
    where: { game: { spaceId } },
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
  return result.slice(0, limit);
};

export const createPadelGame = async (
  spaceId: string,
  input: CreatePadelGameInput,
): Promise<{ id: string }> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "HOST");
  const {
    name,
    format,
    playerNames,
    courts,
    courtNames,
    pointsPerMatch,
    plannedRounds,
    sitOutMore,
  } = CreatePadelGameSchema.parse(input);

  // Ids are made here so everything can be created in two queries
  const gameId = randomUUID();
  const chosen = sitOutMore.map((playerName) => playerName.toLowerCase());
  const players = playerNames.map((playerName, position) => ({
    id: randomUUID(),
    name: playerName,
    position,
    sitsOutMore: chosen.includes(playerName.toLowerCase()),
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
        {
          ratings:
            format === "ELO_AMERICANO"
              ? await getRatings(spaceId, playerNames)
              : undefined,
          sitOutMore: players.flatMap((player, index) =>
            player.sitsOutMore ? [index] : [],
          ),
        },
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
        space: { connect: { id: spaceId } },
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
  options: PadelScheduleOptions,
) => {
  const schedule = createPadelSchedule(playerIds.length, courts, options);
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
 * The players' ratings from all the space's games, for an ELO Americano.
 * Players who haven't played yet start where everyone starts.
 */
const getRatings = async (spaceId: string, playerNames: string[]) => {
  const ratings = new Map(
    buildPadelPlayerSummaries(await getAllPadelGames(spaceId)).map(
      (summary) => [summary.key, summary.rating],
    ),
  );
  return playerNames.map(
    (playerName) =>
      ratings.get(padelPlayerKey(playerName)) ?? PADEL_START_RATING,
  );
};

// Mexicano

type DrawGame = Parameters<typeof drawMexicanoRound>[0] & { id: string };

/** The next Mexicano round, drawn from the scores of the rounds so far */
const drawRound = (game: DrawGame, position: number) => {
  const round = { id: randomUUID(), position, series: 1 };
  const matches = drawMexicanoRound(game, padelSeed(game.id)).map(
    (match, index) => ({
      id: randomUUID(),
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
 * random order and new matchups (in an ELO Americano, from the latest
 * ratings). Only when every match has been played.
 */
export const addPadelSeries = async (
  gameId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  const game = await getHostedGame(gameId, user.id);
  if (game.format === "MEXICANO") {
    throw new Error("Add more rounds to a Mexicano instead");
  }
  if (!game.rounds.every(isPadelRoundPlayed)) {
    throw new Error("Finish all matches before starting a new series");
  }

  const playerIds = game.players.map((player) => player.id);
  const toIndices = (team: string[]) =>
    team.map((id) => playerIds.indexOf(id)) as PadelTeam;
  const lastRound = game.rounds[game.rounds.length - 1];
  const { rounds, matches } = planSeries(
    playerIds,
    game.courts,
    Math.max(0, ...game.rounds.map((round) => round.series)) + 1,
    game.rounds.length,
    {
      // The ratings now include the series that was just played
      ratings:
        game.format === "ELO_AMERICANO"
          ? await getRatings(
              game.spaceId,
              game.players.map((player) => player.name),
            )
          : undefined,
      sitOutMore: pickPadelSitOutMore(
        game.players,
        game.rounds,
        padelExtraSitOuts(game.format, playerIds.length, game.courts, 0),
      ).map((id) => playerIds.indexOf(id)),
      previousRound: lastRound?.matches.map((match) => [
        toIndices(match.team1),
        toIndices(match.team2),
      ]),
    },
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

  return getHostedGame(gameId, user.id);
};

export const updatePadelMatchScore = async (
  gameId: string,
  matchId: string,
  input: z.infer<typeof PadelMatchScoreSchema>,
) => {
  const user = await requireUser();
  const { team1Score, team2Score } = PadelMatchScoreSchema.parse(input);
  const game = await getHostedGame(gameId, user.id);

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
    // A score for a match that was ended early brings it back
    const updated = await tx.padelMatch.update({
      where: { id: matchId },
      data: { team1Score, team2Score, isSkipped: false },
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

/**
 * Ends the round being played, like when the time is up. Matches without a
 * score aren't played, and their players get their average for them in the
 * leaderboard (see `getPadelStandings`). Giving one of them a score later
 * brings it back.
 */
export const endPadelRound = async (
  gameId: string,
  roundId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  await getHostedGame(gameId, user.id);

  await prisma.$transaction(async (tx) => {
    await lockGame(tx, gameId);
    const game = await tx.padelGame.findUniqueOrThrow({
      where: { id: gameId },
      include: padelGameInclude,
    });
    // Checked, so a second tap doesn't end the round after it too
    if (getPadelUpNext(game.rounds)?.round.id !== roundId) {
      throw new Error("This round has already ended, reload the game");
    }
    await skipUnplayedMatches(tx, [roundId]);
    await tx.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    });
    if (game.format === "MEXICANO") {
      await syncMexicanoRounds(tx, gameId);
    }
  });

  return getHostedGame(gameId, user.id);
};

/**
 * Ends the series being played (a Mexicano: the game) after the rounds that
 * have been started. The rest of their matches aren't played, the rounds that
 * haven't started are removed, and players who end up with fewer matches get
 * their average for the missing ones. Another series (or Mexicano round) can
 * be played afterwards as usual.
 */
export const endPadelSeries = async (
  gameId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  await getHostedGame(gameId, user.id);

  await prisma.$transaction(async (tx) => {
    await lockGame(tx, gameId);
    const game = await tx.padelGame.findUniqueOrThrow({
      where: { id: gameId },
      include: padelGameInclude,
    });
    const isMexicano = game.format === "MEXICANO";
    const { rounds } = getCurrentPadelSeries(game.rounds);
    const isFinished =
      rounds.every(isPadelRoundPlayed) &&
      (!isMexicano || rounds.length >= (game.plannedRounds ?? 0));
    if (isFinished) {
      throw new Error(
        isMexicano ? "The game is already over" : "The series is already over",
      );
    }
    if (!rounds.some((round) => round.matches.some(isPadelMatchPlayed))) {
      throw new Error(
        isMexicano
          ? "Play a match before ending the game"
          : "Play a match before ending the series",
      );
    }

    const started = rounds.filter(isPadelRoundStarted);
    const removed = rounds.filter((round) => !isPadelRoundStarted(round));
    await skipUnplayedMatches(
      tx,
      started.map((round) => round.id),
    );
    await deleteRounds(tx, game.rounds, removed);
    await tx.padelGame.update({
      where: { id: gameId },
      data: {
        updatedAt: new Date(),
        ...(isMexicano ? { plannedRounds: started.length } : {}),
      },
    });
  });

  return getHostedGame(gameId, user.id);
};

/**
 * Removes a series that was started but never played, so the game goes back
 * to how it was when the series before it was over. A series with a score
 * can be ended early instead.
 */
export const removePadelSeries = async (
  gameId: string,
): Promise<PadelGameWithRounds> => {
  const user = await requireUser();
  await getHostedGame(gameId, user.id);

  await prisma.$transaction(async (tx) => {
    await lockGame(tx, gameId);
    const game = await tx.padelGame.findUniqueOrThrow({
      where: { id: gameId },
      include: padelGameInclude,
    });
    if (game.format === "MEXICANO") {
      throw new Error("A Mexicano has no series to remove");
    }
    const { rounds } = getCurrentPadelSeries(game.rounds);
    if (rounds.length === game.rounds.length) {
      throw new Error("The only series can't be removed, delete the game");
    }
    if (rounds.some(isPadelRoundStarted)) {
      throw new Error(
        "This series has been played, end it early instead, or reload the game",
      );
    }

    await deleteRounds(tx, game.rounds, rounds);
    await tx.padelGame.update({
      where: { id: gameId },
      data: { updatedAt: new Date() },
    });
  });

  return getHostedGame(gameId, user.id);
};

/** Deletes rounds and closes the gaps they leave in the play order */
const deleteRounds = async (
  tx: Transaction,
  rounds: { id: string; position: number }[],
  removed: { id: string }[],
) => {
  if (removed.length === 0) return;
  const removedIds = removed.map((round) => round.id);
  await tx.padelRound.deleteMany({ where: { id: { in: removedIds } } });
  // No gaps in the play order, so new rounds go after the last one
  const kept = rounds.filter((round) => removedIds.indexOf(round.id) === -1);
  for (let position = 0; position < kept.length; position++) {
    if (kept[position].position !== position) {
      await tx.padelRound.update({
        where: { id: kept[position].id },
        data: { position },
      });
    }
  }
};

const skipUnplayedMatches = (tx: Transaction, roundIds: string[]) =>
  tx.padelMatch.updateMany({
    where: {
      roundId: { in: roundIds },
      OR: [{ team1Score: null }, { team2Score: null }],
    },
    data: { isSkipped: true },
  });

/** Changes the play order. Rounds with a score stay where they are. */
export const reorderPadelRounds = async (
  gameId: string,
  input: z.infer<typeof ReorderPadelRoundsSchema>,
) => {
  const user = await requireUser();
  const { roundIds } = ReorderPadelRoundsSchema.parse(input);
  const game = await getHostedGame(gameId, user.id);
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

  return getHostedGame(gameId, user.id);
};

export const deletePadelGame = async (gameId: string) => {
  const user = await requireUser();
  await getHostedGame(gameId, user.id);
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
  await getHostedGame(gameId, user.id);

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

  return getHostedGame(gameId, user.id);
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
  const game = await getHostedGame(gameId, user.id);
  if (isShared !== (game.shareToken !== null)) {
    await prisma.padelGame.update({
      where: { id: gameId },
      data: {
        shareToken: isShared ? randomBytes(12).toString("base64url") : null,
      },
    });
  }
  return getHostedGame(gameId, user.id);
};

// Player statistics

/** The ratings in every played match of the game, by match id */
export const getPadelMatchRatings = async (
  gameId: string,
): Promise<Record<string, PadelMatchRating>> => {
  const user = await requireUser();
  const game = await getViewableGame(gameId, user.id);
  return buildPadelMatchRatings(await getAllPadelGames(game.spaceId), gameId);
};

/** Everyone who has played in the space, highest rating first */
export const getPadelPlayerSummaries = async (
  spaceId: string,
): Promise<PadelPlayerSummary[]> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  return loadPadelPlayerSummaries(spaceId);
};

/** `key` is the player's name, in any case */
export const getPadelPlayerProfile = async (
  spaceId: string,
  key: string,
): Promise<PadelPlayerProfile> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  const profile = await loadPadelPlayerProfile(spaceId, key);
  if (!profile) {
    throw new Error("Player not found");
  }
  return profile;
};

/** The token of the live link to the space's players, null when it's off */
export const getPadelPlayersSharing = async (
  spaceId: string,
): Promise<{ shareToken: string | null }> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "HOST");
  const space = await prisma.padelSpace.findUniqueOrThrow({
    where: { id: spaceId },
    select: { shareToken: true },
  });
  return { shareToken: space.shareToken };
};

/**
 * Turns the live link to the space's players and their ratings on or off.
 * Turning it on again makes a new link, so an old one can't be used any more.
 */
export const setPadelPlayersSharing = async (
  spaceId: string,
  isShared: boolean,
): Promise<{ shareToken: string | null }> => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "HOST");
  // Keeps the link there is, so turning it on twice is harmless
  await prisma.padelSpace.updateMany({
    where: { id: spaceId, shareToken: isShared ? null : { not: null } },
    data: {
      shareToken: isShared ? randomBytes(12).toString("base64url") : null,
    },
  });
  return getPadelPlayersSharing(spaceId);
};

// Spaces

const userSelect = {
  id: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export type PadelSpaceUser = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

export interface PadelSpaceSummary {
  id: string;
  name: string;
  role: PadelSpaceRole;
  owner: PadelSpaceUser;
  games: number;
  /** When the latest game was played, null without games */
  lastPlayedAt: Date | null;
  createdAt: Date;
}

export interface PadelSpaceDetails extends PadelSpaceSummary {
  hosts: PadelSpaceUser[];
  /** Players' names linked to their accounts */
  links: { key: string; name: string; user: PadelSpaceUser }[];
  /** Everyone who has played in the space, the most recent first */
  players: string[];
}

/** The spaces the user owns, hosts or plays in, the most recently used first */
export const getPadelSpaces = async (): Promise<PadelSpaceSummary[]> => {
  const user = await requireUser();
  const spaces = await prisma.padelSpace.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { hosts: { some: { userId: user.id } } },
        { links: { some: { userId: user.id } } },
      ],
    },
    include: {
      owner: { select: userSelect },
      hosts: { where: { userId: user.id }, select: { userId: true } },
      games: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { games: true } },
    },
  });
  return spaces
    .map((space) => ({
      id: space.id,
      name: space.name,
      role: (space.ownerId === user.id
        ? "OWNER"
        : space.hosts.length > 0
          ? "HOST"
          : "PLAYER") as PadelSpaceRole,
      owner: space.owner,
      games: space._count.games,
      lastPlayedAt: space.games[0]?.createdAt ?? null,
      createdAt: space.createdAt,
    }))
    .sort(
      (a, b) =>
        (b.lastPlayedAt ?? b.createdAt).getTime() -
        (a.lastPlayedAt ?? a.createdAt).getTime(),
    );
};

export const getPadelSpace = async (
  spaceId: string,
): Promise<PadelSpaceDetails> => {
  const user = await requireUser();
  const role = await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  const [space, players] = await Promise.all([
    prisma.padelSpace.findUniqueOrThrow({
      where: { id: spaceId },
      include: {
        owner: { select: userSelect },
        hosts: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: "asc" },
        },
        links: {
          include: { user: { select: userSelect } },
          orderBy: { createdAt: "asc" },
        },
        games: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { games: true } },
      },
    }),
    loadPreviousPlayers(spaceId, 1000),
  ]);
  const names = new Map(
    players.map((player) => [padelPlayerKey(player.name), player.name]),
  );
  return {
    id: space.id,
    name: space.name,
    role,
    owner: space.owner,
    games: space._count.games,
    lastPlayedAt: space.games[0]?.createdAt ?? null,
    createdAt: space.createdAt,
    hosts: space.hosts.map((host) => host.user),
    links: space.links.map((link) => ({
      key: link.key,
      name: names.get(link.key) ?? link.key,
      user: link.user,
    })),
    players: players.map((player) => player.name),
  };
};

export const createPadelSpace = async (
  input: z.input<typeof PadelSpaceSchema>,
): Promise<{ id: string }> => {
  const user = await requireUser();
  const { name } = PadelSpaceSchema.parse(input);
  return prisma.padelSpace.create({
    data: { name, ownerId: user.id },
    select: { id: true },
  });
};

export const renamePadelSpace = async (
  spaceId: string,
  input: z.input<typeof PadelSpaceSchema>,
) => {
  const user = await requireUser();
  const { name } = PadelSpaceSchema.parse(input);
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  await prisma.padelSpace.update({ where: { id: spaceId }, data: { name } });
  return getPadelSpace(spaceId);
};

/** Deletes the space with all its games */
export const deletePadelSpace = async (spaceId: string) => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  await prisma.padelSpace.delete({ where: { id: spaceId } });
};

/** Lets a user create games and keep score in the space */
export const addPadelSpaceHost = async (spaceId: string, userId: string) => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  if (userId === user.id) {
    throw new Error("You own the space, so you can already host games");
  }
  const host = await prisma.user.findUnique({ where: { id: userId } });
  if (!host) {
    throw new Error("User not found");
  }
  await prisma.padelSpaceHost.upsert({
    where: { spaceId_userId: { spaceId, userId } },
    create: { spaceId, userId },
    update: {},
  });
  return getPadelSpace(spaceId);
};

export const removePadelSpaceHost = async (spaceId: string, userId: string) => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  await prisma.padelSpaceHost.deleteMany({ where: { spaceId, userId } });
  return getPadelSpace(spaceId);
};

/**
 * Links a player's name in the space to a user, who can then see the space.
 * A user has one name in a space, so an earlier link of theirs is replaced.
 */
export const linkPadelPlayer = async (
  spaceId: string,
  input: z.input<typeof LinkPadelPlayerSchema>,
) => {
  const user = await requireUser();
  const { name, userId } = LinkPadelPlayerSchema.parse(input);
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  const key = padelPlayerKey(name);
  const [player, linked] = await Promise.all([
    prisma.padelPlayer.findFirst({
      where: { game: { spaceId }, name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);
  if (!player) {
    throw new Error(`Nobody called ${name} has played in this space`);
  }
  if (!linked) {
    throw new Error("User not found");
  }
  await prisma.$transaction([
    prisma.padelPlayerLink.deleteMany({
      where: { spaceId, OR: [{ key }, { userId }] },
    }),
    prisma.padelPlayerLink.create({ data: { spaceId, key, userId } }),
  ]);
  return getPadelSpace(spaceId);
};

/** `key` is the player's name, in any case */
export const unlinkPadelPlayer = async (spaceId: string, key: string) => {
  const user = await requireUser();
  await requirePadelSpaceRole(spaceId, user.id, "OWNER");
  await prisma.padelPlayerLink.deleteMany({
    where: { spaceId, key: padelPlayerKey(key) },
  });
  return getPadelSpace(spaceId);
};

/** Stops hosting and unlinks the user's name, so they no longer see the space */
export const leavePadelSpace = async (spaceId: string) => {
  const user = await requireUser();
  const role = await requirePadelSpaceRole(spaceId, user.id, "PLAYER");
  if (role === "OWNER") {
    throw new Error("The owner can't leave the space, delete it instead");
  }
  await prisma.$transaction([
    prisma.padelSpaceHost.deleteMany({ where: { spaceId, userId: user.id } }),
    prisma.padelPlayerLink.deleteMany({ where: { spaceId, userId: user.id } }),
  ]);
};
