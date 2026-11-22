import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import {
  type BackgroundPermission,
  BusLiveActivity,
  type DeviceLocation,
  type JourneyAction,
  type JourneyLiveActivityState,
} from "../../modules/bus-live-activity";
import {
  addJourneyHistory,
  getAlertPreferences,
  getWalkSpeed,
  recordWalkSample,
  updateHistoryReport,
} from "./bus-preferences";
import {
  type BusProgress,
  fetchTrip,
  fetchVehicle,
  getBusProgress,
  type TripCall,
  type VehiclePosition,
} from "./entur";
import {
  type Flexible,
  type FlexibleOption,
  rankOptions,
} from "./flexible-stop";
import {
  describePattern,
  estimatePlan,
  getDepartedAt,
  getLiveTimes,
  getNextStop,
  getStep,
  type JourneyStep,
  metresBetween,
  placeName,
  withRide,
} from "./journey-logic";
import {
  type Baseline,
  buildReport,
  describeActivity,
  formatDuration,
  type JourneyActivity,
  type JourneyChange,
  type JourneyReport,
  recordActivity,
} from "./journey-report";
import { setKeepAlive } from "./keep-alive";
import {
  getCurrentTrackedLocation,
  getLocationPermission,
  requestLocationPermission,
  setLocationLowPower,
  setLocationTracking,
} from "./location";
import { addRecentPlace, type Place } from "./places";
import { getDistanceToStop, type Sightline } from "./sightline";
import { getSightline, sightlineKey } from "./sightline-store";
import {
  type Coordinates,
  isTransit,
  patternSignature,
  planTrip,
  routeKey,
  type TripLeg,
  type TripOrigin,
  type TripPattern,
} from "./trip-planner";

const JOURNEY_KEY = "bragster.journey";
/** The last trip you got to the end of, with its report */
const LAST_JOURNEY_KEY = "bragster.journey.last";
/** How long the report of a trip can be opened again */
const REPORT_AGE_MS = 12 * 60 * 60 * 1000;

/** How often it's checked where you and the bus are */
const TICK_MS = 4 * 1000;
/** How often a better route is looked for, when nothing has happened */
const REPLAN_MS = 30 * 1000;
/** Slower replan interval while staying at a long stopover or waiting to leave */
const IDLE_REPLAN_MS = 2 * 60 * 1000;
/** Threshold before switching back to high-accuracy GPS / normal replan */
const IDLE_WAKE_BEFORE_MS = 10 * 60 * 1000;
/** How many other ways to the next place are shown */
const MAX_ALTERNATIVES = 3;
/** Another route is only suggested when it gets you there this much earlier */
const SUGGEST_MS = 2 * 60 * 1000;
/** How long before the bus you're on is at its next stop it's planned from */
const RIDE_MARGIN_MS = 30 * 1000;
/** A trip that hasn't got there after this long is forgotten, with its stays */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;
const getMaxAge = (journey: Journey) =>
  MAX_AGE_MS +
  journey.stopovers.reduce((sum, stopover) => sum + stopover.minutes, 0) *
    60 *
    1000 +
  (journey.schedule
    ? Math.max(0, journey.schedule.time - journey.startedAt)
    : 0);
/** How long it's said why the route was changed */
const NOTICE_MS = 2 * 60 * 1000;
/** How long the Lock Screen keeps showing that you're there */
const ARRIVED_DISMISS_S = 2 * 60;

/** Ignore coarse GPS fixes worse than this for automatic state transitions */
const MAX_ACCURACY_M = 65;
/** This close, you're there */
const ARRIVED_M = 60;
/** This close to the end of a walk, it's done */
const LEG_DONE_M = 40;
/** This far from a stop on the way, you've left it */
const LEFT_M = 150;
/**
 * A stop on the way can be marked as done this close to it, also before
 * it has been noticed you got there, as the GPS is poor inside shops
 */
const NEAR_M = 250;
/** Leaving this much before the time is up is leaving early */
const EARLY_MS = 60 * 1000;
/** This far from the stop after the bus has left it, you may be on it */
const BOARDED_M = 60;
/** This close to the bus, you're on it. Its position is some seconds old. */
const ON_BUS_M = 300;
/** How often a flexible stop you're on your way to is picked again */
const REPICK_MS = 5 * 60 * 1000;
/** This close to the one picked, it's not picked again */
const PICKED_NEAR_M = 400;
/** This far from the bus, you're not on it any more */
const OFF_BUS_M = 400;
/** How far from the bus while it is stopped at leg.to counts as having alighted */
const ALIGHTED_FROM_BUS_M = 90;
/** How many checks in a row it takes to say you missed or left the bus */
const SURE_TICKS = 5;
/**
 * How long after the bus left the stop you're still there before it has
 * left without you. A bus you're on takes some seconds to get away from the
 * stop, and the GPS is a little behind.
 */
const LEFT_SURE_MS = 20 * 1000;
/** How many checks in a row the bus has to be gone, after that */
const LEFT_SURE_TICKS = 2;
/** The bus's GPS is only trusted to say you're not on it when this new */
const FRESH_BUS_MS = 20 * 1000;
/**
 * How long before the bus leaves its stop it's followed while you walk
 * there, so it's noticed right away if it leaves before you get there
 */
const WATCH_AHEAD_MS = 10 * 60 * 1000;
/** Proactive alert window before leaving a stopover or scheduled start */
const LEAVE_SOON_MS = 2 * 60 * 1000;

/** Future departure / arrival target */
export interface JourneySchedule {
  mode: "leaveAt" | "arriveBy";
  /** Target timestamp in ms */
  time: number;
}

/** Stopover draft passed when creating a trip with stops upfront */
export interface DraftStopover {
  place: Place;
  minutes: number;
  flexible?: {
    query: string;
    label: string;
    options: FlexibleOption[];
  } | null;
}

/** A stop on the way, to stay at for a while */
export interface Stopover {
  id: string;
  place: Place;
  /** How long to stay */
  minutes: number;
  /** Set when you get there */
  arrivedAt: number | null;
  /** Set when you've left it, or the time is up */
  done: boolean;
  /** When you left it, or said you were done there */
  leftAt?: number | null;
  /**
   * Set when it's any of a kind, like "a Rema 1000": `place` is then the
   * one picked, the one that gets you on soonest. Picked again on the way.
   */
  flexible?: Flexible | null;
}

export interface Journey {
  id: string;
  destination: Place;
  /** In the order they're gone to, before the destination */
  stopovers: Stopover[];
  /** Whether electric scooters and bikes are used. Off unless turned on. */
  useRentals: boolean;
  /** Optional "leave at" / "arrive by" schedule until departure begins */
  schedule?: JourneySchedule | null;
  /** Where the trip started, used to detect early departure on scheduled trips */
  origin?: Coordinates | null;
  startedAt: number;
  arrivedAt: number | null;
  /** What you've done so far, for the report at the end */
  activities: JourneyActivity[];
  /** What has changed the route on the way */
  changes: JourneyChange[];
  /**
   * The first whole route for the trip as it is now, to compare with at the
   * end. Null until it's found, and again when the trip is changed.
   */
  baseline: Baseline | null;
}

/** A part of the trip after the one you're on, from a stop on the way */
export interface LaterPart {
  from: Place;
  to: Place;
  /** How long is stayed at `from` before it */
  minutes: number;
  /** The stop on the way `from` is */
  stopoverId: string | null;
  /** Null when no route was found */
  pattern: TripPattern | null;
}

export interface JourneyState {
  journey: Journey | null;
  /** Where the phone is, null before the GPS has found it */
  location: DeviceLocation | null;
  /** Null until it's been asked for */
  permission: BackgroundPermission | null;
  /** The route to the next place: a stop on the way, or the destination */
  plan: TripPattern | null;
  /** Which of its legs you're on */
  legIndex: number;
  /** Whether you're on the bus of that leg, and not waiting for it */
  isRiding: boolean;
  /** The bus of that leg, on its way to your stop or to where you get off */
  bus: { progress: BusProgress; inSight: boolean } | null;
  /** Live GPS position of the active transit leg's vehicle, for RouteMap */
  vehicle: VehiclePosition | null;
  /** Sightline for the current wait stop, for RouteMap */
  sightline: Sightline | null;
  /** True while waiting for a future "leave at" / "arrive by" departure time */
  isWaitingToLeave: boolean;
  /** The parts after the next place */
  later: LaterPart[];
  /** When you're at the destination, with every stop on the way */
  arrival: number | null;
  /** A route that gets you to the next place earlier, to switch to */
  suggestion: { pattern: TripPattern; savesMs: number } | null;
  /** Other ways to the next place, the one that gets there first first */
  alternatives: TripPattern[];
  /** Why the route was changed without asking, like a missed bus */
  notice: string | null;
  /** What to do now */
  step: JourneyStep | null;
  /** How it went, once you're there */
  report: JourneyReport | null;
  /** True right after arrival while fetching actual bus times for the report */
  isBuildingReport: boolean;
  /** True when user manually refreshes a non-final trip report */
  isRefreshingReport: boolean;
  isPlanning: boolean;
  error: string | null;
  /** Whether it's on the Lock Screen. False once it's been swiped away. */
  isShowing: boolean;
}

const EMPTY: JourneyState = {
  journey: null,
  location: null,
  permission: null,
  plan: null,
  legIndex: 0,
  isRiding: false,
  bus: null,
  vehicle: null,
  sightline: null,
  isWaitingToLeave: false,
  later: [],
  arrival: null,
  suggestion: null,
  alternatives: [],
  notice: null,
  step: null,
  report: null,
  isBuildingReport: false,
  isRefreshingReport: false,
  isPlanning: false,
  error: null,
  isShowing: false,
};

let state = EMPTY;
const listeners = new Set<() => void>();

function setState(next: Partial<JourneyState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

// What's kept between checks, but not shown
let needsPlan = false;
/** What was last said about a changed route, and when it was first seen */
let noticeSeen: { notice: string; at: number } | null = null;
let lastPlannedAt = 0;
/** How many checks in a row the bus has been gone, or you've been off it */
let unsureTicks = 0;
/** When the bus you were waiting for was first seen to have left */
let departedSeenAt: number | null = null;
/**
 * What happened that you have to do something about, like a bus that left
 * without you. Said with a sound on the Lock Screen once the new route is
 * found, see updateStep.
 */
let pendingAlert: { text: string; at: number; body?: string } | null = null;
/** The last of them, which the Live Activity shows bigger while it's said */
let alerted: { text: string; at: number } | null = null;
/** Keys of proactive reminders already sent so they don't repeat */
const sentReminders = new Set<string>();
/** Whether GPS is currently in low-power mode */
let isLowPowerGps = false;
/** The route that was suggested and turned down, so it isn't again */
let dismissed: string | null = null;
/** Why the next route is another, like being done early at a shop */
let switchReason: string | null = null;
/**
 * The bus you're on while there's no plan, like after staying on past your
 * stop, so the next one is planned from the stops it gets to
 */
let rideOn: TripLeg | null = null;
/** Whether the next flexible stop is to be picked again, like after a change */
let needsRepick = false;
let isRepicking = false;
/** The stops of the buses in the plan, with their real times */
const callsByJourney = new Map<string, TripCall[]>();
let vehicle: VehiclePosition | null = null;
/** How far away the bus is seen from the stops waited at. Null: none. */
const sightlines = new Map<string, Sightline | null | "working">();
/** Routes for the later parts, by where from, where to and when */
const laterCache = new Map<string, TripPattern | null>();

function resetProgress() {
  unsureTicks = 0;
  departedSeenAt = null;
  vehicle = null;
}

const isAccurate = (location: DeviceLocation) =>
  location.accuracy <= MAX_ACCURACY_M;

/**
 * Says `text` with a sound and a buzz on the Lock Screen, and in the
 * Dynamic Island, at the next update. Not again for the same thing.
 */
function alertAbout(text: string, body?: string) {
  if (alerted?.text === text && Date.now() - alerted.at < NOTICE_MS) return;
  pendingAlert = { text, at: Date.now(), body };
}

/** Not waited for longer than this for the new route, to say it */
const ALERT_WAIT_MS = 15 * 1000;

async function saveJourney(journey: Journey | null) {
  await (journey
    ? AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(journey))
    : AsyncStorage.removeItem(JOURNEY_KEY)
  ).catch(() => {});
}

function updateJourney(change: Partial<Journey>) {
  if (!state.journey) return;
  const journey = { ...state.journey, ...change };
  setState({ journey });
  void saveJourney(journey);
}

/**
 * Where you're going next, and from where. While you're at a stop on the
 * way, it's planned from there, for when the time is up.
 */
function getTarget(journey: Journey) {
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  const staying = left[0]?.arrivedAt != null ? left[0] : null;
  const ahead = staying ? left.slice(1) : left;
  return {
    staying,
    /** The stop on the way that's next, null when it's the destination */
    stopover: ahead[0] ?? null,
    place: ahead[0]?.place ?? journey.destination,
    /** The places after it, in order */
    after: [...ahead.slice(1).map((s) => s.place), journey.destination].slice(
      ahead[0] ? 0 : 1,
    ),
    afterMinutes: ahead.map((stopover) => stopover.minutes),
    /** The stops on the way the parts after it start from */
    afterIds: ahead.map((stopover) => stopover.id),
  };
}

const stayingUntil = (stopover: Stopover) =>
  (stopover.arrivedAt ?? 0) + stopover.minutes * 60 * 1000;

function toActivityState(
  step: JourneyStep,
  journey: Journey,
): JourneyLiveActivityState {
  const { suggestion, notice, arrival } = state;
  const finishable = getFinishableStopover(journey, state.location);
  return {
    step: step.kind,
    headline: step.headline,
    detail: step.detail,
    line: step.line,
    countdownTo: step.countdownTo ? step.countdownTo / 1000 : null,
    countdownLabel: step.countdownLabel,
    destination: journey.destination.name,
    arrival: arrival ? arrival / 1000 : null,
    inSight: step.inSight,
    progressStart: step.progress ? step.progress.start / 1000 : null,
    progressEnd: step.progress ? step.progress.end / 1000 : null,
    notice: suggestion
      ? `${Math.round(suggestion.savesMs / 60000)} min faster route found`
      : notice,
    urgent: !suggestion && notice !== null && notice === alerted?.text,
    vehicleMode: step.vehicleMode,
    canSwitch: suggestion !== null,
    canFinishStopover: finishable !== null && !suggestion,
  };
}

/** Works out what to do now, and puts it on the Lock Screen */
async function updateStep() {
  const { journey } = state;
  if (!journey) return;
  const { staying } = getTarget(journey);
  const step = getStep({
    destination: journey.destination.name,
    plan: state.plan,
    legIndex: state.legIndex,
    isRiding: state.isRiding,
    location: state.location,
    staying: staying
      ? { name: staying.place.name, until: stayingUntil(staying) }
      : null,
    scheduled: journey.schedule ?? null,
    isWaitingToLeave: state.isWaitingToLeave,
    bus: state.bus,
    hasArrived: journey.arrivedAt !== null,
    problem:
      state.error ??
      (state.permission === "denied"
        ? "Allow location to plan from where you are"
        : null),
  });
  setState({ step });
  if (journey.arrivedAt === null && state.location && !state.isWaitingToLeave) {
    const leg = state.plan?.legs[state.legIndex];
    const doing = staying
      ? ({
          kind: "stay",
          line: null,
          text: `At ${staying.place.name}`,
        } as const)
      : leg
        ? describeActivity(leg, state.isRiding)
        : null;
    if (doing) {
      const activities = recordActivity(journey.activities, doing, Date.now());
      const next = { ...journey, activities };
      setState({ journey: next });
      // Only kept on the phone when something new is started
      if (activities.length !== journey.activities.length) {
        void saveJourney(next);
      }
    }
  }
  // Once there's a new route to say, or none is found (or proactive alert with custom body)
  const isRouteKnown = !state.isPlanning && (state.plan || state.error);
  const alert =
    pendingAlert &&
    (pendingAlert.body !== undefined ||
      isRouteKnown ||
      Date.now() - pendingAlert.at > ALERT_WAIT_MS)
      ? {
          title: pendingAlert.text,
          body:
            pendingAlert.body ??
            (state.plan
              ? `New route: ${[step.headline, step.detail].filter(Boolean).join(" · ")}`
              : (state.error ?? "Finding a new route")),
        }
      : null;
  if (alert) {
    pendingAlert = null;
    alerted = { text: alert.title, at: Date.now() };
    // On the Lock Screen, it's the Live Activity's sound
    if (AppState.currentState === "active") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }
  if (BusLiveActivity && state.isShowing && journey.arrivedAt === null) {
    const isShowing = await BusLiveActivity.updateJourney(
      journey.id,
      toActivityState(step, journey),
      alert,
    ).catch(() => false);
    if (state.journey?.id === journey.id) setState({ isShowing });
  }
}

function addChange(change: Omit<JourneyChange, "at">) {
  const journey = state.journey;
  if (!journey) return;
  updateJourney({
    changes: [...journey.changes, { ...change, at: Date.now() }],
  });
}

/** The buses and rented rides of a route, and where they're taken */
const rideKeys = (pattern: TripPattern) =>
  pattern.legs
    .filter((leg) => isTransit(leg) || leg.rented)
    .map((leg) =>
      isTransit(leg)
        ? `${leg.journeyId}:${leg.to.quayId}`
        : `${leg.mode}:${leg.network}`,
    );

/**
 * Notes that another route than the first one is taken, for the report at
 * the end. A route with only rides of the first one is still the first one.
 */
function noteSwitch(pattern: TripPattern, reason: string | null) {
  const baseline = state.journey?.baseline;
  if (!baseline) return;
  const known = new Set(
    baseline.parts.flatMap((part) => rideKeys(part.pattern)),
  );
  const keys = rideKeys(pattern);
  // Walking all the way instead of taking its buses is another route too
  const isWalkInstead = keys.length === 0 && known.size > 0;
  if (!isWalkInstead && keys.every((key) => known.has(key))) return;
  const route = describePattern(pattern);
  addChange({
    kind: "switch",
    text: `Switched to ${route.charAt(0).toLowerCase()}${route.slice(1)}`,
    reason,
  });
}

/**
 * Other ways than `chosen` to show, the ones that go another way first, like
 * from another stop or with another line, as they're the ones to choose
 * between. Later buses the same way are only added when there's room.
 */
function pickAlternatives(chosen: TripPattern, others: TripPattern[]) {
  const seen = new Set([routeKey(chosen)]);
  const otherWays: TripPattern[] = [];
  const sameWays: TripPattern[] = [];
  for (const other of others) {
    const key = routeKey(other);
    if (seen.has(key)) {
      sameWays.push(other);
    } else {
      seen.add(key);
      otherWays.push(other);
    }
  }
  return [...otherWays, ...sameWays]
    .slice(0, MAX_ALTERNATIVES)
    .sort((a, b) => a.end - b.end);
}

/** Starts following `pattern`, from its first leg */
function adopt(pattern: TripPattern, isRiding: boolean) {
  const previous = state.plan?.legs[state.legIndex];
  // Already at the stop, the walk to it is done
  let legIndex = 0;
  const { location } = state;
  while (
    !state.isWaitingToLeave &&
    location &&
    isAccurate(location) &&
    legIndex < pattern.legs.length - 1 &&
    !isTransit(pattern.legs[legIndex]) &&
    metresBetween(location, pattern.legs[legIndex].to) < LEG_DONE_M
  ) {
    legIndex++;
  }
  const first = pattern.legs[legIndex];
  const sameJourney = previous?.journeyId === first?.journeyId;
  if (!sameJourney) resetProgress();
  const signature = patternSignature(pattern);
  setState({
    plan: pattern,
    legIndex,
    isRiding,
    suggestion: null,
    alternatives: state.alternatives.filter(
      (other) => patternSignature(other) !== signature,
    ),
    bus: sameJourney ? state.bus : null,
    vehicle: sameJourney ? state.vehicle : null,
    sightline: sameJourney ? state.sightline : null,
  });
}

/** Gets the sightline of the stop a bus is waited for at, once */
function loadSightline(leg: TripLeg, calls: TripCall[]) {
  const { journeyId, fromPosition } = leg;
  const quayId = leg.from.quayId;
  if (!journeyId || fromPosition === null || !quayId) return null;
  const key = sightlineKey(quayId, fromPosition, calls);
  if (!key) return null;
  const known = sightlines.get(key);
  if (known === undefined) {
    sightlines.set(key, "working");
    void getSightline(journeyId, quayId, fromPosition, calls)
      .then((sightline) => sightlines.set(key, sightline))
      // Tried again the next time the stop is waited at
      .catch(() => sightlines.delete(key));
  }
  return known && known !== "working" ? known : null;
}

function isBusInSight(
  sightline: Sightline | null,
  progress: BusProgress,
  bus: VehiclePosition | null,
) {
  const isOnItsWay =
    progress.status === "coming" || progress.status === "approaching";
  if (!sightline || !bus || !isOnItsWay) return false;
  if (progress.stopsAway > sightline.stopsWithin + 1) return false;
  const left = getDistanceToStop(sightline, bus, {
    ageMs: Date.now() - bus.updatedAt.getTime(),
    atStop: bus.atStop,
  });
  return left !== null && left <= sightline.distance;
}

/** Drops the plan, so a new one is found right away, and says why */
function breakPlan(notice: string) {
  alertAbout(notice);
  resetProgress();
  setState({
    plan: null,
    legIndex: 0,
    isRiding: false,
    bus: null,
    vehicle: null,
    sightline: null,
    notice,
  });
  needsPlan = true;
  // Another of a flexible stop may be quicker now
  needsRepick = true;
}

/**
 * Moves on through the plan: walks that are done, the bus you've got on,
 * the stop you've got off at. Also notices a bus that left without you.
 */
async function advance(location: DeviceLocation) {
  const plan = state.plan;
  if (!plan) return;
  let { legIndex } = state;
  const accurate = isAccurate(location);

  while (
    accurate &&
    legIndex < plan.legs.length - 1 &&
    !isTransit(plan.legs[legIndex]) &&
    metresBetween(location, plan.legs[legIndex].to) < LEG_DONE_M
  ) {
    // Record completed walking leg for adaptive walk speed learning
    const finishedLeg = plan.legs[legIndex];
    if (!finishedLeg.rented && state.journey) {
      const walkActivity = state.journey.activities.at(-1);
      if (walkActivity?.kind === "walk") {
        recordWalkSample(
          finishedLeg.distance,
          Date.now() - walkActivity.start,
        );
      }
    }
    legIndex++;
  }
  if (legIndex !== state.legIndex) {
    resetProgress();
    setState({ legIndex, bus: null, vehicle: null, sightline: null });
  }
  const leg = plan.legs[legIndex];
  if (!isTransit(leg)) {
    await watchBusAhead(plan, legIndex, location);
    return;
  }
  if (!leg.journeyId || !leg.date) return;
  if (leg.fromPosition === null || leg.toPosition === null) return;

  const [calls, bus] = await Promise.all([
    fetchTrip(leg.journeyId, leg.date),
    // The stop times are enough without it
    fetchVehicle(leg.journeyId, leg.date).catch(() => null),
  ]);
  // The plan may have changed in the meantime
  if (state.plan !== plan || state.legIndex !== legIndex) return;
  callsByJourney.set(leg.journeyId, calls);
  vehicle = bus;

  if (!state.isRiding) {
    const progress = getBusProgress(calls, leg.fromPosition, bus);
    if (!progress) return;
    if (progress.status === "cancelled") {
      breakPlan(`Line ${leg.line} is cancelled`);
      return;
    }
    if (progress.status === "departed") {
      // On it when you've left the stop along with it. Still at the stop,
      // or somewhere the bus isn't, it left without you. Its GPS can be
      // minutes old, and is only trusted for that when it's new.
      const isBusFresh =
        !!bus && Date.now() - bus.updatedAt.getTime() < FRESH_BUS_MS;
      const farFromStop =
        accurate && metresBetween(location, leg.from) > BOARDED_M;
      const nearBus =
        isBusFresh && bus ? metresBetween(location, bus) < ON_BUS_M : null;
      // When bus GPS is missing, also verify user moved closer to the destination stop
      // rather than walking away in the opposite direction
      const movingTowardDest =
        metresBetween(location, leg.to) <
        metresBetween(leg.from, leg.to) - BOARDED_M / 2;
      const isOnIt =
        farFromStop && (nearBus !== null ? nearBus : movingTowardDest);
      if (isOnIt) {
        unsureTicks = 0;
        setState({
          isRiding: true,
          bus: null,
          vehicle: bus,
          sightline: null,
          notice: null,
        });
        needsPlan = true;
        return;
      }
      // Counted from when it really left, which is often known some seconds
      // after. Only guessed from the timetable, it's waited for longer.
      departedSeenAt ??= Date.now();
      const departedAt =
        getDepartedAt(calls, leg.fromPosition) ?? departedSeenAt;
      const isSure = progress.realtime
        ? ++unsureTicks >= LEFT_SURE_TICKS &&
          Date.now() - departedAt >= LEFT_SURE_MS
        : ++unsureTicks >= SURE_TICKS;
      if (isSure) breakPlan(`Line ${leg.line} left without you`);
      return;
    }
    const sightline = loadSightline(leg, calls);
    setState({
      bus: { progress, inSight: isBusInSight(sightline, progress, bus) },
      vehicle: bus,
      sightline,
    });
    return;
  }

  // On the bus, on the way to where you get off
  const progress = getBusProgress(calls, leg.toPosition, bus);
  if (!progress) return;
  setState({ bus: { progress, inSight: false }, vehicle: bus });

  // Proactive alighting reminder 1 stop before getting off
  if (
    getAlertPreferences().alightSoon &&
    progress.stopsAway === 1 &&
    progress.status !== "here" &&
    progress.status !== "departed"
  ) {
    const reminderKey = `alight:${leg.journeyId}:${leg.toPosition}`;
    if (!sentReminders.has(reminderKey)) {
      sentReminders.add(reminderKey);
      alertAbout(
        `Get off next: ${placeName(leg.to)}`,
        `Line ${leg.line} is approaching ${placeName(leg.to)}`,
      );
    }
  }

  const isTerminus = calls.at(-1)?.position === leg.toPosition;

  if (progress.status === "here") {
    // Only exit riding immediately at the terminus, or once user clearly walked
    // away from the stopped bus; otherwise stay in `isRiding` so "stayed on past
    // your stop" still triggers if the bus departs with you still onboard.
    const walkedAwayFromBus =
      accurate &&
      !!bus &&
      metresBetween(location, bus) > ALIGHTED_FROM_BUS_M &&
      metresBetween(location, leg.to) <= LEFT_M;
    if (isTerminus || walkedAwayFromBus) {
      const isLast = legIndex === plan.legs.length - 1;
      resetProgress();
      setState({
        isRiding: false,
        bus: null,
        vehicle: null,
        legIndex: isLast ? legIndex : legIndex + 1,
      });
      needsPlan = true;
    }
    return;
  }

  if (progress.status === "departed") {
    const isLast = legIndex === plan.legs.length - 1;
    const isBusFresh =
      !!bus && Date.now() - bus.updatedAt.getTime() < FRESH_BUS_MS;
    const stayedOn =
      accurate &&
      metresBetween(location, leg.to) > LEFT_M &&
      (!isBusFresh || !bus || metresBetween(location, bus) < ON_BUS_M);
    if (stayedOn) {
      // Still on it, so it's planned from the stops it gets to next
      alertAbout(`You stayed on past ${leg.to.name}`);
      setState({
        plan: null,
        vehicle: bus,
        notice: `You stayed on past ${leg.to.name}`,
      });
      rideOn = leg;
      needsPlan = true;
      return;
    }
    resetProgress();
    setState({
      isRiding: false,
      bus: null,
      vehicle: null,
      legIndex: isLast ? legIndex : legIndex + 1,
    });
    needsPlan = true;
  } else if (accurate && bus && metresBetween(location, bus) > OFF_BUS_M) {
    if (++unsureTicks >= SURE_TICKS) breakPlan("You got off early");
  } else {
    unsureTicks = 0;
  }
}

/**
 * While you walk to the stop, the bus you're to take from it is followed
 * when it's soon there, so a bus that leaves before you get there, or is
 * cancelled, is noticed right away. Its times also make the plan's guess
 * of whether you make it right.
 */
async function watchBusAhead(
  plan: TripPattern,
  legIndex: number,
  location: DeviceLocation,
) {
  const ahead = plan.legs.slice(legIndex + 1).find(isTransit);
  if (!ahead?.journeyId || !ahead.date || ahead.fromPosition === null) return;
  if (ahead.start - Date.now() > WATCH_AHEAD_MS) return;
  const calls = await fetchTrip(ahead.journeyId, ahead.date);
  // The plan may have changed in the meantime
  if (state.plan !== plan || state.legIndex !== legIndex) return;
  callsByJourney.set(ahead.journeyId, calls);
  const progress = getBusProgress(calls, ahead.fromPosition, null);
  if (progress?.status === "cancelled") {
    breakPlan(`Line ${ahead.line} is cancelled`);
    return;
  }
  // Only when it's known to have left, not guessed from the timetable. Close
  // to the stop you may have got on as the GPS is behind, which is seen
  // once you're at it.
  if (
    progress?.status !== "departed" ||
    !progress.realtime ||
    metresBetween(location, ahead.from) < BOARDED_M
  ) {
    unsureTicks = 0;
    return;
  }
  if (++unsureTicks >= LEFT_SURE_TICKS) {
    breakPlan(`Line ${ahead.line} left before you got to ${ahead.from.name}`);
  }
}

/** The routes for the parts after the next place, one after the other */
async function planLater(
  journey: Journey,
  target: ReturnType<typeof getTarget>,
  arriveAt: number,
) {
  const later: LaterPart[] = [];
  let from = target.place;
  let time = arriveAt;
  const walkSpeed = getWalkSpeed();
  for (const [index, to] of target.after.entries()) {
    const minutes = target.afterMinutes[index] ?? 0;
    time += minutes * 60 * 1000;
    const key = `${from.latitude},${from.longitude}>${to.latitude},${to.longitude}@${Math.round(time / 60000)}/${journey.useRentals}/${walkSpeed}`;
    let pattern = laterCache.get(key);
    if (pattern === undefined) {
      pattern =
        (
          await planTrip(from, to, time, journey.useRentals, {
            walkSpeed,
          }).catch(() => [])
        )[0] ?? null;
      if (laterCache.size > 50) laterCache.clear();
      laterCache.set(key, pattern);
    }
    later.push({
      from,
      to,
      minutes,
      stopoverId: target.afterIds[index] ?? null,
      pattern,
    });
    if (pattern) time = pattern.end;
    from = to;
  }
  return { later, arrival: time };
}

/**
 * Looks for the best route from where you are now, or from the next stop of
 * the bus you're on. The same route as before is kept up to date. A better
 * one is suggested. Without a route that still works, the best one is taken.
 */
async function replan() {
  const { journey, location } = state;
  if (!journey || journey.arrivedAt !== null) return;
  needsPlan = false;
  lastPlannedAt = Date.now();
  const now = Date.now();
  const target = getTarget(journey);
  const plan = state.plan;
  const ride = rideOn ?? (state.isRiding ? plan?.legs[state.legIndex] : null);
  const walkSpeed = getWalkSpeed();

  // Where it's planned from, and when
  let origin: TripOrigin;
  let when = now;
  let arriveBy = false;
  let next: ReturnType<typeof getNextStop> = null;
  let rideCalls: TripCall[] | null = null;
  if (target.staying) {
    origin = target.staying.place;
    when = Math.max(now, stayingUntil(target.staying));
  } else if (ride?.journeyId) {
    rideCalls = callsByJourney.get(ride.journeyId) ?? null;
    next = rideCalls ? getNextStop(ride, rideCalls, vehicle, now) : null;
    if (!next) {
      // At the end of the line, or before its stops are known
      if (!location) return;
      origin = location;
    } else {
      origin = { quayId: next.call.quayId };
      // A little before it's there, so that staying on it is found too
      when = next.time - RIDE_MARGIN_MS;
    }
  } else if (location) {
    origin = location;
    if (journey.schedule && state.isWaitingToLeave) {
      if (journey.schedule.mode === "leaveAt" && journey.schedule.time > now) {
        when = journey.schedule.time;
      } else if (
        journey.schedule.mode === "arriveBy" &&
        journey.schedule.time > now
      ) {
        // Account for any stopover stay durations before final destination
        const stayMs =
          target.afterMinutes.reduce((sum, m) => sum + m, 0) * 60 * 1000;
        when = Math.max(now, journey.schedule.time - stayMs);
        arriveBy = target.after.length === 0;
      }
    }
  } else {
    return;
  }

  setState({ isPlanning: true });
  try {
    let candidates = await planTrip(
      origin,
      target.place,
      when,
      journey.useRentals,
      { walkSpeed, arriveBy },
    );
    if (ride && next) {
      const stop = next;
      candidates = candidates
        // Not the buses that leave the stop before yours gets there
        .filter((pattern) => {
          const first = pattern.legs.find(isTransit);
          return (
            !first ||
            first.journeyId === ride.journeyId ||
            first.start >= stop.time
          );
        })
        .map((pattern) => withRide(ride, pattern, stop, rideCalls));
    }
    // Things may have changed while it was fetched, like another place
    // picked for a flexible stop
    const nextPlace = state.journey ? getTarget(state.journey).place : null;
    if (
      state.journey?.id !== journey.id ||
      state.plan !== plan ||
      nextPlace?.latitude !== target.place.latitude ||
      nextPlace?.longitude !== target.place.longitude
    ) {
      needsPlan = true;
      return;
    }
    const best = candidates[0];
    const isRiding = !!ride && !!next;

    // Update waiting-to-leave status for scheduled trips
    if (journey.schedule && state.isWaitingToLeave && best) {
      if (best.start <= now + 60_000) {
        setState({ isWaitingToLeave: false });
        updateJourney({ schedule: null });
      }
    }

    let current: TripPattern | null = null;
    let broken: string | null = null;
    if (plan && !rideOn && !state.isWaitingToLeave) {
      const estimate = estimatePlan(
        plan,
        target.staying ? 0 : state.legIndex,
        state.isRiding,
        target.staying ? null : location,
        target.staying ? when : now,
        (leg) => {
          const calls = leg.journeyId
            ? callsByJourney.get(leg.journeyId)
            : null;
          return calls ? getLiveTimes(leg, calls) : null;
        },
      );
      broken = estimate.broken;
      const signature = patternSignature(estimate.pattern);
      // Found again, with fresher times than the ones worked out here
      current =
        candidates.find((c) => patternSignature(c) === signature) ??
        (broken ? null : estimate.pattern);
    }
    rideOn = null;

    if (!current) {
      if (best) {
        if (broken) alertAbout(broken);
        noteSwitch(best, broken ?? state.notice ?? switchReason);
        switchReason = null;
        adopt(best, isRiding);
        setState({ notice: broken ?? state.notice, error: null });
      } else {
        setState({
          plan: null,
          error: `No route to ${target.place.name} right now`,
        });
      }
    } else {
      const signature = patternSignature(current);
      adopt(current, state.isRiding);
      const savesMs = best ? current.end - best.end : 0;
      const bestSignature = best ? patternSignature(best) : null;
      setState({
        error: null,
        suggestion:
          best &&
          bestSignature !== signature &&
          bestSignature !== dismissed &&
          savesMs >= SUGGEST_MS
            ? { pattern: best, savesMs }
            : null,
      });
    }

    const chosen = state.plan;
    const chosenSignature = chosen ? patternSignature(chosen) : null;
    setState({
      alternatives: chosen
        ? pickAlternatives(
            chosen,
            candidates.filter(
              (other) => patternSignature(other) !== chosenSignature,
            ),
          )
        : [],
    });

    const arriveAt = state.plan?.end ?? when;
    const { later, arrival } = await planLater(journey, target, arriveAt);
    if (state.journey?.id === journey.id) {
      setState({ later, arrival: state.plan ? arrival : null });
      // The first whole route, to compare with at the end
      const first = state.plan;
      if (
        !state.journey.baseline &&
        !state.isWaitingToLeave &&
        first &&
        later.every((part) => part.pattern)
      ) {
        updateJourney({
          baseline: {
            madeAt: Date.now(),
            arrival,
            parts: [
              {
                pattern: first,
                stayAt: null,
                stayMinutes: 0,
                // Found while you were at a stop on the way, it starts when
                // you leave it
                stopoverId: getTarget(state.journey).staying?.id ?? null,
              },
              ...later.flatMap((part) =>
                part.pattern
                  ? [
                      {
                        pattern: part.pattern,
                        stayAt: part.from.name,
                        stayMinutes: part.minutes,
                        stopoverId: part.stopoverId,
                      },
                    ]
                  : [],
              ),
            ],
          },
        });
      }
    }
  } catch (error) {
    if (state.journey?.id === journey.id) {
      setState({
        error: state.plan
          ? null
          : error instanceof Error
            ? error.message
            : "Couldn't find a route",
      });
    }
  } finally {
    setState({ isPlanning: false });
  }
}

async function fetchBaselineAndBuildReport(arrived: Journey) {
  const legs = (arrived.baseline?.parts ?? [])
    .flatMap((part) => part.pattern.legs)
    .filter(isTransit);
  await Promise.all(
    legs.map(async (leg) => {
      if (!leg.journeyId || !leg.date) return;
      const calls = await fetchTrip(leg.journeyId, leg.date).catch(() => null);
      if (calls) callsByJourney.set(leg.journeyId, calls);
    }),
  );
  const last = arrived.activities.at(-1);
  const arrivedAt = arrived.arrivedAt ?? Date.now();
  return buildReport({
    destination: arrived.destination.name,
    startedAt: arrived.startedAt,
    arrivedAt,
    baseline: arrived.baseline,
    // What was being done lasted until you got there
    activities: last
      ? [...arrived.activities.slice(0, -1), { ...last, end: arrivedAt }]
      : [],
    changes: arrived.changes,
    getCalls: (leg) =>
      (leg.journeyId ? callsByJourney.get(leg.journeyId) : null) ?? null,
    getStay: (id) => {
      const stopover = arrived.stopovers.find((other) => other.id === id);
      return stopover
        ? { arrivedAt: stopover.arrivedAt, leftAt: stopover.leftAt ?? null }
        : null;
    },
  });
}

async function finish(reached: Journey) {
  // With what was done up to the last check
  const journey = state.journey?.id === reached.id ? state.journey : reached;
  const arrived: Journey = {
    ...journey,
    arrivedAt: Date.now(),
    schedule: null,
  };
  setState({
    journey: arrived,
    plan: null,
    suggestion: null,
    alternatives: [],
    bus: null,
    vehicle: null,
    sightline: null,
    isRiding: false,
    isWaitingToLeave: false,
    later: [],
    isBuildingReport: true,
  });
  void saveJourney(null);
  // Immediately update StepCard so it shows "You're at ..." instead of stale step
  await updateStep();

  const report = await fetchBaselineAndBuildReport(arrived);
  setState({ report, isBuildingReport: false });
  void AsyncStorage.setItem(
    LAST_JOURNEY_KEY,
    JSON.stringify({ journey: arrived, report }),
  ).catch(() => {});
  addJourneyHistory(arrived, report);

  await updateStep();
  if (BusLiveActivity && state.step) {
    await BusLiveActivity.endJourney(
      journey.id,
      { ...toActivityState(state.step, arrived), detail: report.short },
      ARRIVED_DISMISS_S,
    ).catch(() => {});
  }
  setState({ isShowing: false });
  await stopLocation();
}

/**
 * Re-fetches actual bus times for a completed trip whose baseline report wasn't
 * final yet, updating state, LAST_JOURNEY_KEY, and history.
 */
export async function refreshJourneyReport(target?: Journey) {
  const journey = target ?? state.journey;
  if (!journey || journey.arrivedAt === null || !journey.baseline) return null;
  const isCurrent = state.journey?.id === journey.id;
  if (isCurrent) setState({ isRefreshingReport: true });
  try {
    const report = await fetchBaselineAndBuildReport(journey);
    if (isCurrent) {
      setState({ report });
      void AsyncStorage.setItem(
        LAST_JOURNEY_KEY,
        JSON.stringify({ journey, report }),
      ).catch(() => {});
    }
    updateHistoryReport(journey.id, report);
    return report;
  } finally {
    if (isCurrent) setState({ isRefreshingReport: false });
  }
}

async function stopLocation() {
  pauseTicking();
  isLowPowerGps = false;
  await setLocationTracking(false).catch(() => {});
  await setKeepAlive("journey", false);
}

async function syncPowerMode(lowPower: boolean) {
  if (lowPower === isLowPowerGps) return;
  isLowPowerGps = lowPower;
  await setLocationLowPower(lowPower).catch(() => {});
}

let ticking = false;

/** Checks where you are, moves on through the trip, and plans when needed */
async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const journey = state.journey;
    if (!journey || journey.arrivedAt !== null) return;
    const now = Date.now();
    if (now - journey.startedAt > getMaxAge(journey)) {
      await endJourney();
      return;
    }
    // Why the route was changed is old news after a while
    const { notice } = state;
    if (!notice) noticeSeen = null;
    else if (noticeSeen?.notice !== notice) {
      noticeSeen = { notice, at: now };
    } else if (now - noticeSeen.at > NOTICE_MS) {
      setState({ notice: null });
    }
    const location = await getCurrentTrackedLocation();
    if (state.journey?.id !== journey.id) return;
    setState({ location });

    const target = getTarget(journey);
    const accurate = location ? isAccurate(location) : false;

    // Handle scheduled "leave at" / "arrive by" waiting phase
    if (state.isWaitingToLeave) {
      if (location && !journey.origin) {
        updateJourney({
          origin: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
      }
      const planStart = state.plan?.start ?? journey.schedule?.time ?? null;
      const movedEarly =
        accurate &&
        location &&
        journey.origin &&
        metresBetween(location, journey.origin) > 80;
      if (movedEarly || (planStart !== null && now >= planStart - 60_000)) {
        setState({ isWaitingToLeave: false });
        updateJourney({ schedule: null });
        await syncPowerMode(false);
        needsPlan = true;
      } else if (planStart !== null) {
        const msUntilLeave = planStart - now;
        await syncPowerMode(msUntilLeave > IDLE_WAKE_BEFORE_MS);
        if (msUntilLeave <= LEAVE_SOON_MS && msUntilLeave > 0) {
          const key = `leave-scheduled:${journey.id}`;
          if (!sentReminders.has(key)) {
            sentReminders.add(key);
            alertAbout(
              `Time to leave for ${journey.destination.name}`,
              state.plan
                ? describePattern(state.plan)
                : "Get ready to head out",
            );
          }
        }
      }
    } else if (location) {
      if (target.staying) {
        const leaveAt = Math.max(
          stayingUntil(target.staying),
          state.plan?.start ?? 0,
        );
        const msLeft = leaveAt - now;
        await syncPowerMode(msLeft > IDLE_WAKE_BEFORE_MS);

        // Proactive reminder 2 min before leaving a stopover
        if (
          getAlertPreferences().leaveStopoverSoon &&
          msLeft <= LEAVE_SOON_MS &&
          msLeft > 0
        ) {
          const key = `leave-stay:${target.staying.id}`;
          if (!sentReminders.has(key)) {
            sentReminders.add(key);
            alertAbout(
              `Leave ${target.staying.place.name} in 2 min`,
              state.plan
                ? `Next: ${describePattern(state.plan)}`
                : "Your planned stay is almost up",
            );
          }
        }

        const isTimeUp = now >= stayingUntil(target.staying);
        const hasLeft =
          accurate && metresBetween(location, target.staying.place) > LEFT_M;
        if (hasLeft) markDone(target.staying.id, "left");
        else if (isTimeUp) markDone(target.staying.id, "time");
      } else {
        await syncPowerMode(false);
        if (
          // Not while the bus you're on drives past it
          !state.isRiding &&
          accurate &&
          (metresBetween(location, target.place) < ARRIVED_M ||
            getReachedOption(target.stopover, location))
        ) {
          if (target.stopover) {
            const { id, place } = target.stopover;
            // Another one of a flexible stop than the one picked is fine too
            const reached = getReachedOption(target.stopover, location);
            const isOther =
              reached && metresBetween(location, place) >= ARRIVED_M;
            if (isOther) {
              addChange({
                kind: "pick",
                text: `Went to ${reached.place.name} instead of ${place.name}`,
                reason: null,
              });
            }
            updateJourney({
              stopovers: journey.stopovers.map((stopover) =>
                stopover.id === id
                  ? {
                      ...stopover,
                      place: isOther ? reached.place : stopover.place,
                      arrivedAt: now,
                    }
                  : stopover,
              ),
            });
            // The next part is planned from here
            resetProgress();
            setState({
              plan: null,
              legIndex: 0,
              isRiding: false,
              bus: null,
              vehicle: null,
              sightline: null,
            });
            needsPlan = true;
          } else {
            await finish(journey);
            return;
          }
        } else {
          await advance(location).catch(() => {});
        }
      }
    }

    if (!state.isWaitingToLeave) maybeRepick();

    const replanInterval = isLowPowerGps ? IDLE_REPLAN_MS : REPLAN_MS;
    if (
      state.journey?.arrivedAt === null &&
      (needsPlan || !state.plan || Date.now() - lastPlannedAt > replanInterval)
    ) {
      // Not more often than the checks, when no route is found
      if (needsPlan || Date.now() - lastPlannedAt > TICK_MS * 2) await replan();
    }
    await updateStep();
  } finally {
    ticking = false;
  }
}

/**
 * Done at a stop on the way: you left it, the time is up, or you said so.
 * The rest of the trip is planned from where you are, now.
 */
function markDone(id: string, how: "left" | "time" | "manual") {
  const journey = state.journey;
  const stopover = journey?.stopovers.find((other) => other.id === id);
  if (!journey || !stopover || stopover.done) return;
  const now = Date.now();
  const { arrivedAt } = stopover;
  const until = arrivedAt === null ? null : stayingUntil(stopover);
  const isEarly = until !== null && now < until - EARLY_MS;
  updateJourney({
    stopovers: journey.stopovers.map((other) =>
      other.id === id ? { ...other, done: true, leftAt: now } : other,
    ),
  });
  const name = stopover.place.name;
  if (arrivedAt === null) {
    addChange({
      kind: "visit",
      text: `Marked ${name} as done`,
      reason: "Before it was noticed you were there",
    });
    switchReason = `Done at ${name}`;
  } else if (isEarly) {
    const stayed = Math.max(1, Math.round((now - arrivedAt) / 60000));
    addChange({
      kind: "visit",
      text: `Done at ${name} after ${formatDuration(stayed * 60000)} of ${formatDuration(stopover.minutes * 60000)}`,
      reason: how === "manual" ? "You said you were done" : "You left early",
    });
    switchReason = `Done early at ${name}`;
  }
  void syncPowerMode(false);
  // From where you are now, which may be earlier than was planned for
  dropPlan();
  needsPlan = true;
  needsRepick = true;
}

let interval: ReturnType<typeof setInterval> | null = null;

function startTicking() {
  interval ??= setInterval(() => void tick(), TICK_MS);
}

function pauseTicking() {
  if (interval) clearInterval(interval);
  interval = null;
}

/** Turns the GPS on, and keeps the app running while the phone is locked */
async function startLocation() {
  const permission = await requestLocationPermission();
  setState({ permission });
  await setLocationTracking(true);
  await setKeepAlive("journey", true);
}

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Starts a trip to `destination` from where you are, in place of any other,
 * and shows it on the Lock Screen. Supports optional upfront stopovers and
 * a future "leave at" / "arrive by" schedule.
 */
export async function startJourney(
  destination: Place,
  options?: {
    stopovers?: DraftStopover[];
    schedule?: JourneySchedule | null;
    useRentals?: boolean;
  },
) {
  const previous = state.journey;
  if (previous && BusLiveActivity) {
    void BusLiveActivity.endJourney(previous.id).catch(() => {});
  }
  const now = Date.now();
  const schedule =
    options?.schedule && options.schedule.time > now + 60_000
      ? options.schedule
      : null;
  const stopovers: Stopover[] = (options?.stopovers ?? []).map((draft) => ({
    id: newId(),
    place: draft.place,
    minutes: draft.minutes,
    arrivedAt: null,
    done: false,
    flexible: draft.flexible
      ? {
          query: draft.flexible.query,
          label: draft.flexible.label,
          options: draft.flexible.options,
          rankedAt: now,
        }
      : null,
  }));
  const journey: Journey = {
    id: newId(),
    destination,
    stopovers,
    useRentals: options?.useRentals ?? false,
    schedule,
    origin: null,
    startedAt: now,
    arrivedAt: null,
    activities: [],
    changes: [],
    baseline: null,
  };
  resetProgress();
  dismissed = null;
  switchReason = null;
  rideOn = null;
  needsRepick = false;
  pendingAlert = null;
  alerted = null;
  isLowPowerGps = false;
  sentReminders.clear();
  callsByJourney.clear();
  laterCache.clear();
  setState({
    ...EMPTY,
    journey,
    isWaitingToLeave: schedule !== null,
    permission: state.permission,
  });
  void saveJourney(journey);
  void addRecentPlace(destination);
  for (const s of stopovers) {
    if (!s.flexible) void addRecentPlace(s.place);
  }
  needsPlan = true;
  await startLocation();
  await tick();
  startTicking();
  await showJourneyOnLockScreen().catch(() => false);
}

/** Starts a fresh copy of a previously completed journey */
export async function repeatJourney(past: Journey) {
  const drafts: DraftStopover[] = past.stopovers.map((stopover) => ({
    place: stopover.place,
    minutes: stopover.minutes,
    flexible: stopover.flexible
      ? {
          query: stopover.flexible.query,
          label: stopover.flexible.label,
          options: stopover.flexible.options,
        }
      : null,
  }));
  await startJourney(past.destination, {
    stopovers: drafts,
    useRentals: past.useRentals,
  });
}

/** Cancels waiting for a scheduled start time and leaves immediately */
export function leaveNow() {
  if (!state.journey || !state.isWaitingToLeave) return;
  setState({ isWaitingToLeave: false });
  updateJourney({ schedule: null });
  void syncPowerMode(false);
  needsPlan = true;
  void tick();
}

/** Manual override when GPS/Entur lags: user confirms they boarded the bus */
export function markOnBus() {
  const { plan, legIndex, isRiding } = state;
  if (!plan || isRiding) return;
  const leg = plan.legs[legIndex];
  if (!leg || !isTransit(leg)) return;
  unsureTicks = 0;
  departedSeenAt = null;
  setState({ isRiding: true, bus: null, sightline: null, notice: null });
  needsPlan = true;
  void tick();
}

/** Manual override when user sees their bus leave without them */
export function markMissedBus() {
  const { plan, legIndex, isRiding } = state;
  if (!plan || isRiding) return;
  const leg = plan.legs[legIndex];
  if (!leg || !isTransit(leg)) return;
  breakPlan(`Missed line ${leg.line}`);
  void tick();
}

/** Manual override when user gets off the bus early or at their stop */
export function markGotOff() {
  const { plan, legIndex, isRiding } = state;
  if (!plan || !isRiding) return;
  const isLast = legIndex === plan.legs.length - 1;
  resetProgress();
  setState({
    isRiding: false,
    bus: null,
    vehicle: null,
    legIndex: isLast ? legIndex : legIndex + 1,
    notice: null,
  });
  needsPlan = true;
  void tick();
}

/**
 * Brings the trip back to the Lock Screen, like after it was swiped away.
 * Resolves with whether it's shown, which it isn't on Android.
 */
export async function showJourneyOnLockScreen() {
  const { journey, step } = state;
  if (!BusLiveActivity?.isSupported() || !journey || !step) return false;
  if (journey.arrivedAt !== null) return false;
  await BusLiveActivity.showJourney(journey.id, toActivityState(step, journey));
  if (state.journey?.id === journey.id) setState({ isShowing: true });
  return true;
}

export async function endJourney() {
  const journey = state.journey;
  setState({ ...EMPTY, permission: state.permission });
  void saveJourney(null);
  void AsyncStorage.removeItem(LAST_JOURNEY_KEY).catch(() => {});
  if (journey && BusLiveActivity) {
    await BusLiveActivity.endJourney(journey.id).catch(() => {});
  }
  await stopLocation();
}

/**
 * Forgets the route, as where you're going next may have changed. The bus
 * you're on is remembered, to plan from the stops it gets to.
 */
function dropPlan() {
  if (state.isRiding && state.plan) {
    rideOn = state.plan.legs[state.legIndex];
    setState({ plan: null, suggestion: null, alternatives: [] });
  } else {
    resetProgress();
    setState({
      plan: null,
      legIndex: 0,
      bus: null,
      vehicle: null,
      sightline: null,
      suggestion: null,
      alternatives: [],
    });
  }
}

/**
 * Plans again right away, after the trip was changed. It's another trip
 * now, so the first route to compare with at the end is found again.
 */
function changed(text: string) {
  addChange({ kind: "edit", text, reason: null });
  updateJourney({ baseline: null });
  dropPlan();
  dismissed = null;
  laterCache.clear();
  needsPlan = true;
  needsRepick = true;
  void tick();
}

/**
 * Adds a stop on the way, after the ones already there, to stay at for
 * `minutes`. The whole trip is planned again with it.
 */
export function addStopover(place: Place, minutes: number) {
  const journey = state.journey;
  if (!journey || journey.arrivedAt !== null) return;
  updateJourney({
    stopovers: [
      ...journey.stopovers,
      { id: newId(), place, minutes, arrivedAt: null, done: false },
    ],
  });
  void addRecentPlace(place);
  changed(
    `Added a stop at ${place.name} for ${formatDuration(minutes * 60000)}`,
  );
}

/**
 * Where a stop on the way at `position` among the ones still to go to is
 * gone to from, when, and where to after it. One past the last is for a new
 * one. Null when it's not known where you are.
 */
function getWayAround(journey: Journey, position: number) {
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  const staying = left[0]?.arrivedAt != null ? left[0] : null;
  const ahead = staying ? left.slice(1) : left;
  const now = Date.now();
  let from: (TripOrigin & Coordinates) | null = null;
  let when: number;
  if (position === 0) {
    if (staying) {
      from = {
        latitude: staying.place.latitude,
        longitude: staying.place.longitude,
      };
      when = Math.max(now, stayingUntil(staying));
    } else if (state.isRiding && state.plan) {
      // While riding a bus, plan from its next stop instead of mid-road GPS
      const ride = state.plan.legs[state.legIndex];
      const calls = ride?.journeyId
        ? callsByJourney.get(ride.journeyId)
        : undefined;
      const next =
        ride && calls ? getNextStop(ride, calls, vehicle, now) : null;
      if (
        next &&
        next.call.latitude !== null &&
        next.call.longitude !== null
      ) {
        from = {
          quayId: next.call.quayId,
          latitude: next.call.latitude,
          longitude: next.call.longitude,
        };
        when = next.time;
      } else if (state.location) {
        from = {
          latitude: state.location.latitude,
          longitude: state.location.longitude,
        };
        when = now;
      } else {
        when = now;
      }
    } else if (state.location) {
      from = {
        latitude: state.location.latitude,
        longitude: state.location.longitude,
      };
      when = now;
    } else {
      when = now;
    }
  } else {
    const before = ahead[position - 1];
    from = before
      ? { latitude: before.place.latitude, longitude: before.place.longitude }
      : null;
    // When you're there, from the route to it
    const arrival =
      position === 1
        ? state.plan?.end
        : state.later[position - 2]?.pattern?.end;
    when = (arrival ?? now) + (before?.minutes ?? 0) * 60 * 1000;
  }
  if (!from) return null;
  return {
    from,
    when,
    to: ahead[position + 1]?.place ?? journey.destination,
  };
}

/**
 * The places a flexible stop added now could be, like every Rema 1000 on
 * the way, best first, to show before it's added. Also supports ranking for
 * a draft trip before it starts when `draftContext` is passed.
 */
export async function rankFlexibleStop(
  query: string,
  minutes: number,
  draftContext?: { from: Coordinates; to: Place; when?: number },
) {
  if (draftContext) {
    return rankOptions({
      query,
      from: draftContext.from,
      to: draftContext.to,
      when: draftContext.when ?? Date.now(),
      minutes,
      useRentals: false,
      walkSpeed: getWalkSpeed(),
    });
  }
  const journey = state.journey;
  if (!journey || journey.arrivedAt !== null) return [];
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  const staying = left[0]?.arrivedAt != null ? 1 : 0;
  const way = getWayAround(journey, left.length - staying);
  if (!way) throw new Error("It’s not known where you are yet");
  return rankOptions({
    query,
    ...way,
    minutes,
    useRentals: journey.useRentals,
    walkSpeed: getWalkSpeed(),
  });
}

/**
 * Adds a flexible stop, after the ones already there: the best of
 * `options` is gone to, and another is picked on the way when it's
 * quicker, like after a missed bus
 */
export function addFlexibleStop(
  query: string,
  label: string,
  minutes: number,
  options: FlexibleOption[],
) {
  const journey = state.journey;
  const best = options[0];
  if (!journey || journey.arrivedAt !== null || !best) return;
  updateJourney({
    stopovers: [
      ...journey.stopovers,
      {
        id: newId(),
        place: best.place,
        minutes,
        arrivedAt: null,
        done: false,
        flexible: { query, label, options, rankedAt: Date.now() },
      },
    ],
  });
  changed(
    `Added a flexible stop at a ${label} for ${formatDuration(minutes * 60000)}, picked ${best.place.name}`,
  );
}

/**
 * Goes to this one of a flexible stop, and no other: it's a stop like any
 * other from then on
 */
export function pickFlexibleOption(id: string, place: Place) {
  const journey = state.journey;
  const stopover = journey?.stopovers.find((other) => other.id === id);
  if (!journey || !stopover?.flexible || stopover.arrivedAt !== null) return;
  updateJourney({
    stopovers: journey.stopovers.map((other) =>
      other.id === id ? { ...other, place, flexible: null } : other,
    ),
  });
  changed(`Picked ${place.name} for the ${stopover.flexible.label} stop`);
}

/** The one of a flexible stop you're at, when it's not the one picked */
function getReachedOption(stopover: Stopover | null, location: Coordinates) {
  return (
    stopover?.flexible?.options.find(
      (option) => metresBetween(location, option.place) < ARRIVED_M,
    ) ?? null
  );
}

/**
 * Picks the next flexible stop again, now and then and after a change, and
 * goes to another one when it's quicker. Not while you're on a bus, or
 * close to the one picked, as it's too late then.
 */
function maybeRepick() {
  const journey = state.journey;
  if (!journey || journey.arrivedAt !== null || isRepicking) return;
  const { stopover } = getTarget(journey);
  const flexible = stopover?.flexible;
  if (!stopover || !flexible || state.isRiding || !state.location) {
    needsRepick = false;
    return;
  }
  const age = Date.now() - flexible.rankedAt;
  // Just picked, like when it was added
  if (age < TICK_MS * 4) needsRepick = false;
  if (!needsRepick && age < REPICK_MS) return;
  if (metresBetween(state.location, stopover.place) < PICKED_NEAR_M) return;
  const way = getWayAround(journey, 0);
  if (!way) return;
  needsRepick = false;
  isRepicking = true;
  void rankOptions({
    query: flexible.query,
    ...way,
    minutes: stopover.minutes,
    useRentals: journey.useRentals,
    walkSpeed: getWalkSpeed(),
  })
    .then((options) => {
      const current = state.journey?.stopovers.find(
        (other) => other.id === stopover.id,
      );
      if (
        !state.journey ||
        state.journey.id !== journey.id ||
        !current?.flexible ||
        current.arrivedAt !== null ||
        current.done
      ) {
        return;
      }
      const best = options[0];
      const picked = options.find(
        (option) => metresBetween(option.place, current.place) < ARRIVED_M,
      );
      // Only for a while quicker, or when the one picked has no route now
      const isBetter =
        best &&
        best !== picked &&
        (!picked || picked.endAt - best.endAt >= SUGGEST_MS);
      updateJourney({
        stopovers: state.journey.stopovers.map((other) =>
          other.id === current.id
            ? {
                ...other,
                place: isBetter ? best.place : other.place,
                flexible: {
                  ...flexible,
                  options: options.length > 0 ? options : flexible.options,
                  rankedAt: Date.now(),
                },
              }
            : other,
        ),
      });
      if (!isBetter) return;
      const minutes = picked
        ? Math.round((picked.endAt - best.endAt) / 60000)
        : null;
      addChange({
        kind: "pick",
        text: `Picked ${best.place.name} instead of ${current.place.name}`,
        reason:
          minutes !== null
            ? `It gets you on ${minutes} min sooner`
            : `No route to ${current.place.name} now`,
      });
      dropPlan();
      const notice =
        minutes !== null
          ? `${best.place.name} gets you on ${minutes} min sooner`
          : `${best.place.name} is quicker to get to now`;
      alertAbout(notice);
      setState({ notice });
      needsPlan = true;
      void tick();
    })
    .catch(() => {})
    .finally(() => {
      isRepicking = false;
    });
}

export function removeStopover(id: string) {
  const journey = state.journey;
  if (!journey) return;
  updateJourney({
    stopovers: journey.stopovers.filter((stopover) => stopover.id !== id),
  });
  changed(
    `Took away the stop at ${journey.stopovers.find((stopover) => stopover.id === id)?.place.name ?? "a place"}`,
  );
}

/** Moves a stop on the way earlier (-1) or later (1) */
export function moveStopover(id: string, by: -1 | 1) {
  const journey = state.journey;
  if (!journey) return;
  const stopovers = [...journey.stopovers];
  const index = stopovers.findIndex((stopover) => stopover.id === id);
  const other = index + by;
  // Not past the ones you've been to, or are at
  if (index < 0 || other < 0 || other >= stopovers.length) return;
  if (stopovers[index].arrivedAt !== null) return;
  if (stopovers[other].arrivedAt !== null || stopovers[other].done) return;
  [stopovers[index], stopovers[other]] = [stopovers[other], stopovers[index]];
  updateJourney({ stopovers });
  changed("Changed the order of the stops");
}

/** Changes how long is stayed at a stop on the way */
export function setStopoverMinutes(id: string, minutes: number) {
  const journey = state.journey;
  if (!journey) return;
  updateJourney({
    stopovers: journey.stopovers.map((stopover) =>
      stopover.id === id ? { ...stopover, minutes } : stopover,
    ),
  });
  const name = journey.stopovers.find((stopover) => stopover.id === id)?.place
    .name;
  changed(
    `Changed the stay at ${name ?? "a stop"} to ${formatDuration(minutes * 60000)}`,
  );
}

/**
 * The stop on the way that can be marked as done: the one you're at, or the
 * next one when you're close to it. Null otherwise.
 */
export function getFinishableStopover(
  journey: Journey | null,
  location: Coordinates | null,
): Stopover | null {
  if (!journey || journey.arrivedAt !== null) return null;
  const target = getTarget(journey);
  if (target.staying) return target.staying;
  const next = target.stopover;
  if (!next || !location) return null;
  return metresBetween(location, next.place) <= NEAR_M ? next : null;
}

/**
 * Done at a stop on the way, like when the shopping went faster than
 * planned. Nothing has to be marked: the stay also ends when the time is up,
 * or when you walk away.
 */
export function finishStopover(id: string) {
  const { journey, location } = state;
  if (getFinishableStopover(journey, location)?.id !== id) return;
  markDone(id, "manual");
  void tick();
}

/** Whether electric scooters and bikes are used, for all or part of the way */
export function setUseRentals(useRentals: boolean) {
  if (!state.journey) return;
  updateJourney({ useRentals });
  changed(
    useRentals
      ? "Turned on electric scooters and bikes"
      : "Turned off electric scooters and bikes",
  );
}

/** Switches to the route that was suggested */
export function acceptSuggestion() {
  const { suggestion } = state;
  if (!suggestion) return;
  noteSwitch(
    suggestion.pattern,
    `${Math.round(suggestion.savesMs / 60000)} min faster`,
  );
  adopt(suggestion.pattern, state.isRiding);
  setState({ notice: null });
  needsPlan = true;
  void tick();
}

/**
 * Switches to another way to the next place, picked on the map. A faster
 * one than it isn't suggested afterwards, as it was there to pick.
 */
export function chooseRoute(pattern: TripPattern) {
  const { plan, alternatives } = state;
  const signature = patternSignature(pattern);
  if (!plan || patternSignature(plan) === signature) return;
  const fastest = [plan, ...alternatives].reduce((best, other) =>
    other.end < best.end ? other : best,
  );
  const fastestSignature = patternSignature(fastest);
  if (fastestSignature !== signature) dismissed = fastestSignature;
  const minutes = Math.round((pattern.end - plan.end) / 60000);
  noteSwitch(
    pattern,
    minutes > 0
      ? `You picked it, ${minutes} min later`
      : minutes < 0
        ? `You picked it, ${-minutes} min earlier`
        : "You picked it",
  );
  adopt(pattern, state.isRiding);
  setState({ notice: null });
  needsPlan = true;
  void tick();
}

/** Keeps the route, and doesn't suggest the other one again */
export function dismissSuggestion() {
  const { suggestion } = state;
  if (!suggestion) return;
  dismissed = patternSignature(suggestion.pattern);
  const route = describePattern(suggestion.pattern);
  addChange({
    kind: "kept",
    text: `Kept your route when ${route.charAt(0).toLowerCase()}${route.slice(1)} was found`,
    reason: `It was ${Math.round(suggestion.savesMs / 60000)} min faster`,
  });
  setState({ suggestion: null });
  void updateStep();
}

function handleLiveActivityAction(action: JourneyAction) {
  if (action === "switch") {
    acceptSuggestion();
  } else if (action === "finish_stopover") {
    const finishable = getFinishableStopover(state.journey, state.location);
    if (finishable) finishStopover(finishable.id);
  }
}

/**
 * Keeps the trip going: where you are and where the bus is every few
 * seconds, and a look for a better route every half minute. The app is kept
 * running with background location updates, so the Lock Screen keeps up
 * while the phone is locked. Without them, it does while the app is open.
 */
export function startJourneys() {
  const drainPendingActions = () => {
    if (!BusLiveActivity) return;
    void BusLiveActivity.consumePendingJourneyActions()
      .then((actions) => {
        for (const action of actions) handleLiveActivityAction(action);
      })
      .catch(() => {});
  };

  const actionSub = BusLiveActivity?.addJourneyActionListener(
    handleLiveActivityAction,
  );

  const resume = () => {
    drainPendingActions();
    const journey = state.journey;
    if (!journey || journey.arrivedAt !== null) return;
    if (BusLiveActivity) {
      setState({ isShowing: BusLiveActivity.isJourneyActive(journey.id) });
    }
    // Re-check location permission in case the user enabled it in Settings
    void getLocationPermission().then(async (permission) => {
      const wasDenied = state.permission !== "granted";
      if (permission !== state.permission) setState({ permission });
      if (permission === "granted" && wasDenied) {
        await setLocationTracking(true);
        await setKeepAlive("journey", true);
        needsPlan = true;
      }
      void tick();
    });
    startTicking();
  };

  void AsyncStorage.getItem(JOURNEY_KEY)
    .then(async (stored) => {
      const journey: Journey | null = stored ? JSON.parse(stored) : null;
      if (state.journey) return;
      if (
        !journey ||
        journey.arrivedAt !== null ||
        Date.now() - journey.startedAt > getMaxAge(journey)
      ) {
        if (journey) void saveJourney(null);
        // The report of the last trip can still be read
        const last = await AsyncStorage.getItem(LAST_JOURNEY_KEY);
        const ended: { journey: Journey; report: JourneyReport } | null = last
          ? JSON.parse(last)
          : null;
        if (!ended || state.journey) return;
        if (Date.now() - ended.report.arrivedAt > REPORT_AGE_MS) {
          void AsyncStorage.removeItem(LAST_JOURNEY_KEY).catch(() => {});
          return;
        }
        setState({ journey: ended.journey, report: ended.report });
        await updateStep();
        return;
      }
      const isWaiting =
        !!journey.schedule && journey.schedule.time > Date.now() + 60_000;
      setState({
        // Trips from before there were reports have none of it
        journey: {
          ...journey,
          activities: journey.activities ?? [],
          changes: journey.changes ?? [],
          baseline: journey.baseline ?? null,
        },
        isWaitingToLeave: isWaiting,
      });
      needsPlan = true;
      await startLocation();
      if (AppState.currentState === "active") resume();
    })
    .catch(() => {});

  const subscription = AppState.addEventListener("change", (appState) => {
    if (appState === "active") resume();
    // Keep running in background only while trip is active AND (Live Activity is
    // showing on iOS, or Live Activities aren't supported). Swiping away the
    // Live Activity stops background drain instead of running for 6 hours.
    else if (appState === "background") {
      const isOnTrip = state.journey?.arrivedAt === null;
      const shouldKeepRunning =
        isOnTrip &&
        (!BusLiveActivity?.isSupported() || state.isShowing);
      void setKeepAlive("journey", shouldKeepRunning).then((isRunning) => {
        if (!isRunning && AppState.currentState === "background") {
          pauseTicking();
        }
      });
    }
  });
  return () => {
    pauseTicking();
    subscription.remove();
    actionSub?.remove();
    void setKeepAlive("journey", false);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;

export function useJourney() {
  return useSyncExternalStore(subscribe, getState);
}
