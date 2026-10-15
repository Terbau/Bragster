// Rallies found in padel videos: which match each rally belongs to, who won
// it, and statistics. The analyzer (see /analyzer) finds the rallies and
// guesses who won from the video alone. The guesses are adjusted here to the
// score of the match, and a guess that isn't sure enough is left out.

import { padelPlayerKey } from "./padelStats";

export type PadelTeamNumber = 1 | 2;

/** A guess has to be at least this likely to be shown */
export const PADEL_SURE_GUESS = 0.9;
export const SHORT_RALLY_SECONDS = 8;
export const LONG_RALLY_SECONDS = 20;

export interface PadelVideoRallyRow {
  id: string;
  start: number;
  end: number;
  nearWinProbability: number;
  winnerMatchId: string | null;
  winnerTeam: number | null;
  isIgnored: boolean;
}

export interface PadelVideoRecordingRow {
  id: string;
  matchId: string | null;
  matchCount: number | null;
  nearTeams: unknown;
  rallies: PadelVideoRallyRow[];
}

export interface PadelVideoGame {
  pointsPerMatch: number;
  rounds: {
    id: string;
    series: number;
    matches: {
      id: string;
      court: number;
      team1: string[];
      team2: string[];
      team1Score: number | null;
      team2Score: number | null;
    }[];
  }[];
}

type GameMatch = PadelVideoGame["rounds"][number]["matches"][number];

export interface PadelVideoRally {
  id: string;
  /** 1 is the first rally of the match */
  number: number;
  start: number;
  end: number;
  duration: number;
  winnerTeam: PadelTeamNumber | null;
  /** "manual" when a person said who won, "guess" when it was worked out */
  winnerSource: "manual" | "guess" | null;
  /** Null for rallies that weren't points */
  team1WinProbability: number | null;
  isIgnored: boolean;
}

export interface PadelVideoTeamStats {
  won: number;
  shortWon: number;
  longWon: number;
}

export interface PadelVideoStats {
  rallies: number;
  /** Seconds */
  playTime: number;
  averageRally: number;
  longestRally: { id: string; duration: number } | null;
  /** Rallies where it is known who won */
  decided: number;
  shortDecided: number;
  longDecided: number;
}

export interface PadelVideoMatchStats extends PadelVideoStats {
  team1: PadelVideoTeamStats;
  team2: PadelVideoTeamStats;
}

export interface PadelVideoMatch {
  matchId: string;
  series: number;
  /** In the series, 1 is the first round */
  roundNumber: number;
  court: number;
  team1: string[];
  team2: string[];
  team1Score: number | null;
  team2Score: number | null;
  nearTeam: PadelTeamNumber | null;
  isNearTeamGuess: boolean;
  rallies: PadelVideoRally[];
  stats: PadelVideoMatchStats;
}

export interface PadelVideoLayout {
  matchCount: number;
  isMatchCountGuess: boolean;
  /** The video can't cover more matches than are left on the court */
  maxMatchCount: number;
  matches: PadelVideoMatch[];
  /** Rallies that can't be placed, when the match of the video is gone */
  unplaced: PadelVideoRally[];
}

const clampProbability = (value: number) =>
  Math.min(0.98, Math.max(0.02, value));

/** The near team set by a person, by match id */
export const readNearTeams = (
  value: unknown,
): Record<string, PadelTeamNumber> => {
  const result: Record<string, PadelTeamNumber> = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [matchId, team] of Object.entries(value)) {
      if (team === 1 || team === 2) result[matchId] = team;
    }
  }
  return result;
};

/** The matches on a court, in play order */
export const padelCourtMatches = (game: PadelVideoGame, court: number) => {
  const result: { match: GameMatch; series: number; roundNumber: number }[] =
    [];
  for (const round of game.rounds) {
    const match = round.matches.find((m) => m.court === court);
    if (!match) continue;
    const roundNumber =
      game.rounds
        .filter((r) => r.series === round.series)
        .findIndex((r) => r.id === round.id) + 1;
    result.push({ match, series: round.series, roundNumber });
  }
  return result;
};

/** The matches on the court of `firstMatchId`, from that match on, in play order */
export const padelCourtMatchesFrom = (
  game: PadelVideoGame,
  firstMatchId: string | null,
) => {
  const court = game.rounds
    .flatMap((round) => round.matches)
    .find((match) => match.id === firstMatchId)?.court;
  if (court === undefined) return [];
  const matches = padelCourtMatches(game, court);
  return matches.slice(
    matches.findIndex(({ match }) => match.id === firstMatchId),
  );
};

const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** Each match in a video costs this much, so extra matches must fit better */
const MATCH_COST = 3;

/**
 * Splits the rallies of a video into `expected.length` matches played one
 * after the other. Every match should have about its expected number of
 * points, except that the video can start in the middle of the first match
 * and stop in the middle of the last one. There is usually a long break
 * between matches.
 *
 * Returns the index of the first rally of every match after the first, and
 * how badly the matches fit, or an infinite cost when it isn't possible.
 */
const splitWithCost = (
  rallies: { start: number; end: number; isIgnored: boolean }[],
  expected: number[],
) => {
  const segments = expected.length;
  const count = rallies.length;
  if (segments === 0 || (segments > 1 && count < segments)) {
    return { starts: [], cost: Number.POSITIVE_INFINITY };
  }

  // Points before each rally, ignored rallies don't count
  const points = [0];
  for (const rally of rallies) {
    points.push(points[points.length - 1] + (rally.isIgnored ? 0 : 1));
  }
  const gaps = rallies.map((rally, index) =>
    index === 0 ? 0 : Math.max(0.5, rally.start - rallies[index - 1].end),
  );
  const usualGap = Math.max(1, median(gaps.slice(1)));

  const segmentCost = (from: number, to: number, segment: number) => {
    const played = points[to] - points[from];
    const target = expected[segment];
    const spread = Math.max(2, 0.15 * target);
    const miss = (played - target) / spread;
    // Filming can start after the first match began, and stop before the
    // last one is over
    const isCut =
      (segment === 0 || segment === segments - 1) && played < target;
    return (isCut ? 0.1 : 1) * miss * miss;
  };
  // Starting a match after a long break is likely
  const breakCost = (index: number) => -2 * Math.log(gaps[index] / usualGap);

  if (segments === 1) {
    return { starts: [], cost: segmentCost(0, count, 0) };
  }

  // best[s][i]: cost of the first i rallies in s matches
  const best = Array.from({ length: segments + 1 }, () =>
    new Array<number>(count + 1).fill(Number.POSITIVE_INFINITY),
  );
  const from = Array.from({ length: segments + 1 }, () =>
    new Array<number>(count + 1).fill(0),
  );
  best[0][0] = 0;
  for (let segment = 1; segment <= segments; segment++) {
    for (let end = segment; end <= count; end++) {
      for (let start = segment - 1; start < end; start++) {
        if (best[segment - 1][start] === Number.POSITIVE_INFINITY) continue;
        const cost =
          best[segment - 1][start] +
          segmentCost(start, end, segment - 1) +
          (segment > 1 ? breakCost(start) : 0);
        if (cost < best[segment][end]) {
          best[segment][end] = cost;
          from[segment][end] = start;
        }
      }
    }
  }

  const starts: number[] = [];
  let end = count;
  for (let segment = segments; segment > 1; segment--) {
    end = from[segment][end];
    starts.unshift(end);
  }
  return { starts, cost: best[segments][count] };
};

/** The index of the first rally of every match after the first */
export const splitPadelRallies = (
  rallies: { start: number; end: number; isIgnored: boolean }[],
  expected: number[],
) => splitWithCost(rallies, expected).starts;

/**
 * How many matches a video likely covers, out of the matches left on the
 * court, from the number of rallies and the breaks between them
 */
export const guessPadelMatchCount = (
  rallies: { start: number; end: number; isIgnored: boolean }[],
  expected: number[],
) => {
  const played = rallies.filter((rally) => !rally.isIgnored).length;
  const smallest = Math.max(1, Math.min(...expected));
  const most = Math.min(expected.length, Math.ceil(played / smallest) + 1);
  let bestCount = 1;
  let bestCost = Number.POSITIVE_INFINITY;
  for (let matches = 1; matches <= Math.max(1, most); matches++) {
    const cost =
      splitWithCost(rallies, expected.slice(0, matches)).cost +
      MATCH_COST * matches;
    if (cost < bestCost) {
      bestCost = cost;
      bestCount = matches;
    }
  }
  return bestCount;
};

/** Probability of each number of successes, for independent chances */
const successCounts = (chances: number[]) => {
  let counts = [1];
  for (const chance of chances) {
    const next = new Array<number>(counts.length + 1).fill(0);
    counts.forEach((probability, successes) => {
      next[successes] += probability * (1 - chance);
      next[successes + 1] += probability * chance;
    });
    counts = next;
  }
  return counts;
};

/**
 * The chance of each event, and how likely the chances are, when the number
 * of events that happened is itself uncertain. `weight(k)` is how likely it
 * is that k of them happened.
 */
const chancesGivenCount = (
  chances: number[],
  weight: (count: number) => number,
) => {
  const all = successCounts(chances);
  const likelihood = all.reduce(
    (sum, probability, count) => sum + probability * weight(count),
    0,
  );
  if (!(likelihood > 0)) return { chances, likelihood: 0 };
  return {
    likelihood,
    chances: chances.map((chance, index) => {
      const others = successCounts(chances.filter((_, i) => i !== index));
      const withWin = others.reduce(
        (sum, probability, count) => sum + probability * weight(count + 1),
        0,
      );
      return (chance * withWin) / likelihood;
    }),
  };
};

const logFactorials = [0];
const logFactorial = (n: number) => {
  for (let i = logFactorials.length; i <= n; i++) {
    logFactorials.push(logFactorials[i - 1] + Math.log(i));
  }
  return logFactorials[n];
};
const logChoose = (n: number, k: number) =>
  k < 0 || k > n
    ? Number.NEGATIVE_INFINITY
    : logFactorial(n) - logFactorial(k) - logFactorial(n - k);

/**
 * How likely it is that a team won `won` of the `found` rallies, when it won
 * `score` of the match's `total` points. When the video has every point, it
 * must be exactly the score. When it has some of them, like a video that
 * stopped early, it's like drawing that many of the points at random.
 */
const rallyWinsWeight = (
  won: number,
  found: number,
  score: number,
  total: number,
) => {
  if (found <= total) {
    return Math.exp(
      logChoose(score, won) +
        logChoose(total - score, found - won) -
        logChoose(total, found),
    );
  }
  // More rallies than points, some of them weren't points
  const share = Math.min(0.98, Math.max(0.02, score / total));
  return Math.exp(
    logChoose(found, won) +
      won * Math.log(share) +
      (found - won) * Math.log(1 - share),
  );
};

const log = (value: number) => Math.log(Math.max(value, 1e-12));

interface LabelInput {
  match: GameMatch;
  rallies: PadelVideoRallyRow[];
  nearTeam: PadelTeamNumber | undefined;
}

/**
 * Works out which team is nearest the camera and who won each rally, from
 * the guesses of the video, the score, and the rallies a person labelled
 */
export const labelPadelRallies = ({ match, rallies, nearTeam }: LabelInput) => {
  const played = rallies.filter((rally) => !rally.isIgnored);
  const isManual = (rally: PadelVideoRallyRow) =>
    rally.winnerMatchId === match.id &&
    (rally.winnerTeam === 1 || rally.winnerTeam === 2);
  const manual = played.filter(isManual);
  const guessed = played.filter((rally) => !isManual(rally));
  const chances = guessed.map((rally) =>
    clampProbability(rally.nearWinProbability),
  );

  const hasScore = match.team1Score !== null && match.team2Score !== null;
  const totalPoints = (match.team1Score ?? 0) + (match.team2Score ?? 0);

  // Each side nearest the camera, weighed by how well it fits the rallies
  // labelled by hand and the score. When the side isn't known, both count.
  const sides: PadelTeamNumber[] = nearTeam ? [nearTeam] : [1, 2];
  const fits = sides.map((side) => {
    let logLikelihood = 0;
    for (const rally of manual) {
      const chance = clampProbability(rally.nearWinProbability);
      logLikelihood += log(rally.winnerTeam === side ? chance : 1 - chance);
    }
    if (!hasScore || totalPoints === 0) {
      return { logLikelihood, nearWins: chances };
    }
    const nearScore = (side === 1 ? match.team1Score : match.team2Score) ?? 0;
    const manualNearWins = manual.filter(
      (rally) => rally.winnerTeam === side,
    ).length;
    const { chances: nearWins, likelihood } = chancesGivenCount(
      chances,
      (guessedNearWins) =>
        rallyWinsWeight(
          manualNearWins + guessedNearWins,
          played.length,
          nearScore,
          totalPoints,
        ),
    );
    return { logLikelihood: logLikelihood + log(likelihood), nearWins };
  });
  const highest = Math.max(...fits.map((fit) => fit.logLikelihood));
  const weights = fits.map((fit) => Math.exp(fit.logLikelihood - highest));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const sideChances = weights.map((weight) => weight / totalWeight);

  // The chance that team 1 won each guessed rally, over both sides
  const team1Chances = new Array<number>(guessed.length).fill(0);
  sides.forEach((side, index) => {
    fits[index].nearWins.forEach((chance, rally) => {
      team1Chances[rally] +=
        sideChances[index] * (side === 1 ? chance : 1 - chance);
    });
  });
  const guessById = new Map(
    guessed.map((rally, index) => [rally.id, team1Chances[index]]),
  );
  const likeliestSide = sides[sideChances.indexOf(Math.max(...sideChances))];
  const near =
    nearTeam ??
    (Math.max(...sideChances) >= PADEL_SURE_GUESS ? likeliestSide : null);

  const labelled: PadelVideoRally[] = [];
  let number = 0;
  for (const rally of rallies) {
    const base = {
      id: rally.id,
      number: rally.isIgnored ? 0 : ++number,
      start: rally.start,
      end: rally.end,
      duration: rally.end - rally.start,
      isIgnored: rally.isIgnored,
    };
    if (rally.isIgnored) {
      labelled.push({
        ...base,
        winnerTeam: null,
        winnerSource: null,
        team1WinProbability: null,
      });
    } else if (isManual(rally)) {
      labelled.push({
        ...base,
        winnerTeam: rally.winnerTeam as PadelTeamNumber,
        winnerSource: "manual",
        team1WinProbability: rally.winnerTeam === 1 ? 1 : 0,
      });
    } else {
      const team1Wins = guessById.get(rally.id) ?? 0.5;
      const winnerTeam =
        team1Wins >= PADEL_SURE_GUESS
          ? 1
          : team1Wins <= 1 - PADEL_SURE_GUESS
            ? 2
            : null;
      labelled.push({
        ...base,
        winnerTeam,
        winnerSource: winnerTeam ? "guess" : null,
        team1WinProbability: team1Wins,
      });
    }
  }
  return { nearTeam: near, rallies: labelled };
};

export const emptyPadelVideoStats = (): PadelVideoStats => ({
  rallies: 0,
  playTime: 0,
  averageRally: 0,
  longestRally: null,
  decided: 0,
  shortDecided: 0,
  longDecided: 0,
});

export const addPadelVideoRally = (
  stats: PadelVideoStats,
  rally: PadelVideoRally,
) => {
  if (rally.isIgnored) return;
  stats.rallies++;
  stats.playTime += rally.duration;
  stats.averageRally = stats.playTime / stats.rallies;
  if (!stats.longestRally || rally.duration > stats.longestRally.duration) {
    stats.longestRally = { id: rally.id, duration: rally.duration };
  }
  if (rally.winnerTeam) {
    stats.decided++;
    if (rally.duration < SHORT_RALLY_SECONDS) stats.shortDecided++;
    if (rally.duration >= LONG_RALLY_SECONDS) stats.longDecided++;
  }
};

const addTeamRally = (stats: PadelVideoTeamStats, rally: PadelVideoRally) => {
  stats.won++;
  if (rally.duration < SHORT_RALLY_SECONDS) stats.shortWon++;
  if (rally.duration >= LONG_RALLY_SECONDS) stats.longWon++;
};

export const padelVideoMatchStats = (
  rallies: PadelVideoRally[],
): PadelVideoMatchStats => {
  const stats: PadelVideoMatchStats = {
    ...emptyPadelVideoStats(),
    team1: { won: 0, shortWon: 0, longWon: 0 },
    team2: { won: 0, shortWon: 0, longWon: 0 },
  };
  for (const rally of rallies) {
    addPadelVideoRally(stats, rally);
    if (!rally.isIgnored && rally.winnerTeam) {
      addTeamRally(rally.winnerTeam === 1 ? stats.team1 : stats.team2, rally);
    }
  }
  return stats;
};

/** Places the rallies of a video in its matches, and labels them */
export const layOutPadelVideo = (
  game: PadelVideoGame,
  recording: PadelVideoRecordingRow,
): PadelVideoLayout => {
  const rallies = recording.rallies.slice().sort((a, b) => a.start - b.start);
  const courtMatches = padelCourtMatchesFrom(game, recording.matchId);
  if (courtMatches.length === 0) {
    const { rallies: unplaced } = labelPadelRallies({
      match: {
        id: "",
        court: 0,
        team1: [],
        team2: [],
        team1Score: null,
        team2Score: null,
      },
      rallies,
      nearTeam: undefined,
    });
    return {
      matchCount: 0,
      isMatchCountGuess: false,
      maxMatchCount: 0,
      matches: [],
      unplaced,
    };
  }

  const maxMatchCount = courtMatches.length;
  const expected = courtMatches.map(({ match }) =>
    match.team1Score !== null && match.team2Score !== null
      ? match.team1Score + match.team2Score
      : game.pointsPerMatch,
  );
  const isMatchCountGuess = recording.matchCount === null;
  const matchCount = Math.min(
    maxMatchCount,
    recording.matchCount ?? guessPadelMatchCount(rallies, expected),
  );
  const covered = courtMatches.slice(0, matchCount);
  const starts = splitPadelRallies(rallies, expected.slice(0, matchCount));
  const bounds = [0, ...starts, rallies.length];
  const nearTeams = readNearTeams(recording.nearTeams);

  const matches = covered.map(({ match, series, roundNumber }, index) => {
    const labelled = labelPadelRallies({
      match,
      rallies: rallies.slice(bounds[index], bounds[index + 1]),
      nearTeam: nearTeams[match.id],
    });
    return {
      matchId: match.id,
      series,
      roundNumber,
      court: match.court,
      team1: match.team1,
      team2: match.team2,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      nearTeam: labelled.nearTeam,
      isNearTeamGuess: nearTeams[match.id] === undefined,
      rallies: labelled.rallies,
      stats: padelVideoMatchStats(labelled.rallies),
    };
  });

  return {
    matchCount,
    isMatchCountGuess,
    maxMatchCount,
    matches,
    unplaced: [],
  };
};

export interface PadelPlayerVideoStats extends PadelVideoStats {
  /** Filmed matches the player played */
  matches: number;
  won: number;
  shortWon: number;
  longWon: number;
  longestRallyWon: {
    duration: number;
    gameId: string;
    recordingId: string;
    rallyId: string;
  } | null;
}

/** What the videos tell about a player, null when they haven't been filmed */
export const buildPadelPlayerVideoStats = (
  videos: {
    game: PadelVideoGame & {
      id: string;
      players: { id: string; name: string }[];
    };
    recording: PadelVideoRecordingRow;
  }[],
  key: string,
): PadelPlayerVideoStats | null => {
  const stats: PadelPlayerVideoStats = {
    ...emptyPadelVideoStats(),
    matches: 0,
    won: 0,
    shortWon: 0,
    longWon: 0,
    longestRallyWon: null,
  };
  for (const { game, recording } of videos) {
    const player = game.players.find(
      (p) => padelPlayerKey(p.name) === padelPlayerKey(key),
    );
    if (!player) continue;
    for (const match of layOutPadelVideo(game, recording).matches) {
      const team = match.team1.includes(player.id)
        ? 1
        : match.team2.includes(player.id)
          ? 2
          : null;
      if (!team) continue;
      stats.matches++;
      for (const rally of match.rallies) {
        addPadelVideoRally(stats, rally);
        if (rally.isIgnored || rally.winnerTeam !== team) continue;
        stats.won++;
        if (rally.duration < SHORT_RALLY_SECONDS) stats.shortWon++;
        if (rally.duration >= LONG_RALLY_SECONDS) stats.longWon++;
        if (
          !stats.longestRallyWon ||
          rally.duration > stats.longestRallyWon.duration
        ) {
          stats.longestRallyWon = {
            duration: rally.duration,
            gameId: game.id,
            recordingId: recording.id,
            rallyId: rally.id,
          };
        }
      }
    }
  }
  return stats.matches > 0 ? stats : null;
};
