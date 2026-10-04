// Same rules as the website's src/utils/padel.ts. The schedule itself is made
// by the server when a game is created.

import type { PadelMatch, PadelPlayer, PadelRound } from "./types";

export const MIN_PADEL_PLAYERS = 4;
export const MAX_PADEL_PLAYERS = 24;
export const MIN_PADEL_POINTS = 4;
export const MAX_PADEL_POINTS = 99;
export const PADEL_POINT_PRESETS = [16, 21, 24, 32];

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

export const isMatchPlayed = (match: PadelMatch) =>
  match.team1Score !== null && match.team2Score !== null;

export const isRoundPlayed = (round: PadelRound) => round.matches.every(isMatchPlayed);

/** Rounds with a score can't be moved */
export const isRoundStarted = (round: PadelRound) => round.matches.some(isMatchPlayed);

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
  const byId = new Map(standings.map((standing) => [standing.playerId, standing]));

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
    if (missing > 0 && standing.played > 0 && standing.played === standing.scheduled) {
      standing.compensation = roundToTenth((missing * standing.points) / standing.played);
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
  if (from === to || to < 0 || to >= rounds.length || isRoundStarted(rounds[from])) {
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
    const beyond = open.filter(({ index }) => (to > from ? index > to : index < to));
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
    (round, index) => index >= next && !isRoundStarted(round) && !playsIn(round, playerId),
  );
  if (restIndex === -1) return null;
  return moveRound(rounds, restIndex, next);
};

export const teamNames = (ids: string[], players: PadelPlayer[]) =>
  ids.map((id) => players.find((player) => player.id === id)?.name ?? "?").join(" & ");

export const defaultGameName = () =>
  `Americano ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date())}`;
