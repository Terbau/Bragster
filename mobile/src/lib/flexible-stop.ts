import { metresBetween } from "./journey-logic";
import { type Place, searchChain } from "./places";
import { type Coordinates, planTrip, type TripOrigin } from "./trip-planner";

/**
 * Flexible stops on the way: not a place, but any of a kind, like "a Rema
 * 1000". The one that gets you to where you go after it soonest is picked,
 * with the time it takes to get there, stay and go on.
 */

/** How many of them get routes worked out, the ones least out of the way */
const MAX_TRIED = 6;

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
  /** What was searched for, like "rema 1000" */
  query: string;
  /** Like "Rema 1000" */
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
}: {
  query: string;
  from: TripOrigin & Coordinates;
  to: Place;
  /** When you leave `from` */
  when: number;
  minutes: number;
  useRentals: boolean;
}): Promise<FlexibleOption[]> {
  const places = await searchChain(query, from, to);
  const likely = places
    .map((place) => ({ place, detour: detour(place, from, to) }))
    .sort((a, b) => a.detour - b.detour)
    .slice(0, MAX_TRIED)
    .map(({ place }) => place);
  const options = await Promise.all(
    likely.map(async (place): Promise<FlexibleOption | null> => {
      const [there] = await planTrip(from, place, when, useRentals).catch(
        () => [],
      );
      if (!there) return null;
      const leaveAt = there.end + minutes * 60 * 1000;
      const [after] = await planTrip(place, to, leaveAt, useRentals).catch(
        () => [],
      );
      if (!after) return null;
      return { place, arriveAt: there.end, endAt: after.end };
    }),
  );
  return options
    .filter((option) => option !== null)
    .sort((a, b) => a.endAt - b.endAt || a.arriveAt - b.arriveAt);
}
