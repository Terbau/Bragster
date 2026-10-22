"use server";

import { randomBytes, randomUUID } from "node:crypto";
import type { Prisma } from "@/lib/generated/prisma";
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
  type PadelPlayerSummary,
  padelPlayerKey,
} from "@/utils/padelStats";
import type { z } from "zod";
import {
  getAllPadelGames,
  loadPadelPlayerProfile,
  loadPadelPlayerSummaries,
  type PadelPlayerProfileWithVideo,
} from "./_lib/players";
import { getOwnedGame, requireUser } from "./_lib/server";
import { deleteRecordingFiles } from "./_lib/videos";

type Transaction = Prisma.TransactionClient;

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
              ? await getRatings(user.id, playerNames)
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
 * The players' ratings from all the user's games, for an ELO Americano.
 * Players who haven't played yet start where everyone starts.
 */
const getRatings = async (userId: string, playerNames: string[]) => {
  const ratings = new Map(
    buildPadelPlayerSummaries(await getAllPadelGames(userId)).map((summary) => [
      summary.key,
      summary.rating,
    ]),
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

  // Videos of a round drawn again move to the new matches on their courts
  const removedRounds = game.rounds.filter((round) =>
    removed.includes(round.id),
  );
  const filmed = await tx.padelRecording.findMany({
    where: {
      matchId: {
        in: removedRounds.flatMap((round) => round.matches.map((m) => m.id)),
      },
    },
    select: { id: true, matchId: true, court: true },
  });
  const filmedPositions = new Map(
    filmed.map((recording) => [
      recording.id,
      removedRounds.find((round) =>
        round.matches.some((match) => match.id === recording.matchId),
      )?.position,
    ]),
  );

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

    const position = next.rounds[0].position;
    for (const recording of filmed) {
      const match = next.matches.find((m) => m.court === recording.court);
      if (match && filmedPositions.get(recording.id) === position) {
        await tx.padelRecording.update({
          where: { id: recording.id },
          data: { matchId: match.id },
        });
      }
    }
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
  const game = await getOwnedGame(gameId, user.id);
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
              user.id,
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
  await getOwnedGame(gameId, user.id);

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

  return getOwnedGame(gameId, user.id);
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
  await getOwnedGame(gameId, user.id);

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

  return getOwnedGame(gameId, user.id);
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
  await getOwnedGame(gameId, user.id);

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

  return getOwnedGame(gameId, user.id);
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
  await deleteRecordingFiles(
    await prisma.padelRecording.findMany({
      where: { gameId },
      select: { id: true, blobName: true },
    }),
  );
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

/** The ratings in every played match of the game, by match id */
export const getPadelMatchRatings = async (
  gameId: string,
): Promise<Record<string, PadelMatchRating>> => {
  const user = await requireUser();
  const games = await getAllPadelGames(user.id);
  if (!games.some((game) => game.id === gameId)) {
    throw new Error("Game not found");
  }
  return buildPadelMatchRatings(games, gameId);
};

/** Everyone the user has played with, highest rating first */
export const getPadelPlayerSummaries = async (): Promise<
  PadelPlayerSummary[]
> => {
  const user = await requireUser();
  return loadPadelPlayerSummaries(user.id);
};

/** `key` is the player's name, in any case */
export const getPadelPlayerProfile = async (
  key: string,
): Promise<PadelPlayerProfileWithVideo> => {
  const user = await requireUser();
  const profile = await loadPadelPlayerProfile(user.id, key);
  if (!profile) {
    throw new Error("Player not found");
  }
  return profile;
};

/** The token of the live link to the players, null when it's off */
export const getPadelPlayersSharing = async (): Promise<{
  shareToken: string | null;
}> => {
  const user = await requireUser();
  const share = await prisma.padelPlayersShare.findUnique({
    where: { userId: user.id },
  });
  return { shareToken: share?.token ?? null };
};

/**
 * Turns the live link to the players and their ratings on or off. Turning it
 * on again makes a new link, so an old one can't be used any more.
 */
export const setPadelPlayersSharing = async (
  isShared: boolean,
): Promise<{ shareToken: string | null }> => {
  const user = await requireUser();
  if (!isShared) {
    await prisma.padelPlayersShare.deleteMany({ where: { userId: user.id } });
    return { shareToken: null };
  }
  // Keeps the link there is, so turning it on twice is harmless
  const share = await prisma.padelPlayersShare.upsert({
    where: { userId: user.id },
    create: { userId: user.id, token: randomBytes(12).toString("base64url") },
    update: {},
  });
  return { shareToken: share.token };
};
