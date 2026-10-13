// Same rules as the website's src/utils/padel.ts. The schedule itself is made
// by the server when a game is created, and Mexicano rounds are drawn by the
// server as scores come in.

import { API_URL } from "./config";
import type {
  PadelFormat,
  PadelGame,
  PadelMatch,
  PadelPlayer,
  PadelRecord,
  PadelRound,
} from "./types";

export const MIN_PADEL_PLAYERS = 4;
export const MAX_PADEL_PLAYERS = 24;
export const MIN_PADEL_POINTS = 4;
export const MAX_PADEL_POINTS = 99;
export const PADEL_POINT_PRESETS = [16, 21, 24, 32];
export const MIN_PADEL_ROUNDS = 1;
export const MAX_PADEL_ROUNDS = 50;
export const MAX_PADEL_COURT_NAME_LENGTH = 20;

export const formatLabel = (format: PadelFormat) =>
  format === "MEXICANO" ? "Mexicano" : "Americano";

/** "Court 2", unless the court has been given a name */
export const courtName = (courtNames: string[], court: number) =>
  courtNames[court - 1]?.trim() || `Court ${court}`;

/** Where anyone can follow a game with a live link */
export const liveUrl = (game: PadelGame) =>
  game.shareToken ? `${API_URL}/padel/live/${game.shareToken}` : null;

export const maxPadelCourts = (playerCount: number) =>
  Math.max(1, Math.floor(playerCount / 4));

/** Rough size of a game, before the schedule is made */
export const estimatePadelGame = (playerCount: number, courtCount: number) => {
  const courts = Math.max(1, Math.min(courtCount, maxPadelCourts(playerCount)));
  const matches = Math.floor((playerCount * (playerCount - 1)) / 4);
  return {
    matches,
    rounds: Math.ceil(matches / courts),
    gamesPerPlayer: playerCount - 1,
    /** With an odd number of pairs, two players can't be partners */
    hasUnpairedPlayers: ((playerCount * (playerCount - 1)) / 2) % 2 === 1,
  };
};

/** About as many rounds as an Americano with the same players would have */
export const defaultMexicanoRounds = (playerCount: number, courtCount: number) =>
  Math.max(3, Math.min(10, estimatePadelGame(playerCount, courtCount).rounds));

/** Series numbers in play order */
export const getSeriesNumbers = (rounds: PadelRound[]) =>
  [...new Set(rounds.map((round) => round.series))].sort((a, b) => a - b);

/** The rounds of the series being played, or the last one */
export const getCurrentSeries = (rounds: PadelRound[]) => {
  const series = Math.max(1, ...rounds.map((round) => round.series));
  return { series, rounds: rounds.filter((round) => round.series === series) };
};

export const isMatchPlayed = (match: PadelMatch) =>
  match.team1Score !== null && match.team2Score !== null;

export const isRoundPlayed = (round: PadelRound) =>
  round.matches.every(isMatchPlayed);

/** Rounds with a score can't be moved */
export const isRoundStarted = (round: PadelRound) =>
  round.matches.some(isMatchPlayed);

const playsIn = (round: PadelRound, playerId: string) =>
  round.matches.some(
    (match) => match.team1.includes(playerId) || match.team2.includes(playerId),
  );

export const getSittingOut = (players: PadelPlayer[], round: PadelRound) =>
  players.filter((player) => !playsIn(round, player.id));

export const getPadelProgress = (rounds: PadelRound[]) => {
  const matches = rounds.flatMap((round) => round.matches);
  const played = matches.filter(isMatchPlayed).length;
  return {
    played,
    total: matches.length,
    isFinished: matches.length > 0 && played === matches.length,
    /** -1 when every round has been played */
    currentRoundIndex: rounds.findIndex((round) => !isRoundPlayed(round)),
  };
};

/**
 * Where a game is at. Americano progress is for the series being played, and
 * a Mexicano is over once all its planned rounds have been played.
 */
export const getGameStatus = (game: PadelGame) => {
  const current = getCurrentSeries(game.rounds);
  const progress = getPadelProgress(current.rounds);
  const isMexicano = game.format === "MEXICANO";
  const totalRounds = isMexicano
    ? Math.max(game.plannedRounds ?? 0, current.rounds.length)
    : current.rounds.length;
  // Every Mexicano round has the same number of matches
  const matchesTotal = isMexicano
    ? totalRounds * (current.rounds[0]?.matches.length ?? 0)
    : progress.total;
  const playedRounds = current.rounds.filter(isRoundPlayed).length;
  return {
    series: current.series,
    seriesCount: getSeriesNumbers(game.rounds).length,
    /** The round being played, counted within the series */
    roundNumber: Math.min(totalRounds, playedRounds + 1),
    totalRounds,
    matchesPlayed: progress.played,
    matchesTotal,
    isFinished:
      game.rounds.length > 0 &&
      game.rounds.every(isRoundPlayed) &&
      playedRounds >= totalRounds,
  };
};

/** The round being played and the one after it, within the current series */
export const getUpNext = (rounds: PadelRound[]) => {
  const current = getCurrentSeries(rounds).rounds;
  const index = current.findIndex((round) => !isRoundPlayed(round));
  if (index === -1) return null;
  return {
    round: current[index],
    number: index + 1,
    next: current[index + 1] ?? null,
  };
};

export interface PadelStanding {
  playerId: string;
  name: string;
  rank: number;
  /** Points won in the matches played */
  points: number;
  played: number;
  scheduled: number;
  wins: number;
  draws: number;
  losses: number;
  /** Points won minus points lost */
  difference: number;
  /**
   * With 6, 7, 10, 11, ... players some play one match less. Once they have
   * played all their matches, they get their average for each missing match.
   */
  compensation: number;
  total: number;
}

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

export const getPadelStandings = (
  players: PadelPlayer[],
  rounds: PadelRound[],
): PadelStanding[] => {
  const standings: PadelStanding[] = players.map((player) => ({
    playerId: player.id,
    name: player.name,
    rank: 0,
    points: 0,
    played: 0,
    scheduled: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    difference: 0,
    compensation: 0,
    total: 0,
  }));
  const byId = new Map(
    standings.map((standing) => [standing.playerId, standing]),
  );

  for (const match of rounds.flatMap((round) => round.matches)) {
    const sides = [
      { team: match.team1, score: match.team1Score, other: match.team2Score },
      { team: match.team2, score: match.team2Score, other: match.team1Score },
    ];
    for (const { team, score, other } of sides) {
      for (const playerId of team) {
        const standing = byId.get(playerId);
        if (!standing) continue;
        standing.scheduled++;
        if (score === null || other === null) continue;
        standing.played++;
        standing.points += score;
        standing.difference += score - other;
        if (score > other) standing.wins++;
        else if (score < other) standing.losses++;
        else standing.draws++;
      }
    }
  }

  const mostScheduled = Math.max(0, ...standings.map((s) => s.scheduled));
  for (const standing of standings) {
    const missing = mostScheduled - standing.scheduled;
    if (
      missing > 0 &&
      standing.played > 0 &&
      standing.played === standing.scheduled
    ) {
      standing.compensation = roundToTenth(
        (missing * standing.points) / standing.played,
      );
    }
    standing.total = roundToTenth(standing.points + standing.compensation);
  }

  const compare = (a: PadelStanding, b: PadelStanding) =>
    b.total - a.total || b.wins - a.wins || b.difference - a.difference;
  standings.sort((a, b) => compare(a, b) || a.name.localeCompare(b.name));
  standings.forEach((standing, index) => {
    const previous = standings[index - 1];
    standing.rank =
      previous && compare(previous, standing) === 0 ? previous.rank : index + 1;
  });

  return standings;
};

/** Moves a round, keeping rounds that have been started where they are */
export const moveRound = (rounds: PadelRound[], from: number, to: number) => {
  if (
    from === to ||
    to < 0 ||
    to >= rounds.length ||
    isRoundStarted(rounds[from])
  ) {
    return rounds;
  }
  // Only the rounds that haven't started trade places
  const open = rounds
    .map((round, index) => ({ round, index }))
    .filter(({ round }) => !isRoundStarted(round));
  const fromOpen = open.findIndex(({ index }) => index === from);
  let toOpen = open.findIndex(({ index }) => index === to);
  if (toOpen === -1) {
    // Skip past started rounds in the direction of the move
    const beyond = open.filter(({ index }) =>
      to > from ? index > to : index < to,
    );
    if (beyond.length === 0) return rounds;
    toOpen = open.indexOf(to > from ? beyond[0] : beyond[beyond.length - 1]);
  }

  const reordered = open.map(({ round }) => round);
  const [moved] = reordered.splice(fromOpen, 1);
  reordered.splice(toOpen, 0, moved);

  const result = rounds.slice();
  open.forEach(({ index }, i) => {
    result[index] = reordered[i];
  });
  return result;
};

/**
 * Moves the next round where the player sits out to be the next round played,
 * for when someone needs a break. Returns `null` when that isn't possible, and
 * the same rounds when the player already sits out next.
 */
export const restPlayerNext = (rounds: PadelRound[], playerId: string) => {
  const next = rounds.findIndex((round) => !isRoundStarted(round));
  if (next === -1) return null;
  const restIndex = rounds.findIndex(
    (round, index) =>
      index >= next && !isRoundStarted(round) && !playsIn(round, playerId),
  );
  if (restIndex === -1) return null;
  return moveRound(rounds, restIndex, next);
};

export const teamNames = (ids: string[], players: PadelPlayer[]) =>
  ids
    .map((id) => players.find((player) => player.id === id)?.name ?? "?")
    .join(" & ");

/** Like "Americano 13 Oct" */
export const defaultGameName = (format: PadelFormat = "AMERICANO") =>
  `${formatLabel(format)} ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date())}`;

/** Names made by `defaultGameName` get today's date when played again */
export const isDefaultGameName = (name: string) =>
  /^(Americano|Mexicano) \d{1,2} [A-Za-z]{3,4}$/.test(name);

const MEDALS = ["🥇", "🥈", "🥉"];

/** The leaderboard as text, for sharing in a chat */
export const formatResults = (game: PadelGame) => {
  const status = getGameStatus(game);
  const standings = getPadelStandings(game.players, game.rounds);
  const hasScores = standings.some((standing) => standing.played > 0);
  const url = liveUrl(game);
  const lines = [
    `${status.isFinished ? "🏆" : "🎾"} ${game.name}`,
    status.isFinished
      ? "Final results"
      : `Standings after ${status.matchesPlayed} of ${status.matchesTotal} matches${
          status.seriesCount > 1 ? ` in series ${status.series}` : ""
        }`,
    "",
    ...standings.map(
      (standing) =>
        `${
          hasScores && standing.rank <= 3
            ? MEDALS[standing.rank - 1]
            : `${standing.rank}.`
        } ${standing.name} – ${standing.total}`,
    ),
    "",
    `${formatLabel(game.format)} · ${game.players.length} players · ${
      game.courts
    } ${game.courts === 1 ? "court" : "courts"} · ${game.pointsPerMatch} points`,
  ];
  if (url) lines.push(`Follow the game: ${url}`);
  return lines.join("\n");
};

// Statistics

/** 1st, 2nd, 3rd, 4th, ... 11th, 12th, 13th, ... 21st */
export const ordinal = (n: number) => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix =
    !teen && n % 10 === 1
      ? "st"
      : !teen && n % 10 === 2
        ? "nd"
        : !teen && n % 10 === 3
          ? "rd"
          : "th";
  return `${n}${suffix}`;
};

export const signed = (value: number) =>
  value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "±0";

export const percent = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–";

/** Share of the points won, like "54%" */
export const pointShare = (record: PadelRecord) =>
  percent(record.pointsWon, record.pointsWon + record.pointsLost);

/** Points won minus lost, per match, like "+2.5" */
export const differencePerMatch = (record: PadelRecord) =>
  record.matches > 0
    ? signed(
        Math.round(((record.pointsWon - record.pointsLost) / record.matches) * 10) /
          10,
      )
    : "–";

/** The same player across games, like the website's `padelPlayerKey` */
export const playerKey = (name: string) => name.trim().toLowerCase();
