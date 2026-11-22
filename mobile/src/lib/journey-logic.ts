import { formatClock, metresBetween } from "./bus-utils";
import {
  type BusProgress,
  busStatusText,
  getBusProgress,
  type TripCall,
  type VehiclePosition,
} from "./entur";
import {
  type Coordinates,
  isTransit,
  type TripLeg,
  type TripPattern,
  type TripPlace,
} from "./trip-planner";

/**
 * The parts of following a trip that only work things out: where you are in
 * the plan, whether it still holds, and what to do now. The fetching and
 * the state are in journey.ts.
 */

export { metresBetween } from "./bus-utils";

/** A bus is still caught when you get to the stop this long after its time */
const CONNECTION_GRACE_MS = 30 * 1000;
/** A walk isn't taken as longer than this many times what was planned */
const MAX_DETOUR = 2;

/** What to do now, shown in the app and on the Lock Screen. Times in ms. */
export interface JourneyStep {
  kind:
    | "walk"
    | "wait"
    | "ride"
    | "rental"
    | "stay"
    | "scheduled"
    | "arrived"
    | "planning";
  /** Like "Walk to Prinsens gate P1" */
  headline: string;
  /** Like "350 m to go" */
  detail: string | null;
  /** The bus to take, like "3" */
  line: string | null;
  /** What's counted down to, like when the bus comes */
  countdownTo: number | null;
  /** Like "Bus in" */
  countdownLabel: string | null;
  /** Whether the bus you're waiting for can be seen from the stop */
  inSight: boolean;
  /** When the progress bar starts and ends filling up */
  progress: { start: number; end: number } | null;
  /** "bicycle" or "scooter" when kind === "rental" */
  vehicleMode: "bicycle" | "scooter" | null;
}

/** Like "350 m" or "1.2 km" */
export function formatDistance(metres: number) {
  if (metres < 1000) return `${Math.max(10, Math.round(metres / 10) * 10)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Like "Prinsens gate P1" */
export const placeName = (place: TripPlace) =>
  place.platform ? `${place.name} ${place.platform}` : place.name;

/**
 * How much of a walk or a ride is left from where you are, 0-`MAX_DETOUR`.
 * The road is longer than the straight line by as much as it was planned to
 * be.
 */
function remainingFraction(leg: TripLeg, location: Coordinates) {
  const whole = Math.max(30, metresBetween(leg.from, leg.to));
  return Math.min(MAX_DETOUR, metresBetween(location, leg.to) / whole);
}

/** How many metres of a walk or a ride are left from where you are */
export const remainingMetres = (leg: TripLeg, location: Coordinates) =>
  leg.distance * remainingFraction(leg, location);

/**
 * When the bus is known to have left the stop at `position`, in ms since
 * 1970: when it left it, or else when it was at a stop after it, which is
 * later. Null when it's only known from its GPS, or guessed from the
 * timetable.
 */
export function getDepartedAt(
  calls: TripCall[],
  position: number,
): number | null {
  const times = calls.flatMap((call) => {
    if (call.position < position) return [];
    if (call.position === position) {
      return call.actualDeparture ? [call.actualDeparture.getTime()] : [];
    }
    return [call.actualArrival, call.actualDeparture].flatMap((time) =>
      time ? [time.getTime()] : [],
    );
  });
  return times.length > 0 ? Math.min(...times) : null;
}

/** When a bus really leaves the stop you get on at, and gets to yours */
export interface LiveTimes {
  depart: number;
  arrive: number;
  cancelled: boolean;
}

export function getLiveTimes(
  leg: TripLeg,
  calls: TripCall[],
): LiveTimes | null {
  const from = calls.find((call) => call.position === leg.fromPosition);
  const to = calls.find((call) => call.position === leg.toPosition);
  if (!from || !to) return null;
  return {
    depart: (from.actualDeparture ?? from.expectedDeparture).getTime(),
    arrive: (to.actualArrival ?? to.expectedArrival).getTime(),
    cancelled: from.cancelled || to.cancelled,
  };
}

/**
 * The rest of a plan from where you are now, with the buses' real times.
 * `broken` says why it no longer works, like when a bus is cancelled or
 * leaves before you can get to it.
 */
export function estimatePlan(
  plan: TripPattern,
  legIndex: number,
  isRiding: boolean,
  location: Coordinates | null,
  now: number,
  getTimes: (leg: TripLeg) => LiveTimes | null,
): { pattern: TripPattern; broken: string | null } {
  let time = now;
  let broken: string | null = null;
  const legs = plan.legs.slice(legIndex).map((leg, index): TripLeg => {
    const isCurrent = index === 0;
    if (isTransit(leg)) {
      const times = getTimes(leg);
      const depart = times?.depart ?? leg.start;
      const arrive = times?.arrive ?? leg.end;
      const isOnIt = isCurrent && isRiding;
      if (times?.cancelled) {
        broken ??= `Line ${leg.line} is cancelled`;
      } else if (
        !isOnIt &&
        // At the stop of the bus you're waiting for, it's seen leaving instead
        !isCurrent &&
        time > depart + CONNECTION_GRACE_MS
      ) {
        broken ??= `You won’t make line ${leg.line} from ${leg.from.name}`;
      }
      time = Math.max(arrive, isOnIt ? now : depart);
      return { ...leg, start: isOnIt ? leg.start : depart, end: time };
    }
    const planned = leg.end - leg.start;
    const duration =
      isCurrent && location
        ? planned * remainingFraction(leg, location)
        : planned;
    const start = time;
    time += duration;
    return { ...leg, start, end: time };
  });
  return {
    pattern: { legs, start: legs[0]?.start ?? now, end: time },
    broken,
  };
}

/**
 * The stop the bus you're on gets to next, where you can first get off, and
 * when it's there. Null at the end of the line.
 */
export function getNextStop(
  ride: TripLeg,
  calls: TripCall[],
  vehicle: VehiclePosition | null,
  now: number,
) {
  if (ride.toPosition === null || ride.fromPosition === null) return null;
  const progress = getBusProgress(calls, ride.toPosition, vehicle, now);
  const passed = Math.max(
    progress?.lastPassed?.position ?? ride.fromPosition,
    ride.fromPosition,
  );
  const call = calls.find((candidate) => candidate.position > passed);
  if (!call || call.latitude === null || call.longitude === null) return null;
  return { call, time: Math.max(now, call.expectedArrival.getTime()) };
}

/**
 * A way onwards from the next stop of the bus you're on, as a whole plan
 * that starts with the ride you're on. Staying on the bus is the same ride,
 * to further along.
 */
export function withRide(
  ride: TripLeg,
  onwards: TripPattern,
  next: NonNullable<ReturnType<typeof getNextStop>>,
  calls?: TripCall[] | null,
): TripPattern {
  const [first, ...rest] = onwards.legs;
  if (first && first.journeyId === ride.journeyId) {
    return {
      ...onwards,
      start: ride.start,
      legs: [
        {
          ...first,
          from: ride.from,
          start: ride.start,
          fromPosition: ride.fromPosition,
          distance: first.distance,
        },
        ...rest,
      ],
    };
  }
  const extendedPastOriginal =
    ride.toPosition !== null && next.call.position > ride.toPosition;
  const intermediateStops =
    extendedPastOriginal && calls && ride.fromPosition !== null
      ? calls
          .filter(
            (call) =>
              call.position > ride.fromPosition! &&
              call.position < next.call.position &&
              call.latitude !== null &&
              call.longitude !== null,
          )
          .map((call) => ({
            name: call.name,
            latitude: call.latitude!,
            longitude: call.longitude!,
          }))
      : ride.stops;
  return {
    ...onwards,
    start: ride.start,
    legs: [
      {
        ...ride,
        to: {
          name: next.call.name,
          latitude: next.call.latitude ?? ride.to.latitude,
          longitude: next.call.longitude ?? ride.to.longitude,
          quayId: next.call.quayId,
          platform: next.call.platform ?? null,
        },
        toPosition: next.call.position,
        end: next.time,
        // Drop stale geometry when extended past the original alighting stop
        // so the map draws through the actual new stop instead of stopping short
        geometry: extendedPastOriginal ? null : ride.geometry,
        stops: intermediateStops,
      },
      ...onwards.legs,
    ],
  };
}

/** What `getStep` goes by */
export interface StepInput {
  /** Where the trip ends */
  destination: string;
  plan: TripPattern | null;
  legIndex: number;
  isRiding: boolean;
  location: Coordinates | null;
  /** The stop on the way you're at, and when it's time to go */
  staying: { name: string; until: number } | null;
  /** Future scheduled departure / arrival target, while still waiting to leave */
  scheduled?: { mode: "leaveAt" | "arriveBy"; time: number } | null;
  isWaitingToLeave?: boolean;
  /** The bus of the leg you're on: on its way to you, or to where you get off */
  bus: { progress: BusProgress; inSight: boolean } | null;
  hasArrived: boolean;
  /** Why there's no plan, when there isn't */
  problem: string | null;
}

/** What to do now */
export function getStep(input: StepInput): JourneyStep {
  const none = {
    detail: null,
    line: null,
    countdownTo: null,
    countdownLabel: null,
    inSight: false,
    progress: null,
    vehicleMode: null,
  };
  const { plan, location, bus } = input;
  if (input.hasArrived) {
    return {
      ...none,
      kind: "arrived",
      headline: `You’re at ${input.destination}`,
    };
  }
  if (input.staying) {
    // Time to go when the walk to the next bus starts
    const leaveAt = Math.max(input.staying.until, plan?.start ?? 0);
    return {
      ...none,
      kind: "stay",
      headline: `At ${input.staying.name}`,
      detail: plan ? `Leave at ${formatClock(leaveAt)}` : null,
      countdownTo: leaveAt,
      countdownLabel: "Leave in",
    };
  }
  if (input.isWaitingToLeave && plan) {
    const detail =
      input.scheduled?.mode === "arriveBy"
        ? `To arrive by ${formatClock(input.scheduled.time)} · ${describePattern(plan)}`
        : describePattern(plan);
    return {
      ...none,
      kind: "scheduled",
      headline: `Leave at ${formatClock(plan.start)}`,
      detail,
      countdownTo: plan.start,
      countdownLabel: "Leave in",
    };
  }
  const leg = plan?.legs[input.legIndex];
  if (!plan || !leg) {
    return {
      ...none,
      kind: "planning",
      headline:
        input.problem ??
        (location ? "Finding the best route" : "Finding where you are"),
    };
  }

  if (isTransit(leg)) {
    const base = { ...none, line: leg.line };
    if (input.isRiding) {
      const stopsLeft = bus?.progress.stopsAway ?? null;
      const arrive = bus?.progress.stop.expectedArrival.getTime() ?? leg.end;
      const isHere = bus?.progress.status === "here";
      return {
        ...base,
        kind: "ride",
        headline: isHere
          ? `Get off now at ${placeName(leg.to)}`
          : `Get off at ${placeName(leg.to)}`,
        detail: isHere
          ? "At your stop"
          : stopsLeft === null
            ? null
            : stopsLeft <= 1
              ? "It’s the next stop"
              : `${stopsLeft} stops left`,
        countdownTo: arrive,
        countdownLabel: "Get off in",
        progress: { start: Math.min(leg.start, arrive), end: arrive },
      };
    }
    return {
      ...base,
      kind: "wait",
      headline: `${leg.headsign ?? `Line ${leg.line}`} from ${placeName(leg.from)}`,
      detail: bus ? busStatusText(bus.progress) : null,
      countdownTo: bus?.progress.stop.expectedArrival.getTime() ?? leg.start,
      countdownLabel: "Bus in",
      inSight: bus?.inSight ?? false,
      progress: bus?.progress.segment ?? null,
    };
  }

  const left = location ? remainingMetres(leg, location) : leg.distance;
  const nextBus = plan.legs.slice(input.legIndex + 1).find(isTransit);
  const leaves = nextBus
    ? { countdownTo: nextBus.start, countdownLabel: `Line ${nextBus.line} in` }
    : {};
  if (leg.rented) {
    const vehicle = leg.mode === "bicycle" ? "bike" : "scooter";
    return {
      ...none,
      ...leaves,
      kind: "rental",
      vehicleMode: leg.mode === "bicycle" ? "bicycle" : "scooter",
      headline:
        `Ride the ${leg.network ?? ""} ${vehicle} to ${placeName(leg.to)}`.replace(
          /\s+/g,
          " ",
        ),
      detail: `${formatDistance(left)} to go`,
    };
  }
  // A walk to a scooter is followed by the ride on it
  const next = plan.legs[input.legIndex + 1];
  const rental = next?.rented
    ? `the ${next.network ?? ""} ${next.mode === "bicycle" ? "bike" : "scooter"}`.replace(
        /\s+/g,
        " ",
      )
    : null;
  return {
    ...none,
    ...leaves,
    kind: "walk",
    headline: `Walk to ${rental ?? placeName(leg.to)}`,
    detail: `${formatDistance(left)} to go`,
  };
}

/** Like "Line 18 to Haugnessvingen" or "Walk to Studentersamfundet 2" */
export function describeLeg(leg: TripLeg) {
  if (isTransit(leg)) return `Line ${leg.line} to ${placeName(leg.to)}`;
  if (leg.rented) {
    const vehicle = leg.mode === "bicycle" ? "bike" : "scooter";
    return `${leg.network ?? "Rented"} ${vehicle} to ${placeName(leg.to)}`;
  }
  return `Walk to ${placeName(leg.to)}`;
}

/** Like "Line 10 from Hesthagen, then Ryde scooter", to tell routes apart */
export function describePattern(pattern: TripPattern) {
  const parts = pattern.legs
    .filter((leg) => isTransit(leg) || leg.rented)
    .map((leg) =>
      isTransit(leg)
        ? `line ${leg.line} from ${leg.from.name}`
        : `${leg.network ?? "rented"} ${leg.mode === "bicycle" ? "bike" : "scooter"}`,
    );
  if (parts.length === 0) return "Walk all the way";
  const text = parts.join(", then ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
