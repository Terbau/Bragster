import { formatClock, metresBetween } from "./bus-utils";
import {
  type ActiveVehicle,
  type BusProgress,
  busStatusText,
  getBusProgress,
  type TripCall,
  type VehiclePosition,
} from "./entur";
import {
  type Coordinates,
  isTransit,
  WALK_SPEED,
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

/** This close to a bus, you may be on it rather than near it */
const BOARDED_BUS_M = 300;
/** A vehicle's position is used for this long to say you're on it */
const BOARDED_BUS_AGE_MS = 30 * 1000;

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
  /** A second time counted down to, like when the bus leaves */
  secondaryCountdownTo: number | null;
  /** Like "Line 10 leaves in" */
  secondaryCountdownLabel: string | null;
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

/** Like "08:15", or "tomorrow 08:15" when it's not today */
export function formatWhen(time: number, now = Date.now()) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  const days = Math.floor((time - day.getTime()) / (24 * 60 * 60 * 1000));
  const clock = formatClock(time);
  return days === 1 ? `tomorrow ${clock}` : clock;
}

/**
 * When to leave to catch the first bus of `plan` from leg `legIndex` on,
 * when it's likely to leave earlier than it shows. Null when it isn't, and
 * `plan.start` is the time.
 */
export function getLeaveBy(plan: TripPattern, legIndex = 0) {
  const legs = plan.legs.slice(legIndex);
  const index = legs.findIndex(isTransit);
  const bus = legs[index];
  if (!bus?.likely) return null;
  const getThere = legs
    .slice(0, index)
    .reduce((sum, leg) => sum + (leg.end - leg.start), 0);
  return { time: bus.likely.time - getThere, bus, likely: bus.likely };
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
 * The bus you're most likely on, from every bus reporting a position near
 * you. Used when you get on another one than the planned bus.
 */
export function findBoardedVehicle(
  vehicles: ActiveVehicle[],
  location: Coordinates,
  now: number,
  options: {
    /** The bus already planned, which isn't another one */
    excludeJourneyId?: string | null;
    maxAgeMs?: number;
    maxDistance?: number;
  } = {},
): { vehicle: ActiveVehicle; distance: number } | null {
  const {
    excludeJourneyId = null,
    maxAgeMs = BOARDED_BUS_AGE_MS,
    maxDistance = BOARDED_BUS_M,
  } = options;
  let best: { vehicle: ActiveVehicle; distance: number } | null = null;
  for (const vehicle of vehicles) {
    if (!vehicle.date) continue;
    if (vehicle.journeyId === excludeJourneyId) continue;
    const age = now - vehicle.updatedAt.getTime();
    if (age > maxAgeMs) continue;
    const distance = metresBetween(location, vehicle);
    // The bus has moved on since its last position was sent
    if (distance > maxDistance + (age / 1000) * 6) continue;
    if (!best || distance < best.distance) best = { vehicle, distance };
  }
  return best;
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
  /**
   * The bus of the leg you're on, or the next bus while walking to it: on
   * its way to you, or to where you get off
   */
  bus: { progress: BusProgress; inSight: boolean } | null;
  hasArrived: boolean;
  /** Why there's no plan, when there isn't */
  problem: string | null;
  /** Whether you've set off for the next bus, see `JourneyState` */
  hasSetOff?: boolean;
  /** Walking pace in m/s */
  walkSpeed?: number;
  /** What past delays say about the bus waited for, like it often looking on time when it isn't */
  historyNote?: string | null;
  now?: number;
}

/** What to do now */
export function getStep(input: StepInput): JourneyStep {
  const none = {
    detail: null,
    line: null,
    countdownTo: null,
    countdownLabel: null,
    secondaryCountdownTo: null,
    secondaryCountdownLabel: null,
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
    const leaveAt = Math.max(
      input.staying.until,
      plan ? (getLeaveBy(plan)?.time ?? plan.start) : 0,
    );
    return {
      ...none,
      kind: "stay",
      headline: `At ${input.staying.name}`,
      detail: plan ? `Leave at ${formatClock(leaveAt)}` : null,
      countdownTo: leaveAt,
      countdownLabel: "Leave in",
      ...secondaryForBus(plan),
    };
  }
  if (input.isWaitingToLeave && plan) {
    const leaveBy = getLeaveBy(plan);
    const leaveAt = leaveBy?.time ?? plan.start;
    const detail = [
      input.scheduled?.mode === "arriveBy"
        ? `To arrive by ${formatClock(input.scheduled.time)}`
        : null,
      leaveBy
        ? `Line ${leaveBy.bus.line} shows ${formatClock(leaveBy.bus.start)}, but often leaves ${formatClock(leaveBy.likely.time)}`
        : describePattern(plan),
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      ...none,
      kind: "scheduled",
      headline: `Leave at ${formatWhen(leaveAt)}`,
      detail,
      countdownTo: leaveAt,
      countdownLabel: "Leave in",
      ...secondaryForBus(plan),
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
      detail:
        [bus ? busStatusText(bus.progress) : null, input.historyNote]
          .filter(Boolean)
          .join(" · ") || null,
      countdownTo: bus?.progress.stop.expectedArrival.getTime() ?? leg.start,
      countdownLabel: "Bus in",
      inSight: bus?.inSight ?? false,
      progress: bus?.progress.segment ?? null,
    };
  }

  const left = location ? remainingMetres(leg, location) : leg.distance;
  const nextBus = plan.legs.slice(input.legIndex + 1).find(isTransit) ?? null;
  const busLeaves = nextBus ? busDeparts(nextBus) : {};
  const likelyNote =
    nextBus?.likely && !leg.rented
      ? ` · shows ${formatClock(nextBus.start)}, often earlier`
      : "";
  if (leg.rented) {
    const vehicle = leg.mode === "bicycle" ? "bike" : "scooter";
    return {
      ...none,
      ...busLeaves,
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
  const headline = `Walk to ${rental ?? placeName(leg.to)}`;
  const now = input.now ?? Date.now();
  const walkSpeed = input.walkSpeed ?? WALK_SPEED;
  const history = input.historyNote ? ` · ${input.historyNote}` : "";
  // How long until you're where it's going: at the bus's stop, or there
  const until = nextBus ? plan.legs.indexOf(nextBus) : plan.legs.length;
  const getThereMs = plan.legs
    .slice(input.legIndex, until)
    .reduce((sum, part, index) => {
      if (index > 0 || part.rented) return sum + (part.end - part.start);
      const metres = input.hasSetOff && location ? left : part.distance;
      return sum + (metres / walkSpeed) * 1000;
    }, 0);

  if (!nextBus) {
    return {
      ...none,
      kind: "walk",
      headline,
      detail: `${formatDistance(left)} to go`,
      countdownTo: now + getThereMs,
      countdownLabel: "There in",
    };
  }
  const departs = busDeparts(nextBus, bus?.progress);
  const leaves = departs.countdownTo;
  // The bar fills from the stop before yours, so it's shown as soon as the
  // bus is there, also while you walk to it.
  const busProgress =
    bus?.progress.status === "approaching" ? bus.progress.segment : null;
  const inSight = bus?.inSight ?? false;
  if (!input.hasSetOff) {
    // Before setting off: when to, to be at the stop when the bus leaves
    const startAt = leaves - getThereMs;
    return {
      ...none,
      kind: "walk",
      headline,
      detail: `${formatDistance(left)} · leave by ${formatClock(startAt)}${likelyNote}${history}`,
      countdownTo: startAt,
      countdownLabel: "Start walking in",
      secondaryCountdownTo: leaves,
      secondaryCountdownLabel: departs.countdownLabel,
      inSight,
      progress: busProgress,
    };
  }
  const atStop = now + getThereMs;
  return {
    ...none,
    kind: "walk",
    headline,
    detail: `${formatDistance(left)} to go${atStop > leaves + 30_000 ? " · the bus may leave first" : ""}${likelyNote}${history}`,
    countdownTo: atStop,
    countdownLabel: "At the stop in",
    secondaryCountdownTo: leaves,
    secondaryCountdownLabel: departs.countdownLabel,
    inSight,
    progress: busProgress,
  };
}

/**
 * When the bus leaves, to count down to: when it likely does, when that's
 * earlier than it shows
 */
function busDeparts(bus: TripLeg, progress?: BusProgress | null) {
  if (bus.likely) {
    return {
      countdownTo: bus.likely.time,
      countdownLabel: `Line ${bus.line} likely leaves in`,
    };
  }
  // Live times are fresher than the route's copy, which is only updated when
  // the route is planned again.
  const live =
    progress &&
    progress.realtime &&
    progress.status !== "departed" &&
    progress.status !== "cancelled"
      ? progress.stop.expectedArrival.getTime()
      : null;
  return {
    countdownTo: live ?? bus.start,
    countdownLabel: `Line ${bus.line} leaves in`,
  };
}

/** The first bus of a route, counted down to next to when to leave */
function secondaryForBus(plan: TripPattern | null) {
  const bus = plan?.legs.find(isTransit);
  if (!bus) return {};
  const { countdownTo, countdownLabel } = busDeparts(bus);
  return {
    secondaryCountdownTo: countdownTo,
    secondaryCountdownLabel: countdownLabel,
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
