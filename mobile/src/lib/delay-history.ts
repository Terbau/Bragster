import { isTransit, type TripPattern } from "./trip-planner";

/**
 * How late buses have really been, from the history of Entur's real-time
 * data, summed up by the server per line, stop and timetable minute (see
 * src/lib/busDelays on the website). Unlike the live times, these are what
 * usually happens, so everything worked out from them is a suggestion.
 *
 * Only works things out; delay-history-store.ts fetches the history.
 */

export type DayKind = "weekday" | "sat" | "sun";

/** How late a departure at a timetable minute was, in seconds */
export interface DelaySlot {
  lineRef: string;
  quay: string;
  /** Minutes since midnight, local time, by the timetable */
  minute: number;
  /** How many days it's from */
  n: number;
  /** p10, p25, p50, p75, p90 of how late it left. Null at the last stop. */
  departure: number[] | null;
  /** The same for when it got there. Null at the first stop. */
  arrival: number[] | null;
  /** Share of days, 0-1, it left 2+ min earlier than shown 10 min before */
  early10: number | null;
  /**
   * Share of days, 0-1, it showed 3+ min late, went back to about the
   * timetable right before leaving, and still left late
   */
  snapBack: number | null;
}

/** Finds the history of a line at a stop, see `delay-history-store.ts` */
export type SlotLookup = (lineRef: string, quay: string) => DelaySlot[];

const MINUTE = 60 * 1000;
/** A timetable this many minutes off is taken as the same departure */
const SAME_SLOT_MIN = 2;
/** Fewer days than this say too little */
export const MIN_DAYS = 8;
/** Not a worry unless at least this many days in 100 */
const OFTEN = 0.25;

export function dayKindOf(time: number): DayKind {
  const day = new Date(time).getDay();
  return day === 0 ? "sun" : day === 6 ? "sat" : "weekday";
}

const minuteOfDay = (time: number) => {
  const date = new Date(time);
  return date.getHours() * 60 + date.getMinutes();
};

/** The history of the same departure, by its timetable time */
export function findSlot(
  slots: DelaySlot[],
  aimed: number,
  role: "departure" | "arrival",
): DelaySlot | null {
  const minute = minuteOfDay(aimed);
  let best: DelaySlot | null = null;
  for (const slot of slots) {
    if (!slot[role] || slot.n < MIN_DAYS) continue;
    const off = Math.abs(slot.minute - minute);
    if (off > SAME_SLOT_MIN) continue;
    if (
      !best ||
      off < Math.abs(best.minute - minute) ||
      (off === Math.abs(best.minute - minute) && slot.n > best.n)
    ) {
      best = slot;
    }
  }
  return best;
}

/**
 * Ten delays in seconds that stand for the days, from p10, p25, p50, p75 and
 * p90: each one a tenth of them, from the 5th to the 95th percentile
 */
export function spread(quantiles: number[]): number[] {
  const [p10, p25, p50, p75, p90] = quantiles;
  const points: [number, number][] = [
    [0.1, p10],
    [0.25, p25],
    [0.5, p50],
    [0.75, p75],
    [0.9, p90],
  ];
  const at = (p: number) => {
    if (p <= 0.1) return p10 - ((0.1 - p) / 0.15) * (p25 - p10);
    if (p >= 0.9) return p90 + ((p - 0.9) / 0.15) * (p90 - p75);
    for (let i = 1; i < points.length; i++) {
      const [pb, vb] = points[i];
      const [pa, va] = points[i - 1];
      if (p <= pb) return va + ((p - pa) / (pb - pa)) * (vb - va);
    }
    return p90;
  };
  return Array.from({ length: 10 }, (_, i) => at(0.05 + i * 0.1));
}

/** What history says about one bus of a route */
export interface LegHistory {
  /** Index of the leg in the route */
  index: number;
  line: string | null;
  /** How many days it's from */
  days: number;
  /** How late it usually leaves and gets there, in ms. Null when not known. */
  departure: { usual: number; early: number; late: number } | null;
  arrival: { usual: number; late: number } | null;
  /** Share of days, 0-1, it showed on time right before leaving but wasn't */
  snapBack: number | null;
}

/** What history says about a whole route */
export interface RouteOutlook {
  legs: LegHistory[];
  /** When you'd usually be there, and on a late day (9 in 10 are earlier) */
  arrival: { usual: number; late: number } | null;
  /** Share of days, 0-1, each change of bus was missed, by the later leg */
  transfers: {
    index: number;
    line: string | null;
    at: string;
    missed: number;
  }[];
  /** Share of days, 0-1, you'd have been there by `deadline` */
  onTime: number | null;
  /** The fewest days any of it is from */
  days: number;
}

const toMs = (seconds: number) => seconds * 1000;

/**
 * What history says about `pattern`: when you'd usually be there, how often
 * a change of bus is missed, and how often you'd be there by `deadline`.
 * Null when there's no history of its buses.
 */
export function getOutlook(
  pattern: TripPattern,
  lookup: SlotLookup,
  deadline?: number | null,
): RouteOutlook | null {
  const transit = pattern.legs
    .map((leg, index) => ({ leg, index }))
    .filter(({ leg }) => isTransit(leg));
  if (transit.length === 0) return null;

  const found = transit.map(({ leg, index }) => {
    const known = leg.lineRef && leg.aimedStart != null && leg.aimedEnd != null;
    const from =
      known && leg.from.quayId
        ? findSlot(
            lookup(leg.lineRef!, leg.from.quayId),
            leg.aimedStart!,
            "departure",
          )
        : null;
    const to =
      known && leg.to.quayId
        ? findSlot(
            lookup(leg.lineRef!, leg.to.quayId),
            leg.aimedEnd!,
            "arrival",
          )
        : null;
    return { leg, index, from, to };
  });
  if (found.every(({ from, to }) => !from && !to)) return null;

  const legs: LegHistory[] = found.map(({ leg, index, from, to }) => ({
    index,
    line: leg.line,
    days: Math.min(from?.n ?? Infinity, to?.n ?? Infinity),
    departure: from?.departure
      ? {
          usual: toMs(from.departure[2]),
          early: toMs(from.departure[0]),
          late: toMs(from.departure[4]),
        }
      : null,
    arrival: to?.arrival
      ? { usual: toMs(to.arrival[2]), late: toMs(to.arrival[4]) }
      : null,
    snapBack: from?.snapBack ?? null,
  }));

  // Changes of bus: the one before has to be there, and you at the stop,
  // before the next leaves. Days are taken as alike from one bus to the next.
  const transfers: RouteOutlook["transfers"] = [];
  let made = 1;
  for (let i = 1; i < found.length; i++) {
    const before = found[i - 1];
    const next = found[i];
    if (!before.to?.arrival || !next.from?.departure) continue;
    const walk = pattern.legs
      .slice(before.index + 1, next.index)
      .reduce((sum, leg) => sum + (leg.end - leg.start), 0);
    const arrive = spread(before.to.arrival).map(
      (s) => before.leg.aimedEnd! + toMs(s) + walk,
    );
    const leave = spread(next.from.departure).map(
      (s) => next.leg.aimedStart! + toMs(s),
    );
    let missed = 0;
    for (const a of arrive) for (const l of leave) if (a > l + 15_000) missed++;
    const share = missed / (arrive.length * leave.length);
    made *= 1 - share;
    transfers.push({
      index: next.index,
      line: next.leg.line,
      at: next.leg.from.name,
      missed: share,
    });
  }

  // At the door: when the last bus gets there, and the walk after it
  const last = found[found.length - 1];
  let arrival: RouteOutlook["arrival"] = null;
  let onTime: number | null = null;
  if (last.to?.arrival) {
    const after = pattern.end - last.leg.end;
    const doors = spread(last.to.arrival).map(
      (s) => last.leg.aimedEnd! + toMs(s) + after,
    );
    arrival = {
      usual: last.leg.aimedEnd! + toMs(last.to.arrival[2]) + after,
      late: last.leg.aimedEnd! + toMs(last.to.arrival[4]) + after,
    };
    if (deadline != null) {
      onTime =
        (doors.filter((t) => t <= deadline).length / doors.length) * made;
    }
  }

  return {
    legs,
    arrival,
    transfers,
    onTime,
    days: Math.min(...legs.map((leg) => leg.days)),
  };
}

/** Another route history says is better, with why */
export interface HistorySuggestion {
  pattern: TripPattern;
  outlook: RouteOutlook;
  /** The route you're on, and what history says about it */
  currentPattern: TripPattern;
  current: RouteOutlook;
  reason: "late" | "transfer";
}

/**
 * Whether history says another route is a better bet than `current`: one
 * that's there by `deadline` on far more days, or one without a change of
 * bus that's often missed. Null when there's none, or too little history.
 */
export function suggestFromHistory(
  current: TripPattern,
  candidates: TripPattern[],
  lookup: SlotLookup,
  deadline?: number | null,
): HistorySuggestion | null {
  const mine = getOutlook(current, lookup, deadline);
  if (!mine || mine.days < MIN_DAYS) return null;
  const others = candidates
    .filter((other) => other !== current)
    .map((pattern) => ({
      pattern,
      outlook: getOutlook(pattern, lookup, deadline),
    }))
    .filter(
      (other): other is { pattern: TripPattern; outlook: RouteOutlook } =>
        !!other.outlook && other.outlook.days >= MIN_DAYS,
    );

  if (deadline != null && mine.onTime !== null && mine.onTime < 0.8) {
    // The one that lets you leave latest of those that are nearly always
    // there in time
    const better = others
      .filter((other) => (other.outlook.onTime ?? 0) >= 0.9)
      .sort((a, b) => b.pattern.start - a.pattern.start)[0];
    if (better) {
      return {
        ...better,
        currentPattern: current,
        current: mine,
        reason: "late",
      };
    }
  }

  const risky = mine.transfers.some((transfer) => transfer.missed >= OFTEN);
  if (risky && mine.arrival) {
    const usual = mine.arrival.usual;
    const better = others
      .filter(
        (other) =>
          other.outlook.transfers.every((t) => t.missed < 0.1) &&
          other.outlook.arrival &&
          other.outlook.arrival.usual <= usual + 3 * MINUTE &&
          (deadline == null ||
            (other.outlook.onTime ?? 0) >= (mine.onTime ?? 0)),
      )
      .sort((a, b) => a.outlook.arrival!.usual - b.outlook.arrival!.usual)[0];
    if (better) {
      return {
        ...better,
        currentPattern: current,
        current: mine,
        reason: "transfer",
      };
    }
  }
  return null;
}

/** The lines and stops whose history is needed for these routes */
export function historyPairs(patterns: TripPattern[]) {
  const pairs = new Map<string, { lineRef: string; quay: string }>();
  for (const pattern of patterns) {
    for (const leg of pattern.legs) {
      if (!isTransit(leg) || !leg.lineRef || !leg.lineRef.startsWith("ATB:"))
        continue;
      for (const quay of [leg.from.quayId, leg.to.quayId]) {
        if (quay)
          pairs.set(`${leg.lineRef}|${quay}`, { lineRef: leg.lineRef, quay });
      }
    }
  }
  return [...pairs.values()];
}
