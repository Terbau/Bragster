import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import type { DayKind, DelaySlot, SlotLookup } from "./delay-history";

/**
 * Fetches how late buses have really been from the server, see
 * delay-history.ts, and keeps it for a day, as it only changes once a week
 */

const KEY = "bragster.bus.delay-history";
const KEEP_MS = 24 * 60 * 60 * 1000;
/** After a failed fetch, like when signed out, it's not tried again for this long */
const RETRY_MS = 10 * 60 * 1000;

type Entry = { at: number; slots: DelaySlot[] };
let entries: Record<string, Entry> = {};
let failedAt = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const loaded = AsyncStorage.getItem(KEY)
  .then((stored) => {
    if (stored) entries = { ...JSON.parse(stored), ...entries };
  })
  .catch(() => {});

const keyOf = (lineRef: string, quay: string, dayKind: DayKind) =>
  `${lineRef}|${quay}|${dayKind}`;

function save() {
  saveTimer ??= setTimeout(() => {
    saveTimer = null;
    const now = Date.now();
    for (const [key, entry] of Object.entries(entries)) {
      if (now - entry.at > KEEP_MS * 7) delete entries[key];
    }
    void AsyncStorage.setItem(KEY, JSON.stringify(entries)).catch(() => {});
  }, 5000);
}

/**
 * Makes sure the history of these lines at these stops is at hand, fetching
 * what isn't. Never throws: without it, there's just no history.
 */
export async function loadHistory(
  pairs: { lineRef: string; quay: string }[],
  dayKind: DayKind,
) {
  await loaded;
  const now = Date.now();
  const missing = pairs.filter((pair) => {
    const entry = entries[keyOf(pair.lineRef, pair.quay, dayKind)];
    return !entry || now - entry.at > KEEP_MS;
  });
  if (missing.length === 0 || now - failedAt < RETRY_MS) return;
  try {
    const { slots } = await api<{ slots: DelaySlot[] }>(
      "/api/mobile/bus/delays",
      {
        method: "POST",
        body: { pairs: missing.slice(0, 60), dayKind },
      },
    );
    for (const pair of missing.slice(0, 60)) {
      entries[keyOf(pair.lineRef, pair.quay, dayKind)] = {
        at: now,
        slots: slots.filter(
          (slot) => slot.lineRef === pair.lineRef && slot.quay === pair.quay,
        ),
      };
    }
    save();
  } catch {
    failedAt = now;
  }
}

/** Looks up what's at hand for a kind of day */
export const historyLookup =
  (dayKind: DayKind): SlotLookup =>
  (lineRef, quay) =>
    entries[keyOf(lineRef, quay, dayKind)]?.slots ?? [];
