import AsyncStorage from "@react-native-async-storage/async-storage";
import { BusLiveActivity } from "../../modules/bus-live-activity";
import type { Coordinates } from "./trip-planner";

const GEOCODER_URL = "https://api.entur.io/geocoder/v1/autocomplete";
/** Kartverket's address register, for the address nearest a place */
const ADDRESS_URL = "https://ws.geonorge.no/adresser/v1/punktsok";
/** OpenStreetMap, for places Entur doesn't know, like "Havet Arena" */
const PHOTON_URL = "https://photon.komoot.io/api/";
const RECENT_PLACES_KEY = "bragster.journey.recent-places";
const RECENT_PLACES_MAX = 8;

/** Places near it come first, when it's not known where you are */
const TRONDHEIM = { latitude: 63.4305, longitude: 10.3951 };
/** Trøndelag, so places elsewhere in Norway with the same name are left out */
const TRONDELAG_COUNTY = "KVE:TopographicPlace:50";
/** Shops further from you than this aren't where you're going by bus */
const MAX_DISTANCE_DEGREES = 0.6;
/** The same place found twice is at most this far from itself, in metres */
const SAME_PLACE_M = 300;
/** Stops and city bike racks, which Entur knows better, by OpenStreetMap tag */
const SKIPPED_OSM_KEYS = ["public_transport", "railway"];
const SKIPPED_OSM_VALUES = [
  "bus_stop",
  "platform",
  "bicycle_rental",
  "bus_station",
  // A shop's car park is named after it
  "parking",
  "parking_entrance",
  "bicycle_parking",
];

/** Somewhere to go: an address, a stop, a shop */
export interface Place {
  /** Like "Fossegrenda 9" or "REMA 1000 Elgeseter" */
  name: string;
  /** Like "Trondheim", or a shop's address */
  detail: string | null;
  latitude: number;
  longitude: number;
  /** What it is. Not set on places saved before it was added. */
  kind?: "address" | "street" | "stop" | "place" | "pin";
}

/** Metres between two places, as the crow flies */
function metresBetween(a: Coordinates, b: Coordinates) {
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

/** Whether a place is near enough to `near` to go to by bus */
const isNear = (place: Coordinates, near: Coordinates) =>
  Math.abs(place.latitude - near.latitude) < MAX_DISTANCE_DEGREES &&
  Math.abs(place.longitude - near.longitude) < 2 * MAX_DISTANCE_DEGREES;

/** Addresses and stops, from Entur */
async function searchAddresses(text: string, near: Coordinates) {
  const params = new URLSearchParams({
    text,
    layers: "address,venue",
    size: "8",
    lang: "no",
    "focus.point.lat": String(near.latitude),
    "focus.point.lon": String(near.longitude),
    "boundary.county_ids": TRONDELAG_COUNTY,
  });
  const response = await fetch(`${GEOCODER_URL}?${params}`, {
    headers: { "ET-Client-Name": "bragster-mobile" },
  });
  if (!response.ok) {
    throw new Error(`Couldn't search for places (${response.status})`);
  }
  const body = (await response.json()) as {
    features: {
      geometry: { coordinates: [number, number] };
      properties: {
        name: string;
        locality?: string;
        layer?: string;
        category?: string[];
      };
    }[];
  };
  return body.features.map(
    (feature): Place => ({
      kind:
        feature.properties.layer === "venue"
          ? "stop"
          : feature.properties.category?.includes("street")
            ? "street"
            : feature.properties.category?.includes("vegadresse")
              ? "address"
              : "place",
      name: feature.properties.name,
      detail:
        [
          feature.properties.layer === "venue" ? "Stop" : null,
          feature.properties.locality,
        ]
          .filter(Boolean)
          .join(" · ") || null,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    }),
  );
}

/** Shops, restaurants and the like, from Apple Maps. None on Android. */
async function searchShops(text: string, near: Coordinates): Promise<Place[]> {
  if (!BusLiveActivity) return [];
  const found = await BusLiveActivity.searchPlaces(
    text,
    near.latitude,
    near.longitude,
  );
  return found
    .filter((place) => place.name && isNear(place, near))
    .map((place) => ({
      kind: "place" as const,
      name: place.name,
      // Like "Elgeseter gate 4, 7030 Trondheim, Norge"
      detail: place.detail.replace(/, (Norge|Norway)$/, "") || null,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
  };
}

/** Like "Strandveien 104, Trondheim" */
function photonAddress(properties: PhotonFeature["properties"]) {
  const street = properties.street
    ? [properties.street, properties.housenumber].filter(Boolean).join(" ")
    : null;
  return [street, properties.city ?? properties.district]
    .filter(Boolean)
    .join(", ");
}

/**
 * Arenas, venues, buildings and the like from OpenStreetMap, which knows
 * many that Entur doesn't. It works on Android too, unlike Apple Maps.
 */
async function searchOpenStreetMap(
  text: string,
  near: Coordinates,
  /** West, south, east and north. Around `near` when not given. */
  bbox: number[] = [
    near.longitude - 2 * MAX_DISTANCE_DEGREES,
    near.latitude - MAX_DISTANCE_DEGREES,
    near.longitude + 2 * MAX_DISTANCE_DEGREES,
    near.latitude + MAX_DISTANCE_DEGREES,
  ],
  limit = 8,
): Promise<Place[]> {
  const params = new URLSearchParams({
    q: text,
    lat: String(near.latitude),
    lon: String(near.longitude),
    limit: String(limit),
    lang: "default",
    bbox: bbox.join(","),
  });
  const response = await fetch(`${PHOTON_URL}?${params}`);
  if (!response.ok) return [];
  const body = (await response.json()) as { features: PhotonFeature[] };
  return body.features
    .filter(
      ({ properties }) =>
        properties.name &&
        !SKIPPED_OSM_KEYS.includes(properties.osm_key ?? "") &&
        !SKIPPED_OSM_VALUES.includes(properties.osm_value ?? "") &&
        // Roads are only wanted as streets, not as their bits
        (properties.osm_key !== "highway" || properties.type === "street"),
    )
    .map((feature): Place => {
      const { properties } = feature;
      const isAddress =
        properties.osm_key === "place" && !!properties.housenumber;
      return {
        kind:
          properties.type === "street"
            ? "street"
            : isAddress
              ? "address"
              : "place",
        name: properties.name ?? "",
        detail: photonAddress(properties) || null,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };
    });
}

/** Like "Fossegrenda 9" or "Lars Onsagers veg 9B", but not "Rema 1000 Elgeseter" */
const HOUSE_NUMBER = /\s\d+\s*[a-zA-Z]?$/;

/** "HAVET Arena" and "Havet arena" are the same */
const normalise = (name: string) =>
  name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/**
 * Places called something like `text`: addresses, stops, shops, arenas and
 * the like, the ones near `near` first. Something ending in a number is
 * most likely an address, so those come first then, and places otherwise.
 * The same place found by more than one is only shown once.
 */
export async function searchPlaces(
  text: string,
  near: Coordinates | null,
): Promise<Place[]> {
  const around = near ?? TRONDHEIM;
  const [addresses, shops, others] = await Promise.all([
    searchAddresses(text, around).catch((error) => {
      // The other two are enough when Entur is down
      if (!BusLiveActivity) throw error;
      return [] as Place[];
    }),
    searchShops(text, around).catch(() => [] as Place[]),
    searchOpenStreetMap(text, around).catch(() => [] as Place[]),
  ]);
  const places = HOUSE_NUMBER.test(text)
    ? [...addresses, ...shops, ...others]
    : [...shops, ...others, ...addresses];
  return dedupe(places).slice(0, 15);
}

/** Drops places found twice, keeping the first, and its twin's detail */
function dedupe(places: Place[]) {
  const kept: Place[] = [];
  for (const place of places) {
    const name = normalise(place.name);
    const twin = kept.find(
      (other) =>
        normalise(other.name) === name &&
        // A stop is somewhere else than the building it's named after
        (other.kind === "stop") === (place.kind === "stop") &&
        metresBetween(other, place) < SAME_PLACE_M,
    );
    if (!twin) kept.push(place);
    // The address of a place is worth having, whoever found it
    else if (!twin.detail && place.detail) twin.detail = place.detail;
  }
  return kept;
}

/** Whether a place is one of `text`, like "REMA 1000 Torvet" of "rema 1000" */
export const isOneOf = (place: Place, text: string) =>
  place.kind !== "stop" &&
  normalise(text).length > 0 &&
  normalise(place.name).includes(normalise(text));

/**
 * What the places called `text` are called, written like they write it,
 * like "Rema 1000" for "rema 1000". Null when there are fewer than two, as
 * there's nothing to pick between then.
 */
export function getChainName(text: string, places: Place[]) {
  const matches = places.filter((place) => isOneOf(place, text));
  if (matches.length < 2) return null;
  const words = text.trim().split(/\s+/).length;
  // The same number of words from the start of the name, when it starts
  // with them, like "Rema 1000" of "Rema 1000 Torvet"
  const name = matches
    .map((place) => place.name.split(/\s+/).slice(0, words).join(" "))
    .find((start) => normalise(start) === normalise(text));
  return name ?? text.trim();
}

/** How far around the way a place of a chain may be, in degrees */
const CHAIN_MARGIN_DEGREES = 0.02;
/** Chains found lately, so they're not searched for again on every change */
const chainCache = new Map<string, { places: Place[]; at: number }>();
const CHAIN_CACHE_MS = 10 * 60 * 1000;

/**
 * All the places called `text` around the way from `from` to `to`, like
 * every Rema 1000, to pick the best one of. From OpenStreetMap, which has
 * them all, and Apple Maps. Without any called that, like for "pharmacy",
 * it's what Apple Maps finds for it.
 */
export async function searchChain(
  text: string,
  from: Coordinates,
  to: Coordinates,
): Promise<Place[]> {
  const south = Math.min(from.latitude, to.latitude) - CHAIN_MARGIN_DEGREES;
  const north = Math.max(from.latitude, to.latitude) + CHAIN_MARGIN_DEGREES;
  const west =
    Math.min(from.longitude, to.longitude) - 2 * CHAIN_MARGIN_DEGREES;
  const east =
    Math.max(from.longitude, to.longitude) + 2 * CHAIN_MARGIN_DEGREES;
  const middle = {
    latitude: (south + north) / 2,
    longitude: (west + east) / 2,
  };
  const key = [south, north, west, east]
    .map((part) => part.toFixed(2))
    .concat(normalise(text))
    .join("/");
  const cached = chainCache.get(key);
  if (cached && Date.now() - cached.at < CHAIN_CACHE_MS) return cached.places;
  const isAround = (place: Place) =>
    place.latitude >= south &&
    place.latitude <= north &&
    place.longitude >= west &&
    place.longitude <= east;
  const [others, shops] = await Promise.all([
    searchOpenStreetMap(text, middle, [west, south, east, north], 50).catch(
      () => [] as Place[],
    ),
    searchShops(text, middle).catch(() => [] as Place[]),
  ]);
  const around = dedupe([...others, ...shops]).filter(isAround);
  const called = around.filter((place) => isOneOf(place, text));
  const places = called.length > 0 ? called : shops.filter(isAround);
  if (places.length > 0) {
    if (chainCache.size > 20) chainCache.clear();
    chainCache.set(key, { places, at: Date.now() });
  }
  return places;
}

/** Like "TRONDHEIM" to "Trondheim" */
const titleCase = (text: string) =>
  text
    .toLowerCase()
    .replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toUpperCase());

/**
 * The address nearest to a place, like "Strandveien 104", from Kartverket's
 * address register, to name a pin put on the map. Null when there's none
 * within 250 m.
 */
export async function findAddress(place: Coordinates): Promise<Place | null> {
  const params = new URLSearchParams({
    lat: String(place.latitude),
    lon: String(place.longitude),
    radius: "250",
    treffPerSide: "1",
    koordsys: "4258",
    utkoordsys: "4258",
  });
  const response = await fetch(`${ADDRESS_URL}?${params}`);
  if (!response.ok) return null;
  const body = (await response.json()) as {
    adresser: {
      adressetekst: string;
      poststed: string | null;
      representasjonspunkt: { lat: number; lon: number };
    }[];
  };
  const address = body.adresser[0];
  if (!address) return null;
  return {
    kind: "address",
    name: address.adressetekst,
    detail: address.poststed ? titleCase(address.poststed) : null,
    latitude: address.representasjonspunkt.lat,
    longitude: address.representasjonspunkt.lon,
  };
}

export async function getRecentPlaces(): Promise<Place[]> {
  const stored = await AsyncStorage.getItem(RECENT_PLACES_KEY).catch(
    () => null,
  );
  return stored ? JSON.parse(stored) : [];
}

export async function addRecentPlace(place: Place) {
  const places = await getRecentPlaces();
  const next = [
    place,
    ...places.filter(
      (other) =>
        other.name !== place.name ||
        other.latitude !== place.latitude ||
        other.longitude !== place.longitude,
    ),
  ].slice(0, RECENT_PLACES_MAX);
  await AsyncStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(next)).catch(
    () => {},
  );
}
