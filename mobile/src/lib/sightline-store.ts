import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRoute, type TripCall } from "./entur";
import {
  computeSightline,
  decodePolyline,
  type LatLon,
  type Sightline,
  type SightlineCorrections,
} from "./sightline";

/** Followed by the platform and the stop before it, see `sightlineKey` */
const SIGHTLINE_KEY = "bragster.bus.sightline.v1.";

/**
 * Buses come to a platform along different roads, so there's a sightline
 * for each stop they come from. Null when the trip starts at the stop.
 */
export function sightlineKey(
  quayId: string,
  stopPosition: number,
  calls: TripCall[],
) {
  const previous = calls.filter((call) => call.position < stopPosition).at(-1);
  return previous ? `${quayId}/${previous.quayId}` : null;
}

export async function saveSightline(sightline: Sightline) {
  await AsyncStorage.setItem(
    SIGHTLINE_KEY + sightline.key,
    JSON.stringify(sightline),
  ).catch(() => {});
}

/**
 * How far away a bus can be seen from the stop at `stopPosition` of its
 * trip. It's worked out from the map the first time a platform is used, which
 * takes a few seconds, and kept on the phone after that. `recompute` works
 * it out again, keeping `corrections`. Null when there's none to work out.
 */
export async function getSightline(
  journeyId: string,
  quayId: string,
  stopPosition: number,
  calls: TripCall[],
  recompute = false,
  corrections?: SightlineCorrections,
): Promise<Sightline | null> {
  const key = sightlineKey(quayId, stopPosition, calls);
  const stops = calls.filter((call) => call.position <= stopPosition);
  const hasPlaces = stops.every(
    (call) => call.latitude !== null && call.longitude !== null,
  );
  if (!key || !hasPlaces) return null;
  const stored = await AsyncStorage.getItem(SIGHTLINE_KEY + key).catch(
    () => null,
  );
  let sightline: Sightline | null = stored ? JSON.parse(stored) : null;
  if (!sightline || recompute) {
    const route = await fetchRoute(journeyId);
    // What's been said about it still holds
    const { seenAt = null, hiddenAt = null } = corrections ?? sightline ?? {};
    sightline = route
      ? await computeSightline(
          key,
          decodePolyline(route),
          stops as (TripCall & LatLon)[],
          { seenAt, hiddenAt },
        )
      : null;
    if (sightline) await saveSightline(sightline);
  }
  return sightline;
}
