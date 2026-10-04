// Americano padel: every player partners with every other player once, the
// matches are spread over the available courts, and the points each player's
// teams win are added up.

export const MIN_PADEL_PLAYERS = 4;
export const MAX_PADEL_PLAYERS = 24;
export const MIN_PADEL_POINTS = 4;
export const MAX_PADEL_POINTS = 99;
export const PADEL_POINT_PRESETS = [16, 21, 24, 32];

export const maxPadelCourts = (playerCount: number) =>
  Math.max(1, Math.floor(playerCount / 4));

/** Two players, as indices into the player list */
export type PadelTeam = [number, number];
export type PadelScheduledMatch = [PadelTeam, PadelTeam];
/** Rounds in play order, each holding the matches played at the same time */
export type PadelSchedule = PadelScheduledMatch[][];

type Random = () => number;

// Seeded, so a schedule can be reproduced
const createRandom = (seed: number): Random => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(items: T[], random: Random): T[] => {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const item = result[i];
    result[i] = result[j];
    result[j] = item;
  }
  return result;
};

const sharesPlayer = (a: PadelTeam, b: PadelTeam) =>
  a[0] === b[0] || a[0] === b[1] || a[1] === b[0] || a[1] === b[1];

const matchPlayers = (match: PadelScheduledMatch) => [
  match[0][0],
  match[0][1],
  match[1][0],
  match[1][1],
];

/**
 * Splits the players into partner pairs, one set at a time, so that every two
 * players are partners exactly once (the circle method). With an odd number
 * of players, a different player is left without a partner in each set.
 */
const partnerSets = (playerCount: number): PadelTeam[][] => {
  const size = playerCount % 2 === 0 ? playerCount : playerCount + 1;
  const sets: PadelTeam[][] = [];
  for (let set = 0; set < size - 1; set++) {
    const pairs: PadelTeam[] = [];
    const add = (a: number, b: number) => {
      if (a < playerCount && b < playerCount) pairs.push([a, b]);
    };
    add(size - 1, set);
    for (let k = 1; k < size / 2; k++) {
      add((set + k) % (size - 1), (set - k + size - 1) % (size - 1));
    }
    sets.push(pairs);
  }
  return sets;
};

/** Puts as many of the pairs as possible against each other */
const matchLeftoverPairs = (
  pairs: PadelTeam[],
  random: Random,
): PadelScheduledMatch[] => {
  let best: PadelScheduledMatch[] = [];
  const target = Math.floor(pairs.length / 2);
  for (let attempt = 0; attempt < 50 && best.length < target; attempt++) {
    const remaining = shuffle(pairs, random);
    const matches: PadelScheduledMatch[] = [];
    while (remaining.length > 0) {
      const pair = remaining.shift() as PadelTeam;
      const index = remaining.findIndex((other) => !sharesPlayer(pair, other));
      if (index >= 0) {
        matches.push([pair, remaining.splice(index, 1)[0]]);
      }
    }
    if (matches.length > best.length) best = matches;
  }
  return best;
};

/** Lower when players meet each other as opponents a similar number of times */
const opponentCost = (matches: PadelScheduledMatch[], playerCount: number) => {
  const counts: number[] = new Array(playerCount * playerCount).fill(0);
  let cost = 0;
  for (const [team1, team2] of matches) {
    for (const a of team1) {
      for (const b of team2) {
        const key = Math.min(a, b) * playerCount + Math.max(a, b);
        // Adding one to a count of c adds 2c + 1 to the sum of squares
        cost += 2 * counts[key] + 1;
        counts[key]++;
      }
    }
  }
  return cost;
};

/**
 * Every partner pair is put in exactly one match. When the number of pairs is
 * odd (6, 7, 10, 11, ... players) at least one pair can't play together.
 */
const planMatches = (
  playerCount: number,
  random: Random,
  attempts: number,
): PadelScheduledMatch[] => {
  const sets = partnerSets(playerCount);
  let best: {
    matches: PadelScheduledMatch[];
    unpaired: number;
    cost: number;
  } | null = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const matches: PadelScheduledMatch[] = [];
    const leftovers: PadelTeam[] = [];
    for (const set of sets) {
      // Pairs in the same set never share a player, so any two can meet
      const pairs = shuffle(set, random);
      if (pairs.length % 2 === 1) leftovers.push(pairs.pop() as PadelTeam);
      for (let i = 0; i < pairs.length; i += 2) {
        matches.push([pairs[i], pairs[i + 1]]);
      }
    }
    // Leftovers from different sets can share a player
    const extra = matchLeftoverPairs(leftovers, random);
    const all = matches.concat(extra);
    const unpaired = leftovers.length - extra.length * 2;
    const cost = opponentCost(all, playerCount);

    if (
      !best ||
      unpaired < best.unpaired ||
      (unpaired === best.unpaired && cost < best.cost)
    ) {
      best = { matches: all, unpaired, cost };
    }
  }

  return (best as { matches: PadelScheduledMatch[] }).matches;
};

/** The largest set of matches (at most `courts`) without a shared player */
const pickDisjoint = (masks: number[], courts: number): number[] => {
  let best: number[] = [];
  let nodes = 0;
  const visit = (start: number, picked: number[], used: number) => {
    if (picked.length > best.length) best = picked.slice();
    for (let i = start; i < masks.length; i++) {
      if (best.length === courts || nodes > 2000) return;
      if ((masks[i] & used) === 0) {
        nodes++;
        picked.push(i);
        visit(i + 1, picked, used | masks[i]);
        picked.pop();
      }
    }
  };
  visit(0, [], 0);
  return best;
};

const toMask = (match: PadelScheduledMatch) =>
  matchPlayers(match).reduce((mask, player) => mask | (1 << player), 0);

/**
 * Groups the matches into rounds. When `ordered`, matches are taken in the
 * order they were planned. Otherwise players with many matches left go first
 * (each extra match left needs a round of its own), weighted against how long
 * players have waited.
 */
const packRounds = (
  matches: PadelScheduledMatch[],
  playerCount: number,
  courts: number,
  random: Random,
  ordered: boolean,
  loadWeight: number,
): PadelSchedule => {
  let remaining = matches.slice();
  const lastPlayed: number[] = new Array(playerCount).fill(-1);
  const matchesLeft: number[] = new Array(playerCount).fill(0);
  for (const match of matches) {
    for (const player of matchPlayers(match)) matchesLeft[player]++;
  }
  const rounds: PadelSchedule = [];

  while (remaining.length > 0) {
    const roundIndex = rounds.length;
    const candidates = ordered
      ? remaining
      : remaining
          .map((match) => ({
            match,
            priority:
              matchPlayers(match).reduce(
                (sum, player) =>
                  sum +
                  loadWeight * matchesLeft[player] +
                  roundIndex -
                  lastPlayed[player],
                0,
              ) +
              random() * 2,
          }))
          .sort((a, b) => b.priority - a.priority)
          .map(({ match }) => match);

    const picked = pickDisjoint(candidates.map(toMask), courts).map(
      (index) => candidates[index],
    );
    for (const match of picked) {
      for (const player of matchPlayers(match)) {
        lastPlayed[player] = roundIndex;
        matchesLeft[player]--;
      }
    }
    rounds.push(picked);
    remaining = remaining.filter((match) => picked.indexOf(match) === -1);
  }

  return rounds;
};

const LOAD_WEIGHTS = [1, 2, 4, 8];

/** Lower when nobody sits out several rounds in a row or plays long streaks */
const restPenalty = (schedule: PadelSchedule, playerCount: number) => {
  let penalty = 0;
  for (let player = 0; player < playerCount; player++) {
    let sitting = 0;
    let playing = 0;
    for (const round of schedule) {
      const plays = round.some(
        (match) => matchPlayers(match).indexOf(player) !== -1,
      );
      if (plays) {
        if (sitting > 1) penalty += 10 * (sitting - 1) ** 2;
        sitting = 0;
        playing++;
      } else {
        penalty += 0.1 * playing ** 2;
        playing = 0;
        sitting++;
      }
    }
    if (sitting > 1) penalty += 10 * (sitting - 1) ** 2;
    penalty += 0.1 * playing ** 2;
  }
  return penalty;
};

/**
 * Creates an Americano schedule where every player partners with every other
 * player once. Rounds are as full as the courts allow, and sitting out is
 * spread as evenly as possible.
 */
export const createPadelSchedule = (
  playerCount: number,
  courtCount: number,
  shuffleSeed = Math.floor(Math.random() * 2 ** 31),
): PadelSchedule => {
  if (playerCount < MIN_PADEL_PLAYERS || playerCount > MAX_PADEL_PLAYERS) {
    throw new Error(
      `An Americano needs ${MIN_PADEL_PLAYERS} to ${MAX_PADEL_PLAYERS} players`,
    );
  }
  const courts = Math.max(1, Math.min(courtCount, maxPadelCourts(playerCount)));
  // The shape of the schedule is the same every time for the same number of
  // players and courts, only who plays where changes
  const random = createRandom(playerCount * 100 + courts);

  // Which matches exist decides which of them can be played at the same
  // time, so several plans are tried
  const matchCount = Math.floor((playerCount * (playerCount - 1)) / 4);
  const fewestRounds = Math.ceil(matchCount / courts);
  const packAttempts = Math.max(4, Math.min(20, Math.floor(1500 / matchCount)));
  let best: { schedule: PadelSchedule; penalty: number } | null = null;

  // Small games are quick to plan, so they get more tries
  const plans = Math.max(12, Math.min(100, Math.floor(4000 / matchCount)));
  for (let plan = 0; plan < plans; plan++) {
    if (best && best.schedule.length === fewestRounds && plan >= 3) break;
    const matches = planMatches(playerCount, random, 30);

    for (let attempt = 0; attempt < packAttempts; attempt++) {
      const schedule = packRounds(
        matches,
        playerCount,
        courts,
        random,
        attempt === 0,
        LOAD_WEIGHTS[attempt % LOAD_WEIGHTS.length],
      );
      const penalty = restPenalty(schedule, playerCount);
      if (
        !best ||
        schedule.length < best.schedule.length ||
        (schedule.length === best.schedule.length && penalty < best.penalty)
      ) {
        best = { schedule, penalty };
      }
    }
  }

  // Shuffle who gets which spot in the plan, so the same group of players
  // doesn't get the same schedule every time
  const spots = shuffle(
    Array.from({ length: playerCount }, (_, index) => index),
    createRandom(shuffleSeed),
  );
  return (best as { schedule: PadelSchedule }).schedule.map((round) =>
    round.map(
      (match) =>
        match.map((team) => team.map((index) => spots[index])) as [
          PadelTeam,
          PadelTeam,
        ],
    ),
  );
};

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

// Results

interface PadelMatchResult {
  team1: string[];
  team2: string[];
  team1Score: number | null;
  team2Score: number | null;
}

interface PadelGameResults {
  players: { id: string; name: string }[];
  rounds: { id: string; matches: PadelMatchResult[] }[];
}

export const isPadelMatchPlayed = (match: PadelMatchResult) =>
  match.team1Score !== null && match.team2Score !== null;

export const isPadelRoundPlayed = (round: { matches: PadelMatchResult[] }) =>
  round.matches.every(isPadelMatchPlayed);

/** Rounds with a score can't be moved */
export const isPadelRoundStarted = (round: { matches: PadelMatchResult[] }) =>
  round.matches.some(isPadelMatchPlayed);

export const getPadelProgress = (game: PadelGameResults) => {
  const matches = game.rounds.flatMap((round) => round.matches);
  const played = matches.filter(isPadelMatchPlayed).length;
  const currentRoundIndex = game.rounds.findIndex(
    (round) => !isPadelRoundPlayed(round),
  );
  return {
    played,
    total: matches.length,
    isFinished: matches.length > 0 && played === matches.length,
    /** -1 when every round has been played */
    currentRoundIndex,
  };
};

export const getSittingOut = <Player extends { id: string }>(
  players: Player[],
  round: { matches: PadelMatchResult[] },
) =>
  players.filter(
    (player) =>
      !round.matches.some(
        (match) =>
          match.team1.indexOf(player.id) !== -1 ||
          match.team2.indexOf(player.id) !== -1,
      ),
  );

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

export const getPadelStandings = (game: PadelGameResults): PadelStanding[] => {
  const standings: PadelStanding[] = game.players.map((player) => ({
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
  const byId: Record<string, PadelStanding> = {};
  for (const standing of standings) byId[standing.playerId] = standing;

  for (const round of game.rounds) {
    for (const match of round.matches) {
      const sides = [
        { team: match.team1, score: match.team1Score, other: match.team2Score },
        { team: match.team2, score: match.team2Score, other: match.team1Score },
      ];
      for (const { team, score, other } of sides) {
        for (const playerId of team) {
          const standing = byId[playerId];
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

// Changing the order of the rounds

/** Moves a round, keeping rounds that have been started where they are */
export const movePadelRound = <Round extends { matches: PadelMatchResult[] }>(
  rounds: Round[],
  from: number,
  to: number,
): Round[] => {
  if (
    from === to ||
    to < 0 ||
    to >= rounds.length ||
    isPadelRoundStarted(rounds[from])
  ) {
    return rounds;
  }
  // Only the rounds that haven't started trade places
  const open = rounds
    .map((round, index) => ({ round, index }))
    .filter(({ round }) => !isPadelRoundStarted(round));
  const fromOpen = open.findIndex(({ index }) => index === from);
  let toOpen = open.findIndex(({ index }) => index === to);
  if (toOpen === -1) {
    // Skip past started rounds in the direction of the move
    const later = open.filter(({ index }) =>
      to > from ? index > to : index < to,
    );
    if (later.length === 0) return rounds;
    toOpen = open.indexOf(to > from ? later[0] : later[later.length - 1]);
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
 * for when someone needs a break. Returns `null` when that isn't possible.
 */
export const restPadelPlayerNext = <
  Round extends { matches: PadelMatchResult[] },
>(
  rounds: Round[],
  playerId: string,
): Round[] | null => {
  const next = rounds.findIndex((round) => !isPadelRoundStarted(round));
  if (next === -1) return null;
  const restIndex = rounds.findIndex(
    (round, index) =>
      index >= next &&
      !isPadelRoundStarted(round) &&
      !round.matches.some(
        (match) =>
          match.team1.indexOf(playerId) !== -1 ||
          match.team2.indexOf(playerId) !== -1,
      ),
  );
  if (restIndex === -1) return null;
  return movePadelRound(rounds, restIndex, next);
};
