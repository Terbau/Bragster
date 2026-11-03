// Same rules as the website's src/utils/padel.ts. The schedule itself is made
// by the server when a game is created, and Mexicano rounds are drawn by the
// server as scores come in.

import { API_URL } from "./config";
import type {
  PadelFormat,
  PadelGame,
  PadelMatch,
  PadelPlayer,
  PadelPlayerGame,
  PadelPlayerOnDay,
  PadelPlayerSummary,
  PadelRecord,
  PadelRound,
  PadelSpaceRole,
} from "./types";

export const MIN_PADEL_PLAYERS = 4;
export const MAX_PADEL_PLAYERS = 24;
export const MIN_PADEL_POINTS = 4;
export const MAX_PADEL_POINTS = 99;
export const DEFAULT_PADEL_POINTS = 16;
export const PADEL_POINT_PRESETS = [16, 21, 24, 32];
export const MIN_PADEL_ROUNDS = 1;
export const MAX_PADEL_ROUNDS = 50;
export const MAX_PADEL_COURT_NAME_LENGTH = 20;

export const formatLabel = (format: PadelFormat) =>
  format === "MEXICANO"
    ? "Mexicano"
    : format === "ELO_AMERICANO"
      ? "ELO Americano"
      : "Americano";

/** "Court 2", unless the court has been given a name */
export const courtName = (courtNames: string[], court: number) =>
  courtNames[court - 1]?.trim() || `Court ${court}`;

/** Where anyone can follow a game with a live link */
export const liveUrl = (game: PadelGame) =>
  game.shareToken ? `${API_URL}/padel/live/${game.shareToken}` : null;

/** Where anyone can see the players and their ratings */
export const playersLiveUrl = (shareToken: string | null) =>
  shareToken ? `${API_URL}/padel/live/players/${shareToken}` : null;

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
export const defaultMexicanoRounds = (
  playerCount: number,
  courtCount: number,
) =>
  Math.max(3, Math.min(10, estimatePadelGame(playerCount, courtCount).rounds));

/**
 * How many players sit out one round more than the others. In an Americano,
 * those are the two players who can't be partners (with 6, 7, 10, 11, ...
 * players). In a Mexicano, it's what's left over when the rounds' sitting out
 * is shared out evenly.
 */
export const padelExtraSitOuts = (
  format: PadelFormat,
  playerCount: number,
  courtCount: number,
  plannedRounds: number,
) => {
  if (playerCount < MIN_PADEL_PLAYERS) return 0;
  const courts = Math.max(1, Math.min(courtCount, maxPadelCourts(playerCount)));
  if (format === "MEXICANO") {
    return (plannedRounds * (playerCount - courts * 4)) % playerCount;
  }
  return estimatePadelGame(playerCount, courts).hasUnpairedPlayers ? 2 : 0;
};

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

/** Ended early without a score, so it doesn't count */
export const isMatchSkipped = (match: PadelMatch) =>
  !isMatchPlayed(match) && match.isSkipped;

/** Played, or ended early */
export const isMatchDone = (match: PadelMatch) =>
  isMatchPlayed(match) || isMatchSkipped(match);

/** Every match has a score or was ended early */
export const isRoundPlayed = (round: PadelRound) =>
  round.matches.every(isMatchDone);

/** Rounds with a score, or that were ended, can't be moved */
export const isRoundStarted = (round: PadelRound) =>
  round.matches.some(isMatchDone);

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
    /** Matches that were ended early don't count */
    total: matches.filter((match) => !isMatchSkipped(match)).length,
    isFinished: matches.length > 0 && matches.every(isMatchDone),
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
    ? totalRounds * (current.rounds[0]?.matches.length ?? 0) -
      current.rounds.flatMap((round) => round.matches).filter(isMatchSkipped)
        .length
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
   * With 6, 7, 10, 11, ... players some play one match less, and matches can
   * be ended early. Once players have played all their matches, they get
   * their average for each match they have played less than the most.
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
    if (isMatchSkipped(match)) continue;
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
  /^(Americano|ELO Americano|Mexicano) \d{1,2} [A-Za-z]{3,4}$/.test(name);

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
        Math.round(
          ((record.pointsWon - record.pointsLost) / record.matches) * 10,
        ) / 10,
      )
    : "–";

/** Midnight at the start of the day, in the phone's time zone */
export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Midnight `days` days later (or earlier) */
export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "Today", "Yesterday", "Mon, Nov 2", or "Nov 2, 2025" in an earlier year */
export const dayLabel = (day: Date, today: Date) => {
  if (isSameDay(day, today)) return "Today";
  if (isSameDay(day, addDays(today, -1))) return "Yesterday";
  return day.getFullYear() === today.getFullYear()
    ? day.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

/**
 * How much the rating changed on the last day the player played, like the
 * website's `getPadelDayRatingChange`. `history` is newest first.
 */
export const getDayRatingChange = (
  profile: {
    rating: number;
    history: Pick<
      PadelPlayerGame,
      "createdAt" | "ratingBefore" | "ratingChange"
    >[];
  },
  now: Date,
) => {
  if (profile.history.length === 0) return null;
  const day = new Date(profile.history[0].createdAt);
  const games = profile.history.filter((game) =>
    isSameDay(new Date(game.createdAt), day),
  );
  const before = games[games.length - 1].ratingBefore;
  return {
    // Older websites don't send the rating before, so the rounded changes
    // are added up instead
    change:
      before === undefined
        ? games.reduce((sum, game) => sum + game.ratingChange, 0)
        : profile.rating - before,
    day,
    games: games.length,
    isToday: isSameDay(day, now),
  };
};

/**
 * The players as they were at the end of a day, highest rating first, with
 * how much each rating changed during the day, like the website's
 * `getPadelPlayersOnDay`. `start` and `end` are the bounds of the day.
 * Players who hadn't played yet are left out.
 */
export const getPlayersOnDay = (
  players: PadelPlayerSummary[],
  start: Date,
  end: Date,
): PadelPlayerOnDay[] => {
  const from = start.getTime();
  const to = end.getTime();
  const list: (PadelPlayerOnDay & { order: number })[] = [];
  players.forEach((player, order) => {
    // Older websites don't send the timeline, so the players are as they are
    if (!player.timeline) {
      list.push({ ...player, change: null, order });
      return;
    }
    const day = { games: 0, matches: 0, wins: 0, gamesWon: 0 };
    let rating = player.rating;
    let startRating: number | null = null;
    for (const game of player.timeline) {
      const time = new Date(game.createdAt).getTime();
      if (time >= to) {
        // The rating before the next game is the rating at the end of the day
        rating = game.ratingBefore;
        break;
      }
      day.games++;
      day.matches += game.matches;
      day.wins += game.wins;
      if (game.wonGame) day.gamesWon++;
      if (time >= from && startRating === null) startRating = game.ratingBefore;
    }
    if (day.games === 0) return;
    list.push({
      key: player.key,
      name: player.name,
      rating,
      ...day,
      change: startRating === null ? null : rating - startRating,
      order,
    });
  });
  // Ties keep the order from the website, which is by unrounded rating
  list.sort((a, b) => b.rating - a.rating || a.order - b.order);
  return list.map(({ order: _order, ...player }) => player);
};

/** The days with games that changed a rating, oldest first */
export const getGameDays = (players: PadelPlayerSummary[]) => {
  const days: Date[] = [];
  for (const player of players) {
    for (const game of player.timeline ?? []) {
      const day = startOfDay(new Date(game.createdAt));
      if (!days.some((d) => isSameDay(d, day))) days.push(day);
    }
  }
  return days.sort((a, b) => a.getTime() - b.getTime());
};

/** How many games that changed a rating were played in the day */
export const countGamesOnDay = (
  players: PadelPlayerSummary[],
  start: Date,
  end: Date,
) => {
  const games = new Set<string>();
  for (const player of players) {
    for (const game of player.timeline ?? []) {
      const time = new Date(game.createdAt);
      if (time >= start && time < end) games.add(game.gameId);
    }
  }
  return games.size;
};

/** The same player across games, like the website's `padelPlayerKey` */
export const playerKey = (name: string) => name.trim().toLowerCase();

export const roleLabel = (role: PadelSpaceRole) =>
  role === "OWNER" ? "Owner" : role === "HOST" ? "Host" : "Player";

/** What the user can do in the space, in a sentence */
export const roleDescription = (role: PadelSpaceRole, ownerEmail: string) =>
  role === "OWNER"
    ? "You own this space."
    : role === "HOST"
      ? `You can host games here. Owned by ${ownerEmail}.`
      : `Your name is linked to your account, so you can follow the games here. Owned by ${ownerEmail}.`;
