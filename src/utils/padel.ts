// Americano padel: every player partners with every other player once, the
// matches are spread over the available courts, and the points each player's
// teams win are added up. An ELO Americano also puts teams of about the same
// strength against each other, from the players' ratings. In a Mexicano, each
// round is instead drawn from the leaderboard, so players of the same level
// meet.

export const MIN_PADEL_PLAYERS = 4;
export const MAX_PADEL_PLAYERS = 24;
export const MIN_PADEL_POINTS = 4;
export const MAX_PADEL_POINTS = 99;
export const DEFAULT_PADEL_POINTS = 16;
export const PADEL_POINT_PRESETS = [16, 21, 24, 32];
export const MIN_PADEL_ROUNDS = 1;
export const MAX_PADEL_ROUNDS = 50;
export const MAX_PADEL_COURT_NAME_LENGTH = 20;

export type PadelFormatName = "AMERICANO" | "ELO_AMERICANO" | "MEXICANO";

export const padelFormatLabel = (format: PadelFormatName) =>
  format === "MEXICANO"
    ? "Mexicano"
    : format === "ELO_AMERICANO"
      ? "ELO Americano"
      : "Americano";

/** Like "Americano 13 Oct" */
export const defaultPadelGameName = (
  format: PadelFormatName,
  date = new Date(),
) =>
  `${padelFormatLabel(format)} ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date)}`;

/** Names made by `defaultPadelGameName` get today's date when played again */
export const isDefaultPadelGameName = (name: string) =>
  /^(Americano|ELO Americano|Mexicano) \d{1,2} [A-Za-z]{3,4}$/.test(name);

/** "Court 2", unless the court has been given a name */
export const padelCourtName = (courtNames: string[], court: number) =>
  courtNames[court - 1]?.trim() || `Court ${court}`;

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

// ELO Americano

/**
 * A difference this big between the ratings of two teams that meet counts
 * about as much as two players meeting as opponents once more than needed
 */
const BALANCE_SCALE = 35;
/**
 * In an Americano, two players meet as opponents about twice. More often than
 * this costs a lot more.
 */
const MAX_USUAL_MEETINGS = 3;

/** The cost of two players meeting as opponents `count` times */
const meetingCost = (count: number) =>
  count * count + 10 * Math.max(0, count - MAX_USUAL_MEETINGS) ** 2;

/** Lower when the teams that meet have about the same rating */
const imbalanceCost = (matches: PadelScheduledMatch[], ratings: number[]) => {
  let cost = 0;
  for (const [team1, team2] of matches) {
    // A team's rating is the average of its players'
    const difference =
      (ratings[team1[0]] +
        ratings[team1[1]] -
        ratings[team2[0]] -
        ratings[team2[1]]) /
      2;
    cost += (difference / BALANCE_SCALE) ** 2;
  }
  return cost;
};

/**
 * Turns an Americano schedule into an ELO Americano, where teams of about the
 * same strength meet while everyone still meets a variety of opponents.
 * Partners, rounds and who sits out stay as they are. What changes is which
 * player gets which spot in the plan (`spots`, except the `fixed` spots), and
 * which pairs of a round play each other. Returns the schedule in player
 * numbers.
 *
 * Within a round any two pairs can meet. They start out meeting in order of
 * strength, which gives the most even matches, and then two matches at a time
 * swap opponents as long as that makes the schedule better. Around that,
 * players swap spots two at a time, also as long as that helps.
 */
const balanceRounds = (
  schedule: PadelSchedule,
  ratings: number[],
  initialSpots: number[],
  fixed: number[],
  random: Random,
): PadelSchedule => {
  const playerCount = ratings.length;
  const roundPairs = schedule.map((round) =>
    round.flatMap((match) => [match[0], match[1]]),
  );
  const strength = (pair: PadelTeam) => ratings[pair[0]] + ratings[pair[1]];
  // The cost is the imbalance of every match, and how often each two players
  // meet as opponents, where meeting the same players again costs more and
  // more (like `opponentCost`)
  const opponents: number[] = new Array(playerCount * playerCount).fill(0);
  /** Adds or removes a match, and returns how that changes the cost */
  const add = (match: PadelScheduledMatch, sign: 1 | -1) => {
    let change = sign * imbalanceCost([match], ratings);
    for (const a of match[0]) {
      for (const b of match[1]) {
        const key = Math.min(a, b) * playerCount + Math.max(a, b);
        const before = opponents[key];
        opponents[key] += sign;
        change += meetingCost(opponents[key]) - meetingCost(before);
      }
    }
    return change;
  };

  /** Good matches within each round, for who is who in `spots` */
  const arrange = (spots: number[]) => {
    opponents.fill(0);
    let cost = 0;
    const rounds = roundPairs.map((pairs) => {
      const sorted = pairs
        .map((pair): PadelTeam => [spots[pair[0]], spots[pair[1]]])
        .sort((a, b) => strength(a) - strength(b));
      const matches: PadelScheduledMatch[] = [];
      for (let i = 0; i + 1 < sorted.length; i += 2) {
        const match: PadelScheduledMatch = [sorted[i], sorted[i + 1]];
        cost += add(match, 1);
        matches.push(match);
      }
      return matches;
    });
    let improved = true;
    for (let pass = 0; improved && pass < 10; pass++) {
      improved = false;
      for (const round of rounds) {
        for (let i = 0; i < round.length; i++) {
          for (let j = i + 1; j < round.length; j++) {
            const [a, b] = round[i];
            const [c, d] = round[j];
            const options: [PadelScheduledMatch, PadelScheduledMatch][] = [
              [
                [a, c],
                [b, d],
              ],
              [
                [a, d],
                [b, c],
              ],
            ];
            for (const [first, second] of options) {
              const change =
                add(round[i], -1) +
                add(round[j], -1) +
                add(first, 1) +
                add(second, 1);
              if (change < -1e-9) {
                round[i] = first;
                round[j] = second;
                cost += change;
                improved = true;
                break;
              }
              add(first, -1);
              add(second, -1);
              add(round[i], 1);
              add(round[j], 1);
            }
          }
        }
      }
    }
    return { rounds, cost };
  };

  const free = initialSpots
    .map((_, spot) => spot)
    .filter((spot) => fixed.indexOf(spot) === -1);
  const matchCount = schedule.reduce((sum, round) => sum + round.length, 0);
  const courts = Math.max(...schedule.map((round) => round.length));
  // How many arrangements fit in `BALANCE_WORK`
  let evaluations = Math.max(
    60,
    Math.floor(BALANCE_WORK / (matchCount * (8 + courts * courts))),
  );
  let best: { rounds: PadelSchedule; cost: number } | null = null;
  for (let restart = 0; evaluations > 0 && restart < 30; restart++) {
    const spots = initialSpots.slice();
    if (restart > 0) {
      const shuffled = shuffle(
        free.map((spot) => initialSpots[spot]),
        random,
      );
      free.forEach((spot, index) => {
        spots[spot] = shuffled[index];
      });
    }
    let current = arrange(spots);
    evaluations--;
    let improved = true;
    while (improved && evaluations > 0) {
      improved = false;
      for (let i = 0; i < free.length && evaluations > 0; i++) {
        for (let j = i + 1; j < free.length && evaluations > 0; j++) {
          const a = free[i];
          const b = free[j];
          if (ratings[spots[a]] === ratings[spots[b]]) continue;
          [spots[a], spots[b]] = [spots[b], spots[a]];
          const next = arrange(spots);
          evaluations--;
          if (next.cost < current.cost - 1e-9) {
            current = next;
            improved = true;
          } else {
            [spots[a], spots[b]] = [spots[b], spots[a]];
          }
        }
      }
    }
    if (!best || current.cost < best.cost) best = current;
  }
  return (best as { rounds: PadelSchedule }).rounds;
};

/** Limits the time spent making an ELO Americano even, a few 100 ms at most */
const BALANCE_WORK = 3e5;

// Rounds

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

/** The court of each player in a round, -1 when sitting out */
const courtsOf = (round: PadelScheduledMatch[], playerCount: number) => {
  const courts: number[] = new Array(playerCount).fill(-1);
  round.forEach((match, court) => {
    for (const player of matchPlayers(match)) courts[player] = court;
  });
  return courts;
};

/** How many pairs of the match's players shared a court in the last round */
const repeatedPairs = (match: PadelScheduledMatch, lastCourts: number[]) => {
  const players = matchPlayers(match);
  let count = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const court = lastCourts[players[i]];
      if (court !== -1 && court === lastCourts[players[j]]) count++;
    }
  }
  return count;
};

/**
 * Groups the matches into rounds. When `ordered`, matches are taken in the
 * order they were planned. Otherwise players with many matches left go first
 * (each extra match left needs a round of its own), weighted against how long
 * players have waited and whether they just shared a court.
 */
const packRounds = (
  matches: PadelScheduledMatch[],
  playerCount: number,
  courts: number,
  random: Random,
  ordered: boolean,
  loadWeight: number,
  togetherWeight: number,
): PadelSchedule => {
  let remaining = matches.slice();
  const lastPlayed: number[] = new Array(playerCount).fill(-1);
  const matchesLeft: number[] = new Array(playerCount).fill(0);
  for (const match of matches) {
    for (const player of matchPlayers(match)) matchesLeft[player]++;
  }
  let lastCourts: number[] = new Array(playerCount).fill(-1);
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
              ) -
              togetherWeight * repeatedPairs(match, lastCourts) +
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
    lastCourts = courtsOf(picked, playerCount);
    rounds.push(picked);
    remaining = remaining.filter((match) => picked.indexOf(match) === -1);
  }

  return rounds;
};

const LOAD_WEIGHTS = [1, 2, 4, 8];
/** How much sharing a court with someone again right away holds a match back */
const TOGETHER_WEIGHT = 3;

/** A round, ready for `schedulePenalty` */
interface RoundGroups {
  courts: number[];
  /** Players on the same court, as `player1 * playerCount + player2` */
  pairs: number[];
}

const toRoundGroups = (
  round: PadelScheduledMatch[],
  playerCount: number,
): RoundGroups => ({
  courts: courtsOf(round, playerCount),
  pairs: round.flatMap((match) => {
    const players = matchPlayers(match).sort((a, b) => a - b);
    const pairs: number[] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        pairs.push(players[i] * playerCount + players[j]);
      }
    }
    return pairs;
  }),
});

/**
 * Lower when nobody sits out several rounds in a row or plays long streaks,
 * and when players don't share a court with the same players round after
 * round. Two rounds in a row with someone often can't be avoided, so that
 * costs little, but every round more costs a lot.
 */
const schedulePenalty = (rounds: RoundGroups[], playerCount: number) => {
  let penalty = 0;
  for (let player = 0; player < playerCount; player++) {
    let sitting = 0;
    let playing = 0;
    for (const round of rounds) {
      if (round.courts[player] !== -1) {
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

  // Rounds in a row each pair of players has shared a court
  const lastTogether: number[] = new Array(playerCount * playerCount).fill(-2);
  const streak: number[] = new Array(playerCount * playerCount).fill(0);
  rounds.forEach((round, index) => {
    for (const pair of round.pairs) {
      streak[pair] = lastTogether[pair] === index - 1 ? streak[pair] + 1 : 1;
      lastTogether[pair] = index;
      if (streak[pair] === 2) penalty += 1;
      else if (streak[pair] > 2) penalty += 6 * (streak[pair] - 2);
    }
  });
  return penalty;
};

/**
 * Changes the order of the rounds to lower `schedulePenalty`, counting from
 * the round played before them. Rounds with fewer matches stay at the end.
 * `work` limits the time it takes, see `ORDER_WORK`.
 */
const orderRounds = (
  schedule: PadelSchedule,
  playerCount: number,
  random: Random,
  previousRound: PadelScheduledMatch[] | undefined,
  work: number,
): PadelSchedule => {
  const groups = schedule.map((round) => toRoundGroups(round, playerCount));
  const before = previousRound?.length
    ? [toRoundGroups(previousRound, playerCount)]
    : [];
  const fullSize = Math.max(...schedule.map((round) => round.length));
  let movable = schedule.length;
  while (movable > 0 && schedule[movable - 1].length < fullSize) movable--;

  // How many penalties fit in `work`
  let evaluations = Math.max(
    100,
    Math.floor(work / (schedule.length * (playerCount + 6 * fullSize))),
  );
  const cost = (order: number[]) => {
    evaluations--;
    return schedulePenalty(
      before.concat(order.map((index) => groups[index])),
      playerCount,
    );
  };
  const inOrder = schedule.map((_, index) => index);
  let best = inOrder;
  let bestCost = cost(best);

  // Small schedules are quick, so they get more tries
  const restarts = Math.max(4, Math.floor(1500 / (movable * movable)));
  for (let restart = 0; restart < restarts && evaluations > 0; restart++) {
    const order =
      restart === 0
        ? inOrder.slice()
        : shuffle(inOrder.slice(0, movable), random).concat(
            inOrder.slice(movable),
          );
    let current = cost(order);
    let improved = true;
    for (let pass = 0; improved && pass < 20; pass++) {
      improved = false;
      for (let i = 0; i < movable && evaluations > 0; i++) {
        for (let j = i + 1; j < movable && evaluations > 0; j++) {
          [order[i], order[j]] = [order[j], order[i]];
          const next = cost(order);
          if (next < current - 1e-9) {
            current = next;
            improved = true;
          } else {
            [order[i], order[j]] = [order[j], order[i]];
          }
        }
      }
    }
    if (current < bestCost) {
      best = order;
      bestCost = current;
    }
  }
  return best.map((index) => schedule[index]);
};

/** Limits the time spent putting rounds in order, a few 100 ms at most */
const ORDER_WORK = 3e7;
/** Schedules put in order, to pick the best of */
const FINALISTS = 8;

export interface PadelScheduleOptions {
  /**
   * Each player's rating. Teams of about the same strength are put against
   * each other (ELO Americano).
   */
  ratings?: number[];
  /**
   * With 6, 7, 10, 11, ... players, two players can't be partners. They play
   * one match less, so they sit out one round more than the others. These
   * players are picked for it, and the rest at random.
   */
  sitOutMore?: number[];
  /** The round played before, so the first round doesn't repeat its groups */
  previousRound?: PadelScheduledMatch[];
  /** Seeds who plays where */
  seed?: number;
}

/**
 * Creates an Americano schedule where every player partners with every other
 * player once. Rounds are as full as the courts allow, sitting out is spread
 * as evenly as possible, and players don't share a court with the same
 * players round after round.
 */
export const createPadelSchedule = (
  playerCount: number,
  courtCount: number,
  options: PadelScheduleOptions = {},
): PadelSchedule => {
  if (playerCount < MIN_PADEL_PLAYERS || playerCount > MAX_PADEL_PLAYERS) {
    throw new Error(
      `An Americano needs ${MIN_PADEL_PLAYERS} to ${MAX_PADEL_PLAYERS} players`,
    );
  }
  const { ratings } = options;
  if (ratings && ratings.length !== playerCount) {
    throw new Error("Every player needs a rating");
  }
  const courts = Math.max(1, Math.min(courtCount, maxPadelCourts(playerCount)));
  // The shape of an Americano is the same every time for the same number of
  // players and courts, only who plays where changes
  const shape = createRandom(playerCount * 100 + courts);
  const random = createRandom(
    options.seed ?? Math.floor(Math.random() * 2 ** 31),
  );
  const players = Array.from({ length: playerCount }, (_, index) => index);

  // The players who play one match less: the chosen ones, then at random
  const fewerMatches = estimatePadelGame(playerCount, courts).hasUnpairedPlayers
    ? 2
    : 0;
  const chosen = (options.sitOutMore ?? []).filter(
    (player, index, all) =>
      player >= 0 && player < playerCount && all.indexOf(player) === index,
  );
  const unpaired = chosen
    .concat(shuffle(players, random).filter((p) => chosen.indexOf(p) === -1))
    .slice(0, fewerMatches);

  // Which matches exist decides which of them can be played at the same
  // time, so several plans are tried
  const matchCount = Math.floor((playerCount * (playerCount - 1)) / 4);
  const fewestRounds = Math.ceil(matchCount / courts);
  const packAttempts = Math.max(4, Math.min(20, Math.floor(1500 / matchCount)));
  const penaltyOf = (schedule: PadelSchedule) =>
    schedulePenalty(
      schedule.map((round) => toRoundGroups(round, playerCount)),
      playerCount,
    );
  // The best schedules so far, fewest rounds first
  const candidates: { schedule: PadelSchedule; penalty: number }[] = [];

  // Small games are quick to plan, so they get more tries, and more again
  // while no plan fits in the fewest rounds possible
  const plans = Math.max(12, Math.min(100, Math.floor(4000 / matchCount)));
  for (let plan = 0; plan < plans * 3; plan++) {
    if (candidates[0]?.schedule.length === fewestRounds && plan >= 3) break;
    const matches = planMatches(playerCount, shape, 30);
    for (let attempt = 0; attempt < packAttempts; attempt++) {
      const schedule = packRounds(
        matches,
        playerCount,
        courts,
        shape,
        attempt === 0,
        LOAD_WEIGHTS[attempt % LOAD_WEIGHTS.length],
        // Leaving it out sometimes fits the matches into fewer rounds
        Math.floor(attempt / LOAD_WEIGHTS.length) % 2 === 1
          ? TOGETHER_WEIGHT
          : 0,
      );
      candidates.push({ schedule, penalty: penaltyOf(schedule) });
      candidates.sort(
        (a, b) =>
          a.schedule.length - b.schedule.length || a.penalty - b.penalty,
      );
      if (candidates.length > FINALISTS) candidates.pop();
    }
  }

  // The order of the rounds matters as much as which rounds there are, so
  // the best few are put in order before picking one
  const finalists = candidates.filter(
    (candidate) => candidate.schedule.length === candidates[0].schedule.length,
  );
  let schedule = finalists[0].schedule;
  let lowest = Number.POSITIVE_INFINITY;
  for (const candidate of finalists) {
    const ordered = orderRounds(
      candidate.schedule,
      playerCount,
      random,
      undefined,
      ORDER_WORK / finalists.length,
    );
    const penalty = penaltyOf(ordered);
    if (penalty < lowest) {
      lowest = penalty;
      schedule = ordered;
    }
  }

  // Shuffle who gets which spot in the plan, so the same group of players
  // doesn't get the same schedule every time. The players who sit out more
  // get the spots with fewer matches.
  const spots = shuffle(players, random);
  const matchesOf: number[] = new Array(playerCount).fill(0);
  for (const round of schedule) {
    for (const match of round) {
      for (const spot of matchPlayers(match)) matchesOf[spot]++;
    }
  }
  const most = Math.max(...matchesOf);
  const fewer = players
    .filter((spot) => matchesOf[spot] < most)
    .slice(0, unpaired.length);
  fewer.forEach((spot, index) => {
    const from = spots.indexOf(unpaired[index]);
    spots[from] = spots[spot];
    spots[spot] = unpaired[index];
  });

  if (ratings) {
    // Even matches change who shares a court, so the order is redone
    return orderRounds(
      balanceRounds(schedule, ratings, spots, fewer, random),
      playerCount,
      random,
      options.previousRound,
      ORDER_WORK,
    );
  }
  const inPlayers = schedule.map((round) =>
    round.map(
      (match) =>
        match.map((team) => team.map((spot) => spots[spot])) as [
          PadelTeam,
          PadelTeam,
        ],
    ),
  );
  // Starts with other groups than the round before
  return options.previousRound?.length
    ? orderRounds(
        inPlayers,
        playerCount,
        random,
        options.previousRound,
        ORDER_WORK / 4,
      )
    : inPlayers;
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
  format: PadelFormatName,
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

// Results

interface PadelMatchResult {
  team1: string[];
  team2: string[];
  team1Score: number | null;
  team2Score: number | null;
  /** Not played, because the round or series was ended early */
  isSkipped?: boolean;
}

interface PadelGameResults {
  players: { id: string; name: string }[];
  rounds: { id: string; matches: PadelMatchResult[] }[];
}

/** Series numbers in play order */
export const getPadelSeriesNumbers = (rounds: { series: number }[]) =>
  rounds
    .map((round) => round.series)
    .filter((series, index, all) => all.indexOf(series) === index)
    .sort((a, b) => a - b);

/** The rounds of the series being played, or the last one */
export const getCurrentPadelSeries = <Round extends { series: number }>(
  rounds: Round[],
) => {
  const series = Math.max(1, ...rounds.map((round) => round.series));
  return { series, rounds: rounds.filter((round) => round.series === series) };
};

export const isPadelMatchPlayed = (match: PadelMatchResult) =>
  match.team1Score !== null && match.team2Score !== null;

/** Ended early without a score, so it doesn't count */
export const isPadelMatchSkipped = (match: PadelMatchResult) =>
  !isPadelMatchPlayed(match) && match.isSkipped === true;

/** Played, or ended early */
export const isPadelMatchDone = (match: PadelMatchResult) =>
  isPadelMatchPlayed(match) || isPadelMatchSkipped(match);

/** Every match has a score or was ended early */
export const isPadelRoundPlayed = (round: { matches: PadelMatchResult[] }) =>
  round.matches.every(isPadelMatchDone);

/** Rounds with a score, or that were ended, can't be moved */
export const isPadelRoundStarted = (round: { matches: PadelMatchResult[] }) =>
  round.matches.some(isPadelMatchDone);

export const getPadelProgress = (game: PadelGameResults) => {
  const matches = game.rounds.flatMap((round) => round.matches);
  const played = matches.filter(isPadelMatchPlayed).length;
  const currentRoundIndex = game.rounds.findIndex(
    (round) => !isPadelRoundPlayed(round),
  );
  return {
    played,
    /** Matches that were ended early don't count */
    total: matches.filter((match) => !isPadelMatchSkipped(match)).length,
    isFinished: matches.length > 0 && matches.every(isPadelMatchDone),
    /** -1 when every round has been played */
    currentRoundIndex,
  };
};

interface PadelGameState extends PadelGameResults {
  format: PadelFormatName;
  plannedRounds: number | null;
  rounds: (PadelGameResults["rounds"][number] & { series: number })[];
}

/**
 * Where a game is at. Americano progress is for the series being played, and
 * a Mexicano is over once all its planned rounds have been played.
 */
export const getPadelGameStatus = (game: PadelGameState) => {
  const current = getCurrentPadelSeries(game.rounds);
  const progress = getPadelProgress({
    players: game.players,
    rounds: current.rounds,
  });
  const isMexicano = game.format === "MEXICANO";
  const totalRounds = isMexicano
    ? Math.max(game.plannedRounds ?? 0, current.rounds.length)
    : current.rounds.length;
  // Every Mexicano round has the same number of matches
  const matchesTotal = isMexicano
    ? totalRounds * (current.rounds[0]?.matches.length ?? 0) -
      current.rounds
        .flatMap((round) => round.matches)
        .filter(isPadelMatchSkipped).length
    : progress.total;
  const playedRounds = current.rounds.filter(isPadelRoundPlayed).length;
  return {
    series: current.series,
    seriesCount: getPadelSeriesNumbers(game.rounds).length,
    /** The round being played, counted within the series */
    roundNumber: Math.min(totalRounds, playedRounds + 1),
    totalRounds,
    matchesPlayed: progress.played,
    matchesTotal,
    isFinished:
      game.rounds.every(isPadelRoundPlayed) &&
      game.rounds.length > 0 &&
      playedRounds >= totalRounds,
  };
};

/** The round being played and the one after it, within the current series */
export const getPadelUpNext = <
  Round extends { series: number; matches: PadelMatchResult[] },
>(
  rounds: Round[],
) => {
  const current = getCurrentPadelSeries(rounds).rounds;
  const index = current.findIndex((round) => !isPadelRoundPlayed(round));
  if (index === -1) return null;
  return {
    round: current[index],
    number: index + 1,
    next: current[index + 1] ?? null,
  };
};

/**
 * Who sits out the extra round in a new Americano series: the players chosen
 * for it, then at random among those who have done it the fewest times in
 * the earlier series.
 */
export const pickPadelSitOutMore = (
  players: { id: string; sitsOutMore: boolean }[],
  rounds: { series: number; matches: PadelMatchResult[] }[],
  count: number,
  random: () => number = Math.random,
): string[] => {
  const extra: Record<string, number> = {};
  for (const player of players) extra[player.id] = 0;
  for (const series of getPadelSeriesNumbers(rounds)) {
    const timesOut: Record<string, number> = {};
    for (const player of players) timesOut[player.id] = 0;
    for (const round of rounds) {
      if (round.series !== series) continue;
      for (const player of getSittingOut(players, round)) {
        timesOut[player.id]++;
      }
    }
    const fewest = Math.min(...players.map((player) => timesOut[player.id]));
    for (const player of players) {
      extra[player.id] += timesOut[player.id] - fewest;
    }
  }
  const chosen = players
    .filter((player) => player.sitsOutMore)
    .map((player) => player.id);
  // Ties are broken at random (sort keeps the shuffled order of equals)
  const others = shuffle(
    players.filter((player) => !player.sitsOutMore).map((player) => player.id),
    random,
  ).sort((a, b) => extra[a] - extra[b]);
  return chosen.concat(others).slice(0, count);
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
   * With 6, 7, 10, 11, ... players some play one match less, and matches can
   * be ended early. Once players have played all their matches, they get
   * their average for each match they have played less than the most.
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
      if (isPadelMatchSkipped(match)) continue;
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

// Mexicano

/** A number from a string, to seed the random choices of a game */
export const padelSeed = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
};

export interface PadelDrawnMatch {
  team1: string[];
  team2: string[];
}

/**
 * Draws the next Mexicano round from the leaderboard (the first round is
 * random). The players who have sat out the least sit out, and the rest play
 * in groups of four by rank: 1st & 3rd against 2nd & 4th on the first court,
 * 5th & 7th against 6th & 8th on the next, and so on. Players chosen to sit
 * out more go first, so they're the ones who sit out an extra round when not
 * everyone can sit out equally often.
 *
 * The same scores always give the same round, so a round that was drawn
 * before a score changed can be checked against a new draw.
 */
export const drawMexicanoRound = (
  game: PadelGameResults & {
    courts: number;
    players: { id: string; sitsOutMore?: boolean }[];
  },
  seed: number,
): PadelDrawnMatch[] => {
  const ids = game.players.map((player) => player.id);
  const random = createRandom(seed + game.rounds.length);
  // Breaks ties on the leaderboard (and is the whole order in the first
  // round), without depending on the names
  const order = shuffle(ids, random);
  const ranking = getPadelStandings(game)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        order.indexOf(a.playerId) - order.indexOf(b.playerId),
    )
    .map((standing) => standing.playerId);
  const courts = Math.max(1, Math.min(game.courts, maxPadelCourts(ids.length)));

  const timesOut: Record<string, number> = {};
  const lastOut: Record<string, number> = {};
  for (const player of game.players) {
    // Up to one round ahead of the others
    timesOut[player.id] = player.sitsOutMore ? -1 : 0;
    lastOut[player.id] = -1;
  }
  game.rounds.forEach((round, index) => {
    for (const player of getSittingOut(game.players, round)) {
      timesOut[player.id]++;
      lastOut[player.id] = index;
    }
  });
  // Ties are broken at random (sort keeps the shuffled order of equals)
  const resting = shuffle(ids, random)
    .sort((a, b) => timesOut[a] - timesOut[b] || lastOut[a] - lastOut[b])
    .slice(0, ids.length - courts * 4);

  const playing = ranking.filter((id) => resting.indexOf(id) === -1);
  const matches: PadelDrawnMatch[] = [];
  for (let i = 0; i + 3 < playing.length; i += 4) {
    matches.push({
      team1: [playing[i], playing[i + 2]],
      team2: [playing[i + 1], playing[i + 3]],
    });
  }
  return matches;
};

// Sharing

const MEDALS = ["🥇", "🥈", "🥉"];

/** The leaderboard as text, for sharing in a chat */
export const formatPadelResults = (
  game: PadelGameState & {
    name: string;
    courts: number;
    pointsPerMatch: number;
  },
  liveUrl?: string,
) => {
  const status = getPadelGameStatus(game);
  const standings = getPadelStandings(game);
  const hasScores = standings.some((standing) => standing.played > 0);
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
    `${padelFormatLabel(game.format)} · ${game.players.length} players · ${
      game.courts
    } ${game.courts === 1 ? "court" : "courts"} · ${game.pointsPerMatch} points`,
  ];
  if (liveUrl) {
    lines.push(`Follow the game: ${liveUrl}`);
  }
  return lines.join("\n");
};
