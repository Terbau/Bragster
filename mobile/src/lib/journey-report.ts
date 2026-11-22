import { formatClock } from "./bus-utils";
import type { TripCall } from "./entur";
import { describeLeg, getLiveTimes, placeName } from "./journey-logic";
import { isTransit, type TripLeg, type TripPattern } from "./trip-planner";

/**
 * The report at the end of a trip: what you did, and whether the first
 * route would have got you there sooner. The first route is gone through
 * again with the times its buses really ran at.
 */

/** A bus is still caught when you get to the stop this long after it left */
const CONNECTION_GRACE_MS = 30 * 1000;
/** Less than this apart is the same time */
const SAME_MS = 60 * 1000;

/** Something you did on the trip, and for how long */
export interface JourneyActivity {
  kind: "walk" | "wait" | "ride" | "rental" | "stay";
  /** Like "Walked to Studentersamfundet 2" */
  text: string;
  line: string | null;
  start: number;
  end: number;
}

/** Something that changed the route on the way */
export interface JourneyChange {
  at: number;
  /**
   * "switch": another route was taken. "kept": a faster one was turned
   * down. "edit": the trip itself was changed, like with a stop on the way.
   * "visit": you were done at a stop on the way early. "pick": another
   * place was picked for a flexible stop, like another Rema 1000.
   */
  kind: "switch" | "kept" | "edit" | "visit" | "pick";
  /** Like "Switched to line 22 from Studentersamfundet" */
  text: string;
  /** Like "You won't make line 11 from Studentersamfundet" */
  reason: string | null;
}

/** A part of the first route, with the stop that's stayed at before it */
export interface BaselinePart {
  pattern: TripPattern;
  /** The stop on the way that's stayed at before it, null for none */
  stayAt: string | null;
  stayMinutes: number;
  /**
   * Which stop on the way it starts from. Set without `stayAt` when the
   * route was found while you were already there.
   */
  stopoverId?: string | null;
}

/** When you got to a stop on the way and left it, as far as it's known */
export interface StayTimes {
  arrivedAt: number | null;
  leftAt: number | null;
}

/**
 * The first route for the trip as it is now: all of it, when it was found,
 * and when it said you'd be there. Found again when the trip is changed,
 * like with a stop on the way, as that's another trip.
 */
export interface Baseline {
  madeAt: number;
  parts: BaselinePart[];
  arrival: number;
}

/** A step of the first route, with how it really went */
export interface ReplayStep {
  kind: "walk" | "ride" | "rental" | "stay";
  /** Like "Line 11 to Dybdahls veg" */
  text: string;
  line: string | null;
  /** When it was planned for */
  plannedStart: number;
  plannedEnd: number;
  /** When it would really have been. Null after the route has failed. */
  start: number | null;
  end: number | null;
  /** Like "Left 5 min late" */
  note: string | null;
}

export interface Replay {
  steps: ReplayStep[];
  /** When it would have got you there. Null when it wouldn't have. */
  arrival: number | null;
  /** Why it wouldn't have worked, like a cancelled bus */
  failure: string | null;
  /** False while one of its buses is still on its way, so times can change */
  isFinal: boolean;
}

export interface JourneyReport {
  destination: string;
  startedAt: number;
  arrivedAt: number;
  /**
   * The first route, as it really went: when it was found, and when it said
   * you'd be there. Null when no route was found before you got there.
   */
  baseline: (Replay & { madeAt: number; predictedArrival: number }) | null;
  /** Whether the first route was followed all the way */
  followedBaseline: boolean;
  /**
   * How much later you got there than the first route would have, in ms.
   * Negative when you were faster. Null when it can't be said.
   */
  differenceMs: number | null;
  /** Like "The first route would have been 4 min faster" */
  verdict: string;
  /** The same, short enough for the Lock Screen */
  short: string;
  /** Whether you did better than the first route, null when neither */
  isBetter: boolean | null;
  activities: JourneyActivity[];
  /** How long was spent on each, in ms */
  totals: Record<JourneyActivity["kind"], number>;
  changes: JourneyChange[];
}

/** Like "14:32", the same on every phone */
export function formatClockTime(time: number) {
  return formatClock(time);
}

/** Like "4 min", "2 h" or "1 h 12 min" */
export function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 === 0 ? `${hours} h` : `${hours} h ${minutes % 60} min`;
}

/**
 * Adds what you're doing now to what you've done. The same thing as last
 * time makes that stretch longer, and something else ends it.
 */
export function recordActivity(
  activities: JourneyActivity[],
  current: Omit<JourneyActivity, "start" | "end">,
  now: number,
): JourneyActivity[] {
  const last = activities.at(-1);
  if (!last) return [{ ...current, start: now, end: now }];
  // What was last being done went on until now, also if the app was paused
  const before = [...activities.slice(0, -1), { ...last, end: now }];
  if (last.kind === current.kind && last.text === current.text) return before;
  return [...before, { ...current, start: now, end: now }];
}

/** What's being done on a leg, to remember it, in the past tense */
export function describeActivity(
  leg: TripLeg,
  isRiding: boolean,
): Omit<JourneyActivity, "start" | "end"> {
  if (isTransit(leg)) {
    return isRiding
      ? { kind: "ride", line: leg.line, text: describeLeg(leg) }
      : {
          kind: "wait",
          line: leg.line,
          text: `Waited for line ${leg.line} at ${placeName(leg.from)}`,
        };
  }
  if (leg.rented) {
    return { kind: "rental", line: null, text: `Rode the ${describeLeg(leg)}` };
  }
  return {
    kind: "walk",
    line: null,
    text: `Walked to ${placeName(leg.to)}`,
  };
}

/**
 * Goes through the first route again with the times its buses really ran
 * at, as if you had followed it: walking as planned, on each bus if you'd
 * have been at the stop when it left, and staying as long as planned.
 */
export function replayBaseline(
  baseline: Baseline,
  getCalls: (leg: TripLeg) => TripCall[] | null,
  getStay: (stopoverId: string) => StayTimes | null = () => null,
): Replay {
  const steps: ReplayStep[] = [];
  let failure: string | null = null;
  let isFinal = true;
  // You'd have set off when it said to, or when you really left the stop on
  // the way it was found at
  const first = baseline.parts[0];
  const leftFirst = first?.stopoverId
    ? getStay(first.stopoverId)?.leftAt
    : null;
  let time = leftFirst ?? first?.pattern.legs[0]?.start ?? baseline.madeAt;

  for (const part of baseline.parts) {
    if (part.stayAt) {
      const planned = part.stayMinutes * 60 * 1000;
      // As long as you really stayed, so being done early isn't counted as
      // the route's doing
      const stay = part.stopoverId ? getStay(part.stopoverId) : null;
      const stayed =
        stay?.arrivedAt != null && stay.leftAt != null
          ? Math.max(0, stay.leftAt - stay.arrivedAt)
          : null;
      const length = stayed ?? planned;
      const plannedEnd = part.pattern.legs[0]?.start ?? time + planned;
      const isDifferent =
        stayed !== null && Math.abs(stayed - planned) >= 60 * 1000;
      steps.push({
        kind: "stay",
        text: `${formatDuration(length)} at ${part.stayAt}`,
        line: null,
        plannedStart: plannedEnd - planned,
        plannedEnd,
        start: failure ? null : time,
        end: failure ? null : time + length,
        note: isDifferent
          ? `As long as you stayed, planned ${part.stayMinutes} min`
          : null,
      });
      time += length;
    }
    for (const leg of part.pattern.legs) {
      const base = {
        text: describeLeg(leg),
        line: leg.line,
        plannedStart: leg.start,
        plannedEnd: leg.end,
      };
      if (failure) {
        steps.push({
          ...base,
          kind: isTransit(leg) ? "ride" : leg.rented ? "rental" : "walk",
          start: null,
          end: null,
          note: null,
        });
        continue;
      }
      if (!isTransit(leg)) {
        const end = time + (leg.end - leg.start);
        steps.push({
          ...base,
          kind: leg.rented ? "rental" : "walk",
          start: time,
          end,
          note: null,
        });
        time = end;
        continue;
      }

      const calls = getCalls(leg);
      const times = calls ? getLiveTimes(leg, calls) : null;
      const to = calls?.find((call) => call.position === leg.toPosition);
      // Still on its way, or its real times couldn't be got
      if (!to?.actualArrival) isFinal = false;
      const depart = times?.depart ?? leg.start;
      const arrive = times?.arrive ?? leg.end;
      const late = Math.round((depart - leg.start) / 60000);
      const from = calls?.find((call) => call.position === leg.fromPosition);
      const ran = !from?.realtime
        ? `No live times, ${formatClockTime(depart)} by the timetable`
        : late >= 1
          ? `Left ${formatClockTime(depart)}, ${late} min late`
          : late <= -1
            ? `Left ${formatClockTime(depart)}, ${-late} min early`
            : `Left ${formatClockTime(depart)}, on time`;
      if (times?.cancelled) {
        failure = `line ${leg.line} from ${leg.from.name} was cancelled`;
        steps.push({
          ...base,
          kind: "ride",
          start: null,
          end: null,
          note: "Cancelled",
        });
      } else if (time > depart + CONNECTION_GRACE_MS) {
        failure = `you’d have missed line ${leg.line} at ${leg.from.name}`;
        steps.push({
          ...base,
          kind: "ride",
          start: null,
          end: null,
          note: `${ran}, before you’d have been there at ${formatClockTime(time)}`,
        });
      } else {
        steps.push({
          ...base,
          kind: "ride",
          start: depart,
          end: arrive,
          note: ran,
        });
        time = arrive;
      }
    }
  }
  return { steps, arrival: failure ? null : time, failure, isFinal };
}

/** Puts the report together when you've got there */
export function buildReport(input: {
  destination: string;
  startedAt: number;
  arrivedAt: number;
  baseline: Baseline | null;
  activities: JourneyActivity[];
  changes: JourneyChange[];
  getCalls: (leg: TripLeg) => TripCall[] | null;
  getStay?: (stopoverId: string) => StayTimes | null;
}): JourneyReport {
  const { baseline, arrivedAt, changes } = input;
  const activities = input.activities.filter(
    (activity) => activity.end - activity.start >= 5000,
  );
  const totals = { walk: 0, wait: 0, ride: 0, rental: 0, stay: 0 };
  for (const activity of activities) {
    totals[activity.kind] += activity.end - activity.start;
  }
  const common = {
    destination: input.destination,
    startedAt: input.startedAt,
    arrivedAt,
    activities,
    totals,
    changes,
  };
  const there = formatClockTime(arrivedAt);
  if (!baseline) {
    return {
      ...common,
      baseline: null,
      followedBaseline: false,
      differenceMs: null,
      isBetter: null,
      verdict: `You got there at ${there}, before a route was found to compare with.`,
      short: `There at ${there}`,
    };
  }

  const replay = replayBaseline(baseline, input.getCalls, input.getStay);
  // Changes before the first route was found are part of what it's for
  const followedBaseline = !changes.some(
    (change) => change.kind === "switch" && change.at >= baseline.madeAt,
  );
  const differenceMs =
    replay.arrival === null ? null : arrivedAt - replay.arrival;
  // Without its buses' real times, it's what the timetable says
  const would = replay.isFinal ? "would have" : "should have";

  let verdict: string;
  let short: string;
  let isBetter: boolean | null = null;
  if (followedBaseline) {
    const late = arrivedAt - baseline.arrival;
    const versus =
      Math.abs(late) < SAME_MS
        ? "just as it said at the start"
        : late > 0
          ? `${formatDuration(late)} later than it said at the start (${formatClockTime(baseline.arrival)})`
          : `${formatDuration(-late)} earlier than it said at the start (${formatClockTime(baseline.arrival)})`;
    verdict = `You followed the first route all the way, and got there at ${there}, ${versus}.`;
    short = `There at ${there}, on the first route`;
  } else if (differenceMs === null) {
    isBetter = true;
    verdict = `Switching was needed: on the first route, ${replay.failure}. You got there at ${there}.`;
    short = "The first route wouldn’t have worked";
  } else if (differenceMs <= -SAME_MS) {
    isBetter = true;
    const saved = formatDuration(-differenceMs);
    verdict = `Switching paid off. You got there ${saved} earlier than the first route ${would} got you there, at ${formatClockTime(replay.arrival ?? arrivedAt)}.`;
    short = `${saved} faster than the first route`;
  } else if (differenceMs >= SAME_MS) {
    isBetter = false;
    const lost = formatDuration(differenceMs);
    verdict = `The first route would have been faster. It ${would} got you there at ${formatClockTime(replay.arrival ?? arrivedAt)}, ${lost} before you got there.`;
    short = `First route was ${lost} faster`;
  } else {
    verdict = `It made no difference. The first route ${would} got you there at about the same time, ${formatClockTime(replay.arrival ?? arrivedAt)}.`;
    short = "Same as the first route";
  }

  return {
    ...common,
    baseline: {
      ...replay,
      madeAt: baseline.madeAt,
      predictedArrival: baseline.arrival,
    },
    followedBaseline,
    differenceMs,
    isBetter,
    verdict,
    short,
  };
}
