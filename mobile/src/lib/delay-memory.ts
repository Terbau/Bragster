import type { TripCall } from "./entur";
import type { LikelyDeparture, TripLeg } from "./trip-planner";

/**
 * Learns how late buses really leave compared to what they show, like a
 * line that looks 10 minutes late in the morning rush but makes most of it
 * up. While a trip is on, what each bus shows is noted every so often, and
 * then when it really left. Later, the same line from the same stop at about
 * the same time of day is taken to catch up as much as it used to.
 *
 * Only ever says a bus leaves earlier than it shows, never later, so a wrong
 * guess means waiting at the stop rather than missing the bus.
 *
 * Only works things out; delay-store.ts keeps the records.
 */

/** What a bus showed, some time before it was to leave */
export interface DelaySnapshot {
  /** How long until it showed it would leave, in ms */
  lead: number;
  /** How late it showed it would leave, in ms */
  delay: number;
}

/** One departure of a line from a stop */
export interface DelayRecord {
  journeyId: string;
  date: string;
  fromPosition: number;
  line: string;
  quayId: string;
  /** Like "Lerkendal 4" */
  stopName: string;
  /** When it was to leave by the timetable, in ms */
  aimed: number;
  /** The newest last */
  snapshots: DelaySnapshot[];
  /** How late it really left, in ms. Null until it has. */
  actualDelay: number | null;
}

/** Buses further away than this aren't noted, as their times are guesses */
const MAX_LEAD_MS = 45 * 60 * 1000;
/** Not noted more often than this for the same bus */
const SNAPSHOT_EVERY_MS = 50 * 1000;
const MAX_SNAPSHOTS = 40;
/** This close to leaving, what it shows is about when it leaves */
const CLOSE_LEAD_MS = 90 * 1000;
/** A bus not known to have left this long after its time is forgotten */
const GIVE_UP_MS = 20 * 60 * 1000;
const MAX_PENDING = 40;
const MAX_LEARNED = 400;
const MAX_AGE_MS = 120 * 24 * 60 * 60 * 1000;

/** Departures this far apart in the day are taken as alike */
const SAME_TIME_MS = 75 * 60 * 1000;
/** It takes this many earlier departures to say anything */
export const MIN_SAMPLES = 3;
/** Shown less late than this, there's nothing to catch up */
const MIN_DELAY_MS = 2 * 60 * 1000;
/** Only said when it's at least this much earlier than shown */
const MIN_GAIN_MS = 90 * 1000;
/**
 * Which of the earlier departures it's planned for, 0-1, the one that made
 * up most first. Low, so that it's mostly caught.
 */
const CAUTION = 0.25;

const MINUTE = 60 * 1000;

const isPending = (record: DelayRecord) => record.actualDelay === null;

const lastSnapshot = (record: DelayRecord) => record.snapshots.at(-1) ?? null;

/** When it shows it leaves now, from what it last showed */
const shownDeparture = (record: DelayRecord) =>
  record.aimed + (lastSnapshot(record)?.delay ?? 0);

function withSnapshot(
  record: DelayRecord,
  snapshot: DelaySnapshot,
  now: number,
  takenAt: (s: DelaySnapshot) => number,
): DelayRecord {
  const last = lastSnapshot(record);
  if (last && now - takenAt(last) < SNAPSHOT_EVERY_MS) return record;
  return {
    ...record,
    snapshots: [...record.snapshots, snapshot].slice(-MAX_SNAPSHOTS),
  };
}

/** When a snapshot was taken: it's `lead` before what it showed */
const takenAtFor = (record: DelayRecord) => (snapshot: DelaySnapshot) =>
  record.aimed + snapshot.delay - snapshot.lead;

/**
 * Notes what the bus of `leg` shows now. Legs without a timetable time,
 * like walks, are left out.
 */
export function observeLeg(
  records: DelayRecord[],
  leg: TripLeg,
  now: number,
): DelayRecord[] {
  const { journeyId, date, fromPosition, line, aimedStart } = leg;
  const quayId = leg.from.quayId;
  if (!journeyId || !date || fromPosition === null || !line || !quayId) {
    return records;
  }
  if (aimedStart == null || !leg.realtime) return records;
  const lead = leg.start - now;
  if (lead > MAX_LEAD_MS || lead < 0) return records;
  const snapshot = { lead, delay: leg.start - aimedStart };
  const index = records.findIndex(
    (record) =>
      record.journeyId === journeyId && record.fromPosition === fromPosition,
  );
  if (index >= 0) {
    const record = records[index];
    if (!isPending(record)) return records;
    const updated = withSnapshot(record, snapshot, now, takenAtFor(record));
    if (updated === record) return records;
    const next = [...records];
    next[index] = updated;
    return next;
  }
  const record: DelayRecord = {
    journeyId,
    date,
    fromPosition,
    line,
    quayId,
    stopName: leg.from.platform
      ? `${leg.from.name} ${leg.from.platform}`
      : leg.from.name,
    aimed: aimedStart,
    snapshots: [snapshot],
    actualDelay: null,
  };
  return prune([...records, record], now);
}

/**
 * Notes the real times of a trip: when it left, once it has, or else what
 * it shows now
 */
export function observeCalls(
  records: DelayRecord[],
  journeyId: string,
  calls: TripCall[],
  now: number,
): DelayRecord[] {
  let changed = false;
  const next = records.flatMap((record): DelayRecord[] => {
    if (record.journeyId !== journeyId || !isPending(record)) return [record];
    const call = calls.find((other) => other.position === record.fromPosition);
    if (!call) return [record];
    changed = true;
    // A cancelled bus says nothing about how late it is
    if (call.cancelled) return [];
    if (call.actualDeparture) {
      return [
        {
          ...record,
          actualDelay: call.actualDeparture.getTime() - record.aimed,
        },
      ];
    }
    if (!call.realtime) return [record];
    const expected = call.expectedDeparture.getTime();
    const lead = expected - now;
    if (lead < 0 || lead > MAX_LEAD_MS) return [record];
    return [
      withSnapshot(
        record,
        { lead, delay: expected - record.aimed },
        now,
        takenAtFor(record),
      ),
    ];
  });
  return changed ? next : records;
}

/**
 * Buses that have shown they left, but not yet when exactly, so that their
 * trip can be looked up while it's still known: real times are only kept
 * by Entur for a little while after a trip is done
 */
export function getDueRecords(records: DelayRecord[], now: number) {
  return records.filter((record) => {
    if (!isPending(record)) return false;
    const shown = shownDeparture(record);
    return now > shown + 30 * 1000 && now < shown + GIVE_UP_MS;
  });
}

/**
 * Settles the buses that have left without it being known exactly when:
 * what one showed just before is about when it left. The rest are given up
 * on after a while.
 */
export function settle(records: DelayRecord[], now: number): DelayRecord[] {
  let changed = false;
  const next = records.flatMap((record): DelayRecord[] => {
    if (!isPending(record)) return [record];
    const shown = shownDeparture(record);
    const last = lastSnapshot(record);
    if (last && last.lead <= CLOSE_LEAD_MS && now > shown + 3 * MINUTE) {
      changed = true;
      return [{ ...record, actualDelay: last.delay }];
    }
    if (now > shown + GIVE_UP_MS) {
      changed = true;
      return [];
    }
    return [record];
  });
  return changed ? next : records;
}

/** Keeps the newest, and not too many */
function prune(records: DelayRecord[], now: number) {
  const fresh = records.filter((record) => now - record.aimed < MAX_AGE_MS);
  const pending = fresh.filter(isPending).slice(-MAX_PENDING);
  const learned = fresh.filter((r) => !isPending(r)).slice(-MAX_LEARNED);
  if (pending.length + learned.length === records.length) return records;
  return [...learned, ...pending];
}

/** Weekdays, Saturdays and Sundays each have their own timetable */
function dayKind(time: number) {
  const day = new Date(time).getDay();
  return day === 0 ? "sun" : day === 6 ? "sat" : "weekday";
}

/** Ms since midnight, local time */
function timeOfDay(time: number) {
  const date = new Date(time);
  return (
    ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000
  );
}

/** Earlier departures of the line from the stop at about the same time */
function similar(
  records: DelayRecord[],
  line: string,
  quayId: string,
  aimed: number,
) {
  const kind = dayKind(aimed);
  const tod = timeOfDay(aimed);
  return records.filter(
    (record) =>
      !isPending(record) &&
      record.line === line &&
      record.quayId === quayId &&
      record.aimed < aimed - 30 * MINUTE &&
      dayKind(record.aimed) === kind &&
      Math.abs(timeOfDay(record.aimed) - tod) <= SAME_TIME_MS,
  );
}

/** The `q` quantile of `values`, 0-1, linearly between them */
export function quantile(values: number[], q: number) {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (sorted.length - 1) * q;
  const below = Math.floor(at);
  const above = Math.ceil(at);
  return sorted[below] + (sorted[above] - sorted[below]) * (at - below);
}

/**
 * How much of what's shown the earlier departures were really late, one for
 * each: what they showed about as long before as now, against when they
 * left. 0.3 is 3 of 10 minutes.
 */
function lateShares(records: DelayRecord[], lead: number) {
  const window = Math.max(4 * MINUTE, lead * 0.5);
  return records.flatMap((record) => {
    let closest: DelaySnapshot | null = null;
    for (const snapshot of record.snapshots) {
      if (Math.abs(snapshot.lead - lead) > window) continue;
      if (
        !closest ||
        Math.abs(snapshot.lead - lead) < Math.abs(closest.lead - lead)
      ) {
        closest = snapshot;
      }
    }
    if (!closest || closest.delay < MINUTE || record.actualDelay === null) {
      return [];
    }
    return [Math.max(0, Math.min(1.5, record.actualDelay / closest.delay))];
  });
}

/**
 * When the bus of `leg` is likely to really leave, when that's a while
 * earlier than it shows, from how the same line from the same stop did at
 * about the same time of day before. Null when it isn't known, or isn't
 * earlier.
 */
export function predictDeparture(
  records: DelayRecord[],
  leg: TripLeg,
  now: number,
): LikelyDeparture | null {
  const { line, aimedStart } = leg;
  const quayId = leg.from.quayId;
  if (!line || !quayId || aimedStart == null || !leg.journeyId) return null;
  const shownDelay = leg.start - aimedStart;
  if (shownDelay < MIN_DELAY_MS) return null;
  const lead = Math.max(0, leg.start - now);
  const shares = lateShares(similar(records, line, quayId, aimedStart), lead);
  if (shares.length < MIN_SAMPLES) return null;
  const time = aimedStart + shownDelay * quantile(shares, CAUTION);
  if (time > leg.start - MIN_GAIN_MS) return null;
  // Not before you could get there, it's the bus that's late
  return { time: Math.max(time, now), samples: shares.length };
}

/** How a line from a stop does at a time of day, to show what's learned */
export interface DelaySummary {
  line: string;
  quayId: string;
  stopName: string;
  /** Like 8 for around 08:00 */
  hour: number;
  samples: number;
  /** The most it typically showed, in ms */
  typicalShown: number;
  /** How late it typically really left, in ms */
  typicalActual: number;
}

export function summarize(records: DelayRecord[]): DelaySummary[] {
  const groups = new Map<string, DelayRecord[]>();
  for (const record of records) {
    if (isPending(record)) continue;
    const hour = new Date(record.aimed).getHours();
    const key = `${record.line}|${record.quayId}|${hour}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.values()]
    .map((group) => {
      const first = group[0];
      return {
        line: first.line,
        quayId: first.quayId,
        stopName: first.stopName,
        hour: new Date(first.aimed).getHours(),
        samples: group.length,
        typicalShown: quantile(
          group.map((record) =>
            Math.max(0, ...record.snapshots.map((s) => s.delay)),
          ),
          0.5,
        ),
        typicalActual: quantile(
          group.map((record) => record.actualDelay ?? 0),
          0.5,
        ),
      };
    })
    .sort((a, b) => b.samples - a.samples || a.hour - b.hour);
}
