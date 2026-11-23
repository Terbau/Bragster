import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import {
  type DelayRecord,
  getDueRecords,
  observeCalls,
  observeLeg,
  predictDeparture,
  settle,
} from "./delay-memory";
import { fetchTrip, type TripCall } from "./entur";
import type { LikelyDeparture, TripLeg } from "./trip-planner";

/** Keeps what's learned about how late buses really are, see delay-memory.ts */

const KEY = "bragster.bus.delay-memory";
/** Not saved more often than this */
const SAVE_MS = 15 * 1000;
/** How many trips are looked up at a time, to see when they left */
const MAX_LOOKUPS = 3;
/** The same trip isn't looked up more often than this */
const LOOKUP_EVERY_MS = 2 * 60 * 1000;
/** When each trip was last looked up */
const lookedUp = new Map<string, number>();

let records: DelayRecord[] = [];
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function set(next: DelayRecord[]) {
  if (next === records) return;
  records = next;
  for (const listener of listeners) listener();
  saveTimer ??= setTimeout(() => {
    saveTimer = null;
    void AsyncStorage.setItem(KEY, JSON.stringify(records)).catch(() => {});
  }, SAVE_MS);
}

void AsyncStorage.getItem(KEY)
  .then((stored) => {
    const saved: DelayRecord[] = stored ? JSON.parse(stored) : [];
    // Anything noted before it was loaded is kept as well
    const ids = new Set(records.map((r) => `${r.journeyId}:${r.fromPosition}`));
    records = [
      ...saved.filter((r) => !ids.has(`${r.journeyId}:${r.fromPosition}`)),
      ...records,
    ];
  })
  .catch(() => {})
  .finally(() => {
    for (const listener of listeners) listener();
  });

/** Notes what the buses of these legs show now */
export function noteLegs(legs: TripLeg[]) {
  const now = Date.now();
  let next = records;
  for (const leg of legs) next = observeLeg(next, leg, now);
  set(next);
}

/** Notes the real times of a trip, like when it left */
export function noteCalls(journeyId: string, calls: TripCall[]) {
  set(observeCalls(records, journeyId, calls, Date.now()));
}

let isLookingUp = false;

/**
 * Looks up when the buses that were noted have left, while Entur still
 * knows, and settles the rest
 */
export async function settleDelays() {
  if (isLookingUp) return;
  isLookingUp = true;
  try {
    const now = Date.now();
    const due = getDueRecords(records, now)
      .filter(
        (record) =>
          now - (lookedUp.get(record.journeyId) ?? 0) > LOOKUP_EVERY_MS,
      )
      .slice(0, MAX_LOOKUPS);
    if (lookedUp.size > 100) lookedUp.clear();
    for (const record of due) {
      lookedUp.set(record.journeyId, now);
      const calls = await fetchTrip(record.journeyId, record.date).catch(
        () => null,
      );
      if (calls) noteCalls(record.journeyId, calls);
    }
    set(settle(records, Date.now()));
  } finally {
    isLookingUp = false;
  }
}

/** When the bus of `leg` likely leaves, when it's earlier than it shows */
export function getLikelyDeparture(leg: TripLeg): LikelyDeparture | null {
  return predictDeparture(records, leg, Date.now());
}

export function clearDelayMemory() {
  set([]);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getRecords = () => records;

export function useDelayMemory() {
  return useSyncExternalStore(subscribe, getRecords);
}
