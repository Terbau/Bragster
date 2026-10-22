// Player statistics across all of a user's padel games. Players are only
// names, so the same name (ignoring case) in different games is the same
// player.

import {
  getPadelGameStatus,
  getPadelStandings,
  isPadelMatchPlayed,
  type PadelFormatName,
} from "./padel";

export const padelPlayerKey = (name: string) => name.trim().toLowerCase();

export const PADEL_START_RATING = 1000;
/** How much one match can move a rating */
const RATING_K = 64;
/** A team this much higher rated is expected to win about 76% of the points */
const RATING_SCALE = 800;
/** A partner or opponent needs this many matches to be a highlight */
const MIN_HIGHLIGHT_MATCHES = 2;

export interface PadelRecord {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  pointsWon: number;
  pointsLost: number;
}

export interface PadelPlayerSummary extends PadelRecord {
  key: string;
  /** The spelling from the latest game */
  name: string;
  rating: number;
  /** Games with at least one match played */
  games: number;
  /** Finished games won */
  gamesWon: number;
  lastPlayedAt: string;
  /**
   * Games from the 24 hours up to the last game, newest first. That covers
   * the last day played in any time zone, see `getPadelDayRatingChange`.
   */
  recentGames: PadelRecentGame[];
}

export type PadelRecentGame = Pick<
  PadelPlayerGame,
  "createdAt" | "ratingBefore" | "ratingChange"
>;

export interface PadelPlayerRelation extends PadelRecord {
  key: string;
  name: string;
}

export interface PadelPlayerGame {
  gameId: string;
  name: string;
  format: PadelFormatName;
  createdAt: string;
  rank: number;
  playerCount: number;
  total: number;
  matches: number;
  wins: number;
  isFinished: boolean;
  /** Rounded, like `rating` */
  ratingBefore: number;
  ratingChange: number;
}

export type PadelMatchOutcome = "W" | "D" | "L";

export interface PadelPlayerProfile extends PadelPlayerSummary {
  /** Place on the rating list, 1 is the highest */
  ratingRank: number;
  playerCount: number;
  /** The last matches, newest first */
  form: PadelMatchOutcome[];
  partners: PadelPlayerRelation[];
  opponents: PadelPlayerRelation[];
  bestPartner: PadelPlayerRelation | null;
  toughestOpponent: PadelPlayerRelation | null;
  favouriteOpponent: PadelPlayerRelation | null;
  /** Newest first */
  history: PadelPlayerGame[];
}

export interface PadelStatsGame {
  id: string;
  name: string;
  format: PadelFormatName;
  plannedRounds: number | null;
  createdAt: Date | string;
  players: { id: string; name: string }[];
  rounds: {
    id: string;
    series: number;
    matches: {
      id?: string;
      team1: string[];
      team2: string[];
      team1Score: number | null;
      team2Score: number | null;
    }[];
  }[];
}

/** The ratings in a match, as they were when it was played */
export interface PadelMatchRating {
  /** Each team's average rating before the match */
  team1Rating: number;
  team2Rating: number;
  /** Each player's rating before the match and how much it changed, by id */
  players: Record<string, { before: number; change: number }>;
}

interface PlayerData extends Omit<PadelPlayerSummary, "recentGames"> {
  ratingValue: number;
  outcomes: PadelMatchOutcome[];
  partners: Record<string, PadelPlayerRelation>;
  opponents: Record<string, PadelPlayerRelation>;
  history: PadelPlayerGame[];
}

const emptyRecord = (): PadelRecord => ({
  matches: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  pointsWon: 0,
  pointsLost: 0,
});

const addResult = (record: PadelRecord, won: number, lost: number) => {
  record.matches++;
  record.pointsWon += won;
  record.pointsLost += lost;
  if (won > lost) record.wins++;
  else if (won < lost) record.losses++;
  else record.draws++;
};

/** Share of the points won, 0.5 when nothing has been played */
export const padelPointShare = (record: PadelRecord) =>
  record.pointsWon + record.pointsLost > 0
    ? record.pointsWon / (record.pointsWon + record.pointsLost)
    : 0.5;

const toIso = (date: Date | string) => new Date(date).toISOString();

/**
 * Goes through every played match, oldest game first, and adds up records,
 * partners, opponents and an Elo style rating.
 *
 * The rating compares the share of the points a team wins with the share
 * expected from the two teams' average ratings, so beating a stronger team,
 * or beating a team by a lot, gives the most.
 */
const collectPadelStats = (
  games: PadelStatsGame[],
  /** Filled with the ratings of every played match, by match id */
  matchRatings?: Record<string, PadelMatchRating>,
) => {
  const players: Record<string, PlayerData> = {};
  const sorted = games
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  for (const game of sorted) {
    const keyById: Record<string, string> = {};
    const ratingBefore: Record<string, number> = {};
    for (const player of game.players) {
      const key = padelPlayerKey(player.name);
      keyById[player.id] = key;
      const data = players[key];
      if (data) {
        // Games are oldest first, so the last spelling wins
        data.name = player.name;
      } else {
        players[key] = {
          key,
          name: player.name,
          rating: PADEL_START_RATING,
          ratingValue: PADEL_START_RATING,
          games: 0,
          gamesWon: 0,
          lastPlayedAt: toIso(game.createdAt),
          ...emptyRecord(),
          outcomes: [],
          partners: {},
          opponents: {},
          history: [],
        };
      }
      ratingBefore[key] = players[key].ratingValue;
    }

    const playedInGame: Record<string, { matches: number; wins: number }> = {};
    for (const round of game.rounds) {
      for (const match of round.matches) {
        if (!isPadelMatchPlayed(match)) continue;
        const team1 = match.team1.map((id) => players[keyById[id]]);
        const team2 = match.team2.map((id) => players[keyById[id]]);
        if (team1.some((p) => !p) || team2.some((p) => !p)) continue;
        const score1 = match.team1Score as number;
        const score2 = match.team2Score as number;

        const average = (team: PlayerData[]) =>
          team.reduce((sum, p) => sum + p.ratingValue, 0) / team.length;
        const expected =
          1 / (1 + 10 ** ((average(team2) - average(team1)) / RATING_SCALE));
        const actual = score1 + score2 > 0 ? score1 / (score1 + score2) : 0.5;
        const change = RATING_K * (actual - expected);

        if (matchRatings && match.id) {
          const players: PadelMatchRating["players"] = {};
          match.team1.forEach((id, index) => {
            players[id] = {
              before: Math.round(team1[index].ratingValue),
              change: Math.round(change),
            };
          });
          match.team2.forEach((id, index) => {
            players[id] = {
              before: Math.round(team2[index].ratingValue),
              change: Math.round(-change),
            };
          });
          matchRatings[match.id] = {
            team1Rating: Math.round(average(team1)),
            team2Rating: Math.round(average(team2)),
            players,
          };
        }

        const sides = [
          { team: team1, others: team2, won: score1, lost: score2, change },
          {
            team: team2,
            others: team1,
            won: score2,
            lost: score1,
            change: -change,
          },
        ];
        for (const side of sides) {
          for (const player of side.team) {
            player.ratingValue += side.change;
            addResult(player, side.won, side.lost);
            player.outcomes.push(
              side.won > side.lost ? "W" : side.won < side.lost ? "L" : "D",
            );
            const inGame = playedInGame[player.key] ?? { matches: 0, wins: 0 };
            inGame.matches++;
            if (side.won > side.lost) inGame.wins++;
            playedInGame[player.key] = inGame;

            for (const partner of side.team) {
              if (partner === player) continue;
              const relation = player.partners[partner.key] ?? {
                key: partner.key,
                name: partner.name,
                ...emptyRecord(),
              };
              addResult(relation, side.won, side.lost);
              player.partners[partner.key] = relation;
            }
            for (const opponent of side.others) {
              const relation = player.opponents[opponent.key] ?? {
                key: opponent.key,
                name: opponent.name,
                ...emptyRecord(),
              };
              addResult(relation, side.won, side.lost);
              player.opponents[opponent.key] = relation;
            }
          }
        }
      }
    }

    const status = getPadelGameStatus(game);
    for (const standing of getPadelStandings(game)) {
      const key = keyById[standing.playerId];
      const inGame = playedInGame[key];
      if (!inGame) continue;
      const player = players[key];
      player.games++;
      if (status.isFinished && standing.rank === 1) player.gamesWon++;
      player.lastPlayedAt = toIso(game.createdAt);
      player.history.push({
        gameId: game.id,
        name: game.name,
        format: game.format,
        createdAt: toIso(game.createdAt),
        rank: standing.rank,
        playerCount: game.players.length,
        total: standing.total,
        matches: inGame.matches,
        wins: inGame.wins,
        isFinished: status.isFinished,
        ratingBefore: Math.round(ratingBefore[key]),
        ratingChange: Math.round(player.ratingValue - ratingBefore[key]),
      });
    }
  }

  const list = Object.keys(players)
    .map((key) => players[key])
    .filter((player) => player.matches > 0);
  for (const player of list) {
    player.rating = Math.round(player.ratingValue);
    // Names of partners and opponents may have changed since
    for (const relations of [player.partners, player.opponents]) {
      for (const key of Object.keys(relations)) {
        relations[key].name = players[key].name;
      }
    }
  }
  list.sort(
    (a, b) => b.ratingValue - a.ratingValue || a.name.localeCompare(b.name),
  );
  return list;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toSummary = (player: PlayerData): PadelPlayerSummary => ({
  key: player.key,
  name: player.name,
  rating: player.rating,
  games: player.games,
  gamesWon: player.gamesWon,
  lastPlayedAt: player.lastPlayedAt,
  matches: player.matches,
  wins: player.wins,
  draws: player.draws,
  losses: player.losses,
  pointsWon: player.pointsWon,
  pointsLost: player.pointsLost,
  recentGames: player.history
    .filter(
      (game) =>
        new Date(player.lastPlayedAt).getTime() -
          new Date(game.createdAt).getTime() <
        DAY_MS,
    )
    .reverse()
    .map(({ createdAt, ratingBefore, ratingChange }) => ({
      createdAt,
      ratingBefore,
      ratingChange,
    })),
});

/** Everyone who has played a match, highest rating first */
export const buildPadelPlayerSummaries = (games: PadelStatsGame[]) =>
  collectPadelStats(games).map(toSummary);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * How much the rating changed on the last day the player played, in the
 * local time zone. `history` is newest first.
 */
export const getPadelDayRatingChange = (
  profile: {
    rating: number;
    history: PadelRecentGame[];
  },
  now: Date,
) => {
  if (profile.history.length === 0) return null;
  const day = new Date(profile.history[0].createdAt);
  const games = profile.history.filter((game) =>
    isSameDay(new Date(game.createdAt), day),
  );
  return {
    change: profile.rating - games[games.length - 1].ratingBefore,
    day,
    games: games.length,
    isToday: isSameDay(day, now),
  };
};

/**
 * The ratings in every played match of a game, by match id. Ratings carry
 * over from game to game, so all the user's games are needed.
 */
export const buildPadelMatchRatings = (
  games: PadelStatsGame[],
  gameId: string,
): Record<string, PadelMatchRating> => {
  const all: Record<string, PadelMatchRating> = {};
  collectPadelStats(games, all);
  const game = games.find((g) => g.id === gameId);
  const ratings: Record<string, PadelMatchRating> = {};
  for (const round of game?.rounds ?? []) {
    for (const match of round.matches) {
      if (match.id && all[match.id]) ratings[match.id] = all[match.id];
    }
  }
  return ratings;
};

const byMatches = (a: PadelPlayerRelation, b: PadelPlayerRelation) =>
  b.matches - a.matches || a.name.localeCompare(b.name);

/** The relation with the highest (or lowest) share of the points */
const pickHighlight = (
  relations: PadelPlayerRelation[],
  direction: 1 | -1,
): PadelPlayerRelation | null => {
  let best: PadelPlayerRelation | null = null;
  for (const relation of relations) {
    if (relation.matches < MIN_HIGHLIGHT_MATCHES) continue;
    const difference = best
      ? direction * (padelPointShare(relation) - padelPointShare(best))
      : 1;
    if (
      difference > 0 ||
      (difference === 0 && best && relation.matches > best.matches)
    ) {
      best = relation;
    }
  }
  return best;
};

export const buildPadelPlayerProfile = (
  games: PadelStatsGame[],
  key: string,
): PadelPlayerProfile | null => {
  const list = collectPadelStats(games);
  const index = list.findIndex((player) => player.key === padelPlayerKey(key));
  if (index === -1) return null;
  const player = list[index];
  const partners = Object.keys(player.partners)
    .map((k) => player.partners[k])
    .sort(byMatches);
  const opponents = Object.keys(player.opponents)
    .map((k) => player.opponents[k])
    .sort(byMatches);

  let toughestOpponent = pickHighlight(opponents, -1);
  let favouriteOpponent = pickHighlight(opponents, 1);
  // With a single candidate, it is only one of the two
  if (toughestOpponent && toughestOpponent === favouriteOpponent) {
    if (padelPointShare(toughestOpponent) < 0.5) favouriteOpponent = null;
    else toughestOpponent = null;
  }

  return {
    ...toSummary(player),
    ratingRank: index + 1,
    playerCount: list.length,
    form: player.outcomes.slice(-10).reverse(),
    partners,
    opponents,
    bestPartner: pickHighlight(partners, 1),
    toughestOpponent,
    favouriteOpponent,
    history: player.history.slice().reverse(),
  };
};
