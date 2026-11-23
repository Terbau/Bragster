/**
 * Routes from one place to another with Entur's journey planner: buses,
 * trams and trains, walking, and rented electric scooters and bikes when
 * they're asked for. Real-time delays are taken into account.
 */

import {
  type Coordinates,
  enturGraphql,
  JOURNEY_PLANNER_URL,
  parseSituations,
  type RawSituation,
  type ServiceSituation,
} from "./bus-utils";

const MOBILITY_URL = "https://api.entur.io/mobility/v2/graphql";

/** Default walking pace, in m/s */
export const WALK_SPEED = 1.3;

/** Who rents out what in Trondheim. Their scooters are all electric. */
const SCOOTER_NETWORKS = ["rydetrondheim", "voitrondheim"];
const BIKE_NETWORKS = ["trondheimbysykkel", "rydetrondheim"];
/** City bikes are only taken from racks with an electric one in them */
const CITY_BIKE_NETWORK = "trondheimbysykkel";
const NETWORK_NAMES: Record<string, string> = {
  rydetrondheim: "Ryde",
  voitrondheim: "Voi",
  trondheimbysykkel: "Bysykkel",
};

export type { Coordinates } from "./bus-utils";

export interface TripPlace {
  /** Like "Prinsens gate", or "E-scooter" where one stands */
  name: string;
  latitude: number;
  longitude: number;
  /** Set at stops */
  quayId: string | null;
  /** Like "P1", if the stop has more than one */
  platform: string | null;
}

export interface TripLeg {
  /** "foot", "bus", "tram", "rail", "scooter", "bicycle" and so on */
  mode: string;
  /** A scooter or a bike that's rented, from `network` */
  rented: boolean;
  /** Like "Ryde" */
  network: string | null;
  from: TripPlace;
  to: TripPlace;
  /** When it starts and ends, in ms, with delays */
  start: number;
  end: number;
  realtime: boolean;
  /** In metres */
  distance: number;
  /** For a bus: its line like "3", and where it's going like "Lohove" */
  line: string | null;
  /** For a bus: Entur's id of its line, like "ATB:Line:2_3" */
  lineRef?: string | null;
  /** For a bus: like "localBus" or "regionalBus", for its colour */
  submode?: string | null;
  headsign: string | null;
  /** For a bus: its trip, see `Departure` in entur.ts */
  journeyId: string | null;
  date: string | null;
  /** The places in the trip of the stops to get on and off at, from 0 */
  fromPosition: number | null;
  toPosition: number | null;
  /**
   * The way it goes, as an encoded polyline, to draw it on a map. Not set
   * on routes saved before it was added.
   */
  geometry?: string | null;
  /** For a bus: the stops it passes on the way, without getting off */
  stops?: TripStop[];
  /** Active service alerts / disruptions for this leg */
  situations?: ServiceSituation[];
  /** For a bus: when it leaves by the timetable, in ms. Not on old routes. */
  aimedStart?: number | null;
  /** For a bus: when it gets there by the timetable, in ms */
  aimedEnd?: number | null;
  /**
   * For the first bus of a route: when it's likely to really leave, when
   * that's earlier than it shows, like a bus that usually makes up for its
   * delay. Set by journey.ts, see delay-memory.ts.
   */
  likely?: LikelyDeparture | null;
}

/** When a bus is likely to leave, earlier than it shows */
export interface LikelyDeparture {
  time: number;
  /** How many earlier departures it's learned from */
  samples: number;
}

/** A stop a bus passes */
export interface TripStop {
  name: string;
  latitude: number;
  longitude: number;
}

/** One way to get there */
export interface TripPattern {
  legs: TripLeg[];
  start: number;
  end: number;
}

/** A place to start from, or a platform of a stop */
export type TripOrigin = Coordinates | { quayId: string };

const TRIP_QUERY = `
query Trip(
  $from: Location!
  $to: Location!
  $when: DateTime!
  $arriveBy: Boolean
  $walkSpeed: Float
  $walkReluctance: Float
  $modes: Modes
  $networks: InputWhiteListed
) {
  trip(
    from: $from
    to: $to
    dateTime: $when
    arriveBy: $arriveBy
    numTripPatterns: 6
    modes: $modes
    whiteListed: $networks
    walkSpeed: $walkSpeed
    walkReluctance: $walkReluctance
  ) {
    tripPatterns {
      expectedStartTime
      expectedEndTime
      legs {
        mode
        rentedBike
        distance
        aimedStartTime
        aimedEndTime
        expectedStartTime
        expectedEndTime
        realtime
        fromPlace { ...place bikeRentalStation { id networks } rentalVehicle { network } }
        toPlace { ...place }
        line { id publicCode transportSubmode }
        serviceJourney { id }
        fromEstimatedCall {
          stopPositionInPattern
          date
          cancellation
          destinationDisplay { frontText }
        }
        toEstimatedCall {
          stopPositionInPattern
          cancellation
        }
        pointsOnLink { points }
        intermediateQuays { name latitude longitude }
        situations {
          id
          summary { value language }
          description { value language }
        }
      }
    }
  }
}
fragment place on Place {
  name
  latitude
  longitude
  quay { id publicCode stopPlace { quays { id } } }
}`;

interface PlaceData {
  name: string | null;
  latitude: number;
  longitude: number;
  quay: {
    id: string;
    publicCode: string | null;
    stopPlace: { quays: { id: string }[] | null } | null;
  } | null;
  bikeRentalStation?: { id: string; networks: string[] } | null;
  rentalVehicle?: { network: string } | null;
}

interface TripData {
  trip: {
    tripPatterns: {
      expectedStartTime: string;
      expectedEndTime: string;
      legs: {
        mode: string;
        rentedBike: boolean | null;
        distance: number;
        aimedStartTime: string;
        aimedEndTime: string;
        expectedStartTime: string;
        expectedEndTime: string;
        realtime: boolean;
        fromPlace: PlaceData;
        toPlace: PlaceData;
        line: {
          id: string;
          publicCode: string | null;
          transportSubmode: string | null;
        } | null;
        serviceJourney: { id: string } | null;
        fromEstimatedCall: {
          stopPositionInPattern: number;
          date: string;
          cancellation: boolean;
          destinationDisplay: { frontText: string } | null;
        } | null;
        toEstimatedCall: {
          stopPositionInPattern: number;
          cancellation: boolean;
        } | null;
        pointsOnLink: { points: string | null } | null;
        intermediateQuays: TripStop[] | null;
        situations?: RawSituation[] | null;
      }[];
    }[];
  };
}

function toPlace(place: PlaceData, fallback: string): TripPlace {
  const hasPlatforms = (place.quay?.stopPlace?.quays?.length ?? 0) > 1;
  return {
    name: place.name || fallback,
    latitude: place.latitude,
    longitude: place.longitude,
    quayId: place.quay?.id ?? null,
    platform: hasPlatforms ? place.quay?.publicCode || null : null,
  };
}

/** A pattern with the rack a city bike is taken from, to check it later */
interface Candidate {
  pattern: TripPattern;
  cityBikeRacks: string[];
  isCancelled: boolean;
  isAllowed: boolean;
}

type Rental = "scooter_rental" | "bike_rental";

export interface PlanTripOptions {
  walkSpeed?: number;
  arriveBy?: boolean;
  /** Mostly by bus: long walks are avoided, also when they're quicker */
  preferTransit?: boolean;
}

/** How much worse walking is than riding, Entur's default and with `preferTransit` */
const WALK_RELUCTANCE = 4;
const PREFER_TRANSIT_WALK_RELUCTANCE = 12;
/** With `preferTransit`, routes that walk this much more than the least are left out */
const PREFER_TRANSIT_EXTRA_WALK_M = 300;
/** ...and only when they walk more than this in all */
const PREFER_TRANSIT_WALK_M = 500;

async function fetchPatterns(
  from: TripOrigin,
  to: Coordinates & { name: string },
  when: number,
  rental: Rental | null,
  options: PlanTripOptions = {},
): Promise<Candidate[]> {
  const networks =
    rental === "scooter_rental"
      ? SCOOTER_NETWORKS
      : rental === "bike_rental"
        ? BIKE_NETWORKS
        : null;
  const { trip } = await enturGraphql<TripData>(
    JOURNEY_PLANNER_URL,
    TRIP_QUERY,
    {
      from:
        "quayId" in from
          ? { place: from.quayId }
          : {
              coordinates: {
                latitude: from.latitude,
                longitude: from.longitude,
              },
            },
      to: {
        name: to.name,
        coordinates: { latitude: to.latitude, longitude: to.longitude },
      },
      when: new Date(when).toISOString(),
      arriveBy: options.arriveBy ?? false,
      walkSpeed: options.walkSpeed ?? WALK_SPEED,
      walkReluctance: options.preferTransit
        ? PREFER_TRANSIT_WALK_RELUCTANCE
        : WALK_RELUCTANCE,
      // Rented all the way, to or from a stop, or not at all, whichever is
      // fastest. Left out, it's buses and walking.
      modes: rental
        ? { accessMode: rental, egressMode: rental, directMode: rental }
        : null,
      networks: networks ? { rentalNetworks: networks } : null,
    },
    10_000,
  );

  return trip.tripPatterns.map((pattern) => {
    const cityBikeRacks: string[] = [];
    let isCancelled = false;
    let isAllowed = true;
    const legs = pattern.legs.map((leg): TripLeg => {
      const rented = leg.rentedBike ?? false;
      const network =
        leg.fromPlace.rentalVehicle?.network ??
        leg.fromPlace.bikeRentalStation?.networks[0] ??
        null;
      if (rented) {
        if (!network || !networks?.includes(network)) isAllowed = false;
        if (network === CITY_BIKE_NETWORK && leg.fromPlace.bikeRentalStation) {
          cityBikeRacks.push(leg.fromPlace.bikeRentalStation.id);
        }
      }
      if (
        leg.fromEstimatedCall?.cancellation ||
        leg.toEstimatedCall?.cancellation
      ) {
        isCancelled = true;
      }
      return {
        mode: leg.mode,
        rented,
        network: network ? (NETWORK_NAMES[network] ?? network) : null,
        from: toPlace(leg.fromPlace, "Here"),
        to: toPlace(leg.toPlace, to.name),
        start: new Date(leg.expectedStartTime).getTime(),
        end: new Date(leg.expectedEndTime).getTime(),
        realtime: leg.realtime,
        distance: leg.distance,
        line: leg.line?.publicCode ?? null,
        lineRef: leg.line?.id ?? null,
        submode: leg.line?.transportSubmode ?? null,
        headsign: leg.fromEstimatedCall?.destinationDisplay?.frontText ?? null,
        journeyId: leg.serviceJourney?.id ?? null,
        date: leg.fromEstimatedCall?.date ?? null,
        fromPosition: leg.fromEstimatedCall?.stopPositionInPattern ?? null,
        toPosition: leg.toEstimatedCall?.stopPositionInPattern ?? null,
        geometry: leg.pointsOnLink?.points ?? null,
        stops: leg.intermediateQuays ?? [],
        situations: parseSituations(leg.situations),
        aimedStart: leg.serviceJourney
          ? new Date(leg.aimedStartTime).getTime()
          : null,
        aimedEnd: leg.serviceJourney
          ? new Date(leg.aimedEndTime).getTime()
          : null,
      };
    });
    return {
      pattern: {
        legs,
        start: new Date(pattern.expectedStartTime).getTime(),
        end: new Date(pattern.expectedEndTime).getTime(),
      },
      cityBikeRacks,
      isCancelled,
      isAllowed,
    };
  });
}

/** The city bike racks with an electric bike in them right now */
async function fetchElectricRacks(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { stations } = await enturGraphql<{
    stations: {
      id: string;
      vehicleTypesAvailable:
        { count: number; vehicleType: { propulsionType: string } }[] | null;
    }[];
  }>(
    MOBILITY_URL,
    `query Racks($ids: [String!]) {
      stations(ids: $ids) {
        id
        vehicleTypesAvailable { count vehicleType { propulsionType } }
      }
    }`,
    { ids },
    5_000,
  );
  return new Set(
    stations
      .filter((station) =>
        (station.vehicleTypesAvailable ?? []).some(
          (type) =>
            type.count > 0 &&
            type.vehicleType.propulsionType.startsWith("ELECTRIC"),
        ),
      )
      .map((station) => station.id),
  );
}

/** A leg on a bus, a tram or a train, which runs to a timetable */
export const isTransit = (leg: TripLeg) => leg.journeyId !== null;

/**
 * What tells two ways to get there apart: the buses, and where to get on
 * and off them. The same route found again later has the same signature.
 */
export function patternSignature(pattern: TripPattern) {
  const transit = pattern.legs.filter(isTransit);
  if (transit.length === 0) {
    return pattern.legs
      .map((leg) => (leg.rented ? `${leg.mode}:${leg.network}` : leg.mode))
      .join(">");
  }
  return pattern.legs
    .filter((leg) => isTransit(leg) || leg.rented)
    .map((leg) =>
      isTransit(leg)
        ? `${leg.journeyId}:${leg.from.quayId}:${leg.to.quayId}`
        : `${leg.mode}:${leg.network}`,
    )
    .join(">");
}

/**
 * The way a route goes, whichever bus of a line it is: the lines, and
 * where to get on and off them. A later bus the same way has the same one.
 */
export function routeKey(pattern: TripPattern) {
  const parts = pattern.legs
    .filter((leg) => isTransit(leg) || leg.rented)
    .map((leg) =>
      isTransit(leg)
        ? `${leg.line}:${leg.from.quayId}:${leg.to.quayId}`
        : `${leg.mode}:${leg.network}`,
    );
  return parts.length > 0 ? parts.join(">") : "walk";
}

/**
 * The ways to get from `from` to `to` when leaving at `when` (or arriving by
 * `when` with `arriveBy: true`). With `useRentals`, electric scooters and
 * bikes are tried as well, for all or part of the way.
 */
export async function planTrip(
  from: TripOrigin,
  to: Coordinates & { name: string },
  when: number,
  useRentals: boolean,
  options: PlanTripOptions = {},
): Promise<TripPattern[]> {
  const rentals: (Rental | null)[] = useRentals
    ? [null, "scooter_rental", "bike_rental"]
    : [null];
  const results = await Promise.all(
    rentals.map((rental) =>
      fetchPatterns(from, to, when, rental, options).catch((error) => {
        // Buses and walking are needed, the rest is extra
        if (rental === null) throw error;
        return [];
      }),
    ),
  );
  let candidates = results
    .flat()
    .filter((candidate) => candidate.isAllowed && !candidate.isCancelled);

  const racks = [...new Set(candidates.flatMap((c) => c.cityBikeRacks))];
  if (racks.length > 0) {
    // Not known is taken as not electric
    const electric = await fetchElectricRacks(racks).catch(
      () => new Set<string>(),
    );
    candidates = candidates.filter((candidate) =>
      candidate.cityBikeRacks.every((rack) => electric.has(rack)),
    );
  }

  const seen = new Set<string>();
  const patterns = candidates.map((candidate) => candidate.pattern);
  if (options.arriveBy) {
    patterns.sort((a, b) => {
      const aOnTime = a.end <= when + 60_000;
      const bOnTime = b.end <= when + 60_000;
      if (aOnTime !== bOnTime) return aOnTime ? -1 : 1;
      if (aOnTime) {
        // Leave as late as possible while arriving on time
        return (
          b.start - a.start ||
          a.legs.filter(isTransit).length - b.legs.filter(isTransit).length ||
          a.end - b.end
        );
      }
      return (
        a.end - b.end ||
        a.legs.filter(isTransit).length - b.legs.filter(isTransit).length ||
        b.start - a.start
      );
    });
  } else {
    patterns.sort(
      (a, b) =>
        a.end - b.end ||
        a.legs.filter(isTransit).length - b.legs.filter(isTransit).length ||
        b.start - a.start,
    );
  }

  const unique = patterns.filter((pattern) => {
    const signature = patternSignature(pattern);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
  return options.preferTransit ? preferTransit(unique) : unique;
}

/** How far a route walks, in metres, not counting rides on rented ones */
export const walkingMetres = (pattern: TripPattern) =>
  pattern.legs
    .filter((leg) => !isTransit(leg) && !leg.rented)
    .reduce((sum, leg) => sum + leg.distance, 0);

/**
 * The routes that go mostly by bus: not walking all the way, and not walking
 * a lot more than the one that walks least. All of them when none do.
 */
export function preferTransit(patterns: TripPattern[]) {
  const withTransit = patterns.filter((pattern) =>
    pattern.legs.some(isTransit),
  );
  if (withTransit.length === 0) return patterns;
  const least = Math.min(...withTransit.map(walkingMetres));
  return withTransit.filter((pattern) => {
    const walked = walkingMetres(pattern);
    return (
      walked <= PREFER_TRANSIT_WALK_M ||
      walked <= least + PREFER_TRANSIT_EXTRA_WALK_M
    );
  });
}
