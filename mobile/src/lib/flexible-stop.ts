import { metresBetween } from "./bus-utils";
import { type Place, searchChain } from "./places";
import {
  type Coordinates,
  planTrip,
  type TripOrigin,
  type TripPattern,
} from "./trip-planner";

/**
 * Flexible stops on the way: not a place, but any of a kind, like "a Rema
 * 1000" or "a grocery store". The one that gets you to where you go after it
 * soonest is picked, with the time it takes to get there, stay and go on.
 */

/** How many of them get routes worked out, the ones least out of the way */
const MAX_TRIED = 6;
/** Limit concurrent Entur calls to avoid rate-limiting when rentals are on */
const CONCURRENCY = 3;
/** Reuse first-leg routes across stay-duration adjustments */
const LEG_CACHE_MS = 2 * 60 * 1000;

/** One of the places a flexible stop could be, and how it would go */
export interface FlexibleOption {
  place: Place;
  /** When you'd be there */
  arriveAt: number;
  /** When you'd be at the place after it, having stayed */
  endAt: number;
}

/** What a flexible stop is, kept on the stop on the way */
export interface Flexible {
  /** What was searched for, like "rema 1000" or "grocery" */
  query: string;
  /** Like "Rema 1000" or "grocery store" */
  label: string;
  /** The best first. Ones without a route aren't in it. */
  options: FlexibleOption[];
  /** When they were last worked out */
  rankedAt: number;
}

/** How far out of the way a place is, as the crow flies, in metres */
const detour = (place: Coordinates, from: Coordinates, to: Coordinates) =>
  metresBetween(from, place) +
  metresBetween(place, to) -
  metresBetween(from, to);

const firstLegCache = new Map<
  string,
  { pattern: TripPattern | null; at: number }
>();

function originKey(from: TripOrigin & Coordinates) {
  return "quayId" in from
    ? `q:${from.quayId}`
    : `${from.latitude.toFixed(4)},${from.longitude.toFixed(4)}`;
}

async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run()),
  );
  return results;
}

/**
 * The places called `query` around the way from `from` to `to`, best
 * first: the one you'd be at `to` soonest by, having stayed `minutes` at
 * it. The ones least out of the way get their routes worked out; the
 * others are too far off to be the best.
 */
export async function rankOptions({
  query,
  from,
  to,
  when,
  minutes,
  useRentals,
  walkSpeed,
  preferTransit,
}: {
  query: string;
  from: TripOrigin & Coordinates;
  to: Place;
  /** When you leave `from` */
  when: number;
  minutes: number;
  useRentals: boolean;
  walkSpeed?: number;
  preferTransit?: boolean;
}): Promise<FlexibleOption[]> {
  const places = await searchChain(query, from, to);
  const likely = places
    .map((place) => ({ place, detour: detour(place, from, to) }))
    .sort((a, b) => a.detour - b.detour)
    .slice(0, MAX_TRIED)
    .map(({ place }) => place);

  const whenBucket = Math.round(when / 60_000);
  const fromPart = originKey(from);

  const options = await runPool(
    likely,
    CONCURRENCY,
    async (place): Promise<FlexibleOption | null> => {
      const cacheKey = `${fromPart}>${place.latitude.toFixed(4)},${place.longitude.toFixed(4)}@${whenBucket}/${useRentals}/${walkSpeed ?? ""}/${!!preferTransit}`;
      const cached = firstLegCache.get(cacheKey);
      let there: TripPattern | null;
      if (cached && Date.now() - cached.at < LEG_CACHE_MS) {
        there = cached.pattern;
      } else {
        const [first] = await planTrip(from, place, when, useRentals, {
          walkSpeed,
          preferTransit,
        }).catch(() => []);
        there = first ?? null;
        if (firstLegCache.size > 60) firstLegCache.clear();
        firstLegCache.set(cacheKey, { pattern: there, at: Date.now() });
      }
      if (!there) return null;
      const leaveAt = there.end + minutes * 60 * 1000;
      const [after] = await planTrip(place, to, leaveAt, useRentals, {
        walkSpeed,
        preferTransit,
      }).catch(() => []);
      if (!after) return null;
      return { place, arriveAt: there.end, endAt: after.end };
    },
  );
  return options
    .filter((option) => option !== null)
    .sort((a, b) => a.endAt - b.endAt || a.arriveAt - b.arriveAt);
}
