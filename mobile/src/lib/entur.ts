/**
 * Entur's open APIs, with AtB's stops, departures and buses in Trondheim.
 * The live map in the AtB app shows the same vehicle positions.
 * https://developer.entur.org
 */

import {
  type Coordinates,
  ENTUR_HEADERS,
  enturGraphql,
  fetchWithTimeout,
  JOURNEY_PLANNER_URL,
  parseSituations,
  type RawSituation,
  type ServiceSituation,
  TRONDELAG_COUNTY,
  TRONDHEIM,
} from "./bus-utils";

const VEHICLES_URL = "https://api.entur.io/realtime/v2/vehicles/graphql";
const GEOCODER_URL = "https://api.entur.io/geocoder/v1/autocomplete";

/** A vehicle position older than this isn't trusted over the stop times */
const VEHICLE_MAX_AGE_MS = 2 * 60 * 1000;

export type { ServiceSituation } from "./bus-utils";

export interface BusStop {
  /** Like "NSR:StopPlace:41613" */
  id: string;
  name: string;
  /** Like "Trondheim" */
  locality: string | null;
}

export interface NearbyStop extends BusStop {
  /** Metres away */
  distance: number;
  latitude: number;
  longitude: number;
}

export interface Departure {
  journeyId: string;
  /** The day the trip is run on, like "2026-11-14". Trips after midnight
   belong to the day before. */
  date: string;
  /** The stop's place in the trip, as stops can come up more than once */
  stopPosition: number;
  /** Like "3" */
  line: string;
  /** Like "bus", "tram", "rail", or "water" */
  mode: string;
  /** Like "Lohove via sentrum" */
  destination: string;
  quayId: string;
  /** The platform, like "P1", if the stop has more than one */
  platform: string | null;
  aimedArrival: Date;
  expectedArrival: Date;
  expectedDeparture: Date;
  realtime: boolean;
  cancelled: boolean;
  situations: ServiceSituation[];
}

/** One part of a stop: a platform, or one side of the road */
export interface StopQuay {
  id: string;
  /** Like "P1", if it has one */
  platform: string | null;
  /** Like "ved Bunnpris" */
  description: string | null;
  /** Where its buses go, like ["Lohove", "Strindheim"], most buses first */
  towards: string[];
  departures: Departure[];
}

export interface TripCall {
  /** From 0, the same as `Departure.stopPosition` */
  position: number;
  quayId: string;
  name: string;
  /** Platform code like "P1" if the stop has more than one */
  platform: string | null;
  /** Where the platform is */
  latitude: number | null;
  longitude: number | null;
  aimedArrival: Date;
  expectedArrival: Date;
  expectedDeparture: Date;
  /** Set once the bus has got there, with real-time data */
  actualArrival: Date | null;
  /** Set once the bus has left */
  actualDeparture: Date | null;
  realtime: boolean;
  cancelled: boolean;
  situations: ServiceSituation[];
}

/** Where the bus is, from its GPS */
export interface VehiclePosition {
  /** The stop it last passed, or is at, from 0 */
  lastStopPosition: number;
  atStop: boolean;
  /** 0-1, how far it has come from that stop to the next */
  progressToNext: number | null;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

export async function searchStops(text: string): Promise<BusStop[]> {
  const params = new URLSearchParams({
    text,
    layers: "venue",
    size: "15",
    lang: "no",
    "focus.point.lat": String(TRONDHEIM.latitude),
    "focus.point.lon": String(TRONDHEIM.longitude),
    "boundary.county_ids": TRONDELAG_COUNTY,
  });
  const response = await fetchWithTimeout(
    `${GEOCODER_URL}?${params}`,
    { headers: ENTUR_HEADERS },
    8_000,
  );
  if (!response.ok) {
    throw new Error(`Couldn't search for stops (${response.status})`);
  }
  const body = (await response.json()) as {
    features: {
      properties: { id: string; name: string; locality?: string };
    }[];
  };
  return (
    body.features
      // Addresses and places with a stop nearby have other ids
      .filter((feature) => feature.properties.id.startsWith("NSR:StopPlace:"))
      .map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.name,
        locality: feature.properties.locality ?? null,
      }))
  );
}

const NEARBY_STOPS_QUERY = `
query NearbyStops($lat: Float!, $lon: Float!, $maxDistance: Int!, $maxResults: Int!) {
  nearest(
    latitude: $lat
    longitude: $lon
    maximumDistance: $maxDistance
    maximumResults: $maxResults
    filterByPlaceTypes: [stopPlace]
  ) {
    edges {
      node {
        distance
        place {
          ... on StopPlace {
            id
            name
            latitude
            longitude
          }
        }
      }
    }
  }
}`;

interface NearbyStopsData {
  nearest: {
    edges: {
      node: {
        distance: number;
        place: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
        } | null;
      };
    }[];
  } | null;
}

/** Stops closest to `coords`, nearest first */
export async function fetchNearbyStops(
  coords: Coordinates,
  maxDistance = 800,
  maxResults = 8,
): Promise<NearbyStop[]> {
  const data = await enturGraphql<NearbyStopsData>(
    JOURNEY_PLANNER_URL,
    NEARBY_STOPS_QUERY,
    {
      lat: coords.latitude,
      lon: coords.longitude,
      maxDistance,
      maxResults,
    },
    8_000,
  );
  const edges = data.nearest?.edges ?? [];
  const seen = new Set<string>();
  const stops: NearbyStop[] = [];
  for (const edge of edges) {
    const place = edge.node.place;
    if (
      !place?.id ||
      !place.name ||
      place.latitude == null ||
      place.longitude == null ||
      seen.has(place.id)
    ) {
      continue;
    }
    seen.add(place.id);
    stops.push({
      id: place.id,
      name: place.name,
      locality: null,
      distance: Math.round(edge.node.distance),
      latitude: place.latitude,
      longitude: place.longitude,
    });
  }
  return stops;
}

const DEPARTURES_QUERY = `
query Departures($id: String!) {
  stopPlace(id: $id) {
    name
    quays {
      id
      publicCode
      description
      estimatedCalls(
        numberOfDepartures: 20
        timeRange: 10800
        arrivalDeparture: departures
        includeCancelledTrips: true
      ) {
        stopPositionInPattern
        date
        realtime
        cancellation
        aimedArrivalTime
        expectedArrivalTime
        expectedDepartureTime
        destinationDisplay { frontText }
        serviceJourney { id line { publicCode transportMode } }
        situations {
          id
          summary { value language }
          description { value language }
        }
      }
    }
  }
}`;

interface DeparturesData {
  stopPlace: {
    name: string;
    quays: {
      id: string;
      publicCode: string | null;
      description: string | null;
      estimatedCalls: {
        stopPositionInPattern: number;
        date: string;
        realtime: boolean;
        cancellation: boolean;
        aimedArrivalTime: string;
        expectedArrivalTime: string;
        expectedDepartureTime: string;
        destinationDisplay: { frontText: string } | null;
        serviceJourney: {
          id: string;
          line: { publicCode: string | null; transportMode: string };
        };
        situations?: RawSituation[] | null;
      }[];
    }[];
  } | null;
}

/** How many places its buses go to are named for a part of a stop */
const TOWARDS_MAX = 3;

/**
 * The next departures from each part of a stop: its platforms, or the sides
 * of the road. Parts no buses leave from are left out.
 */
export async function fetchDepartures(stopId: string) {
  const { stopPlace } = await enturGraphql<DeparturesData>(
    JOURNEY_PLANNER_URL,
    DEPARTURES_QUERY,
    { id: stopId },
    10_000,
  );
  if (!stopPlace) throw new Error("The stop doesn't exist any more");
  const hasPlatforms = stopPlace.quays.length > 1;
  const allRawSituations: RawSituation[] = [];
  const quays = stopPlace.quays
    .filter((quay) => quay.estimatedCalls.length > 0)
    .map((quay): StopQuay => {
      const platform = hasPlatforms ? quay.publicCode || null : null;
      const departures = quay.estimatedCalls.map((call): Departure => {
        if (call.situations) allRawSituations.push(...call.situations);
        return {
          journeyId: call.serviceJourney.id,
          date: call.date,
          stopPosition: call.stopPositionInPattern,
          line: call.serviceJourney.line.publicCode ?? "?",
          mode: call.serviceJourney.line.transportMode,
          destination: call.destinationDisplay?.frontText ?? "",
          quayId: quay.id,
          platform,
          aimedArrival: new Date(call.aimedArrivalTime),
          expectedArrival: new Date(call.expectedArrivalTime),
          expectedDeparture: new Date(call.expectedDepartureTime),
          realtime: call.realtime,
          cancelled: call.cancellation,
          situations: parseSituations(call.situations),
        };
      });
      // "Lohove via sentrum" goes towards Lohove
      const counts = new Map<string, number>();
      for (const departure of departures) {
        const place = departure.destination.split(" via ")[0].trim();
        if (place) counts.set(place, (counts.get(place) ?? 0) + 1);
      }
      const towards = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOWARDS_MAX)
        .map(([place]) => place);
      return {
        id: quay.id,
        platform,
        description: quay.description?.trim() || null,
        towards,
        departures,
      };
    })
    .sort(
      (a, b) =>
        (a.platform ?? "").localeCompare(b.platform ?? "", "nb", {
          numeric: true,
        }) || a.id.localeCompare(b.id),
    );
  return {
    name: stopPlace.name,
    quays,
    situations: parseSituations(allRawSituations),
  };
}

const TRIP_QUERY = `
query Trip($id: String!, $date: Date!) {
  serviceJourney(id: $id) {
    estimatedCalls(date: $date) {
      stopPositionInPattern
      realtime
      cancellation
      aimedArrivalTime
      expectedArrivalTime
      expectedDepartureTime
      actualArrivalTime
      actualDepartureTime
      quay {
        id
        name
        publicCode
        latitude
        longitude
        stopPlace { quays { id } }
      }
      situations {
        id
        summary { value language }
        description { value language }
      }
    }
  }
}`;

interface TripData {
  serviceJourney: {
    estimatedCalls: {
      stopPositionInPattern: number;
      realtime: boolean;
      cancellation: boolean;
      aimedArrivalTime: string;
      expectedArrivalTime: string;
      expectedDepartureTime: string;
      actualArrivalTime: string | null;
      actualDepartureTime: string | null;
      quay: {
        id: string;
        name: string;
        publicCode?: string | null;
        latitude: number | null;
        longitude: number | null;
        stopPlace?: { quays: { id: string }[] | null } | null;
      };
      situations?: RawSituation[] | null;
    }[];
  } | null;
}

/** Every stop of a trip, with real-time times */
export async function fetchTrip(
  journeyId: string,
  date: string,
): Promise<TripCall[]> {
  const { serviceJourney } = await enturGraphql<TripData>(
    JOURNEY_PLANNER_URL,
    TRIP_QUERY,
    { id: journeyId, date },
    10_000,
  );
  if (!serviceJourney) throw new Error("The trip doesn't exist any more");
  return serviceJourney.estimatedCalls.map((call) => {
    const hasPlatforms = (call.quay.stopPlace?.quays?.length ?? 0) > 1;
    return {
      position: call.stopPositionInPattern,
      quayId: call.quay.id,
      name: call.quay.name,
      platform: hasPlatforms ? call.quay.publicCode || null : null,
      latitude: call.quay.latitude,
      longitude: call.quay.longitude,
      aimedArrival: new Date(call.aimedArrivalTime),
      expectedArrival: new Date(call.expectedArrivalTime),
      expectedDeparture: new Date(call.expectedDepartureTime),
      actualArrival: call.actualArrivalTime
        ? new Date(call.actualArrivalTime)
        : null,
      actualDeparture: call.actualDepartureTime
        ? new Date(call.actualDepartureTime)
        : null,
      realtime: call.realtime,
      cancelled: call.cancellation,
      situations: parseSituations(call.situations),
    };
  });
}

const ROUTE_QUERY = `
query Route($id: String!) {
  serviceJourney(id: $id) {
    pointsOnLink { points }
  }
}`;

/**
 * The road a trip follows, from its first stop to its last, as an encoded
 * polyline. Null when Entur doesn't have it.
 */
export async function fetchRoute(journeyId: string): Promise<string | null> {
  const { serviceJourney } = await enturGraphql<{
    serviceJourney: { pointsOnLink: { points: string | null } | null } | null;
  }>(JOURNEY_PLANNER_URL, ROUTE_QUERY, { id: journeyId }, 8_000);
  return serviceJourney?.pointsOnLink?.points ?? null;
}

const VEHICLE_QUERY = `
query Vehicle($codespace: String!, $id: String!) {
  vehicles(codespaceId: $codespace, serviceJourneyId: $id) {
    lastUpdated
    location { latitude longitude }
    progressBetweenStops { percentage }
    monitoredCall { order vehicleAtStop }
    serviceJourney { date }
  }
}`;

interface VehicleData {
  vehicles: {
    lastUpdated: string;
    location: { latitude: number; longitude: number };
    progressBetweenStops: { percentage: number | null } | null;
    monitoredCall: { order: number; vehicleAtStop: boolean | null } | null;
    serviceJourney: { date: string | null } | null;
  }[];
}

/**
 * Where the bus running the trip is, or null before it has started, after it
 * has finished, or when it doesn't send its position.
 */
export async function fetchVehicle(
  journeyId: string,
  date: string,
): Promise<VehiclePosition | null> {
  // Like "ATB" in "ATB:ServiceJourney:3_..."
  const codespace = journeyId.split(":")[0];
  const { vehicles } = await enturGraphql<VehicleData>(
    VEHICLES_URL,
    VEHICLE_QUERY,
    {
      codespace,
      id: journeyId,
    },
    5_000,
  );
  const vehicle = vehicles
    .filter(
      (candidate) =>
        candidate.monitoredCall &&
        // The same trip runs every day
        (!candidate.serviceJourney?.date ||
          candidate.serviceJourney.date === date),
    )
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))[0];
  if (!vehicle?.monitoredCall) return null;
  const updatedAt = new Date(vehicle.lastUpdated);
  if (Date.now() - updatedAt.getTime() > VEHICLE_MAX_AGE_MS) return null;
  const percentage = vehicle.progressBetweenStops?.percentage;
  return {
    // Counted from 1
    lastStopPosition: vehicle.monitoredCall.order - 1,
    atStop: vehicle.monitoredCall.vehicleAtStop ?? false,
    progressToNext:
      percentage == null ? null : Math.max(0, Math.min(1, percentage / 100)),
    latitude: vehicle.location.latitude,
    longitude: vehicle.location.longitude,
    updatedAt,
  };
}

export type BusStatus =
  /** Hasn't passed the stop before yours yet */
  | "coming"
  /** On its way from the stop before yours */
  | "approaching"
  /** Standing at your stop */
  | "here"
  /** Has left your stop */
  | "departed"
  | "cancelled";

export interface BusProgress {
  status: BusStatus;
  /** Your stop */
  stop: TripCall;
  /** The stop before yours, null when the trip starts at yours */
  previousStop: TripCall | null;
  /** The last stop the bus has passed, or is at, null before it has started */
  lastPassed: TripCall | null;
  /** Whether the bus is standing at `lastPassed` */
  atLastPassed: boolean;
  /** How many more stops it gets to, counting yours. 0 once it's there */
  stopsAway: number;
  /**
   * When the progress bar from the stop before yours to yours starts and ends
   * filling up, in ms. Worked out so it's at the right place now, and keeps
   * moving when nothing has been fetched for a while, like on the Lock Screen.
   */
  segment: { start: number; end: number } | null;
  /** Whether the bus sends its position, otherwise the times are used */
  hasPosition: boolean;
  realtime: boolean;
}

/** When the bus left a stop, or should leave it */
const departedAt = (call: TripCall) =>
  call.actualDeparture ?? call.expectedDeparture;

/**
 * Works out how far a bus has come, towards the stop at `stopPosition`.
 * The bus's position is used when there is one, and the stop times, which
 * say when it has passed each stop, otherwise.
 */
export function getBusProgress(
  calls: TripCall[],
  stopPosition: number,
  vehicle: VehiclePosition | null,
  now = Date.now(),
): BusProgress | null {
  const stop = calls.find((call) => call.position === stopPosition);
  if (!stop) return null;
  const previousStop =
    calls.filter((call) => call.position < stopPosition).at(-1) ?? null;
  const realtime = stop.realtime;

  // The stops it has got to. A bus can be ahead of its GPS, or the other way
  // round, so whichever has got furthest wins.
  let passedPosition = -1;
  let atStop = false;
  let confirmedDepartedAtPassed = false;
  for (const call of calls) {
    const hasPassed =
      call.actualArrival !== null ||
      call.actualDeparture !== null ||
      // Without real-time data, the timetable is all there is
      (!call.realtime && departedAt(call).getTime() <= now);
    if (hasPassed && call.position > passedPosition) {
      passedPosition = call.position;
      atStop = call.actualDeparture === null && call.actualArrival !== null;
      confirmedDepartedAtPassed = call.actualDeparture !== null;
    }
  }
  const hasPosition = vehicle !== null;
  if (vehicle) {
    if (vehicle.lastStopPosition > passedPosition) {
      // Its GPS is ahead of the stop times
      atStop = vehicle.atStop;
      passedPosition = vehicle.lastStopPosition;
    } else if (
      vehicle.lastStopPosition === passedPosition &&
      !confirmedDepartedAtPassed
    ) {
      // Only update atStop if stop times haven't already confirmed departure
      atStop = vehicle.atStop;
    }
  }
  const lastPassed =
    calls.filter((call) => call.position <= passedPosition).at(-1) ?? null;
  const stopsAway = calls.filter(
    (call) => call.position > passedPosition && call.position <= stopPosition,
  ).length;

  const base = {
    stop,
    previousStop,
    lastPassed,
    atLastPassed: atStop,
    stopsAway,
    hasPosition,
    realtime,
  };
  const arrival = stop.expectedArrival.getTime();

  if (stop.cancelled) {
    return { ...base, status: "cancelled", segment: null };
  }
  // Without real-time data it's assumed to be there a minute late at most
  const isLateWithoutData = !realtime && now > arrival + 60 * 1000;
  if (passedPosition === stopPosition && atStop) {
    return { ...base, status: "here", stopsAway: 0, segment: null };
  }
  if (passedPosition >= stopPosition || isLateWithoutData) {
    return { ...base, status: "departed", stopsAway: 0, segment: null };
  }
  if (!previousStop) {
    // Starts at your stop, so there's nothing to fill up
    return { ...base, status: "coming", segment: null };
  }
  if (passedPosition < previousStop.position || atStop) {
    // Fills up once it's expected to leave the stop before yours, which can't
    // be in the past while it's still on its way or standing at the stop
    const start = Math.max(departedAt(previousStop).getTime(), now);
    return {
      ...base,
      status: passedPosition < previousStop.position ? "coming" : "approaching",
      segment: { start, end: Math.max(arrival, start) },
    };
  }

  // Between the stop before yours and yours
  let fraction: number;
  if (vehicle?.lastStopPosition === previousStop.position) {
    fraction = vehicle.progressToNext ?? 0;
  } else {
    const start = departedAt(previousStop).getTime();
    fraction = arrival > start ? (now - start) / (arrival - start) : 1;
  }
  fraction = Math.max(0, Math.min(0.99, fraction));
  if (arrival <= now) {
    // Later than the times say, so it waits almost full
    return {
      ...base,
      status: "approaching",
      segment: { start: now - 99_000, end: now + 1_000 },
    };
  }
  // So that it's at `fraction` now, and full when the bus is expected
  const start = now - (fraction * (arrival - now)) / (1 - fraction);
  return { ...base, status: "approaching", segment: { start, end: arrival } };
}

/** 0-1, how full the progress bar is at `now` */
export function getSegmentFraction(
  segment: BusProgress["segment"],
  now = Date.now(),
) {
  if (!segment) return 0;
  if (segment.end <= segment.start) return now >= segment.end ? 1 : 0;
  return Math.max(
    0,
    Math.min(1, (now - segment.start) / (segment.end - segment.start)),
  );
}

/** Like "Passed Nidarosdomen · 3 stops away", the same as on the Lock Screen */
export function busStatusText(progress: BusProgress) {
  const { stop, lastPassed } = progress;
  switch (progress.status) {
    case "here":
      return `At ${stop.name} now`;
    case "departed":
      return `Has left ${stop.name}`;
    case "cancelled":
      return "The trip is cancelled";
    default: {
      if (!lastPassed) return "Hasn't started yet";
      const place = progress.atLastPassed
        ? `At ${lastPassed.name}`
        : `Passed ${lastPassed.name}`;
      if (progress.stopsAway <= 1) return `${place} · Your stop is next`;
      return `${place} · ${progress.stopsAway} stops away`;
    }
  }
}
