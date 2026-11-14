import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import {
  type BackgroundPermission,
  BusLiveActivity,
  type BusLiveActivityAttributes,
  type BusLiveActivityState,
} from "../../modules/bus-live-activity";
import {
  type BusProgress,
  type BusStop,
  type Departure,
  type TripCall,
  type VehiclePosition,
  fetchTrip,
  fetchVehicle,
  getBusProgress,
} from "./entur";

const TRACKED_KEY = "bragster.bus.tracked";
const RECENT_STOPS_KEY = "bragster.bus.recent-stops";
const RECENT_STOPS_MAX = 6;

/** How often the bus is fetched, also while the phone is locked */
const POLL_MS = 4 * 1000;
/**
 * The app is only kept running in the background for a bus that's expected
 * within this long, and until a while after it was expected. Otherwise the
 * Lock Screen moves on from the times it was last given.
 */
const BACKGROUND_BEFORE_MS = 90 * 60 * 1000;
const BACKGROUND_AFTER_MS = 15 * 60 * 1000;
/** How long the Lock Screen keeps showing that the bus has left */
const DEPARTED_DISMISS_S = 2 * 60;
const CANCELLED_DISMISS_S = 10 * 60;

/** The bus being followed, to the stop it was picked at */
export interface TrackedBus {
  journeyId: string;
  date: string;
  stopPosition: number;
  quayId: string;
  stopId: string;
  stopName: string;
  platform: string | null;
  line: string;
  destination: string;
  /** Set once it has left the stop, or been cancelled */
  finished?: boolean;
}

export interface BusTrackingState {
  bus: TrackedBus | null;
  calls: TripCall[] | null;
  vehicle: VehiclePosition | null;
  progress: BusProgress | null;
  /** When the bus was last fetched */
  updatedAt: number | null;
  error: string | null;
  /** Whether it's on the Lock Screen. False once it's been swiped away. */
  isShowing: boolean;
  /**
   * Whether the app is kept running while the phone is locked, so the Lock
   * Screen keeps updating
   */
  runsInBackground: boolean;
  /** The location permission that lets it, null until it's been asked for */
  backgroundPermission: BackgroundPermission | null;
}

const EMPTY: BusTrackingState = {
  bus: null,
  calls: null,
  vehicle: null,
  progress: null,
  updatedAt: null,
  error: null,
  isShowing: false,
  runsInBackground: false,
  backgroundPermission: null,
};

let state = EMPTY;
const listeners = new Set<() => void>();

function setState(next: Partial<BusTrackingState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

const isSameBus = (a: TrackedBus | null, b: TrackedBus | null) =>
  !!a &&
  !!b &&
  a.journeyId === b.journeyId &&
  a.date === b.date &&
  a.stopPosition === b.stopPosition;

/** False on Android, before iOS 16.2, or when turned off in Settings */
export const isBusLiveActivitySupported = () =>
  BusLiveActivity?.isSupported() ?? false;

function toAttributes(bus: TrackedBus): BusLiveActivityAttributes {
  return {
    journeyId: bus.journeyId,
    date: bus.date,
    stopPosition: bus.stopPosition,
    quayId: bus.quayId,
    line: bus.line,
    destination: bus.destination,
    stopName: bus.stopName,
    platform: bus.platform,
  };
}

function toActivityState(progress: BusProgress): BusLiveActivityState {
  return {
    expectedArrival: progress.stop.expectedArrival.getTime() / 1000,
    aimedArrival: progress.stop.aimedArrival.getTime() / 1000,
    status: progress.status,
    lastPassed: progress.lastPassed?.name ?? null,
    atLastPassed: progress.atLastPassed,
    previousStop: progress.previousStop?.name ?? null,
    stopsAway: progress.stopsAway,
    progressStart: progress.segment ? progress.segment.start / 1000 : null,
    progressEnd: progress.segment ? progress.segment.end / 1000 : null,
    realtime: progress.realtime,
  };
}

async function saveBus(bus: TrackedBus | null) {
  await (bus
    ? AsyncStorage.setItem(TRACKED_KEY, JSON.stringify(bus))
    : AsyncStorage.removeItem(TRACKED_KEY)
  ).catch(() => {});
}

let refreshing: Promise<void> | null = null;

/** Fetches where the bus is, and shows it on the Lock Screen */
function refresh(): Promise<void> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function doRefresh() {
  const bus = state.bus;
  if (!bus || bus.finished) return;
  try {
    const [calls, vehicle] = await Promise.all([
      fetchTrip(bus.journeyId, bus.date),
      // The stop times are enough without it
      fetchVehicle(bus.journeyId, bus.date).catch(() => null),
    ]);
    const progress = getBusProgress(calls, bus.stopPosition, vehicle);
    if (!progress) throw new Error("The bus doesn't stop there any more");
    // Another bus may have been picked in the meantime
    if (!isSameBus(state.bus, bus)) return;

    const activityState = toActivityState(progress);
    const isDone =
      progress.status === "departed" || progress.status === "cancelled";
    let isShowing = state.isShowing;
    if (BusLiveActivity) {
      if (isDone) {
        await BusLiveActivity.end(
          bus,
          activityState,
          progress.status === "cancelled"
            ? CANCELLED_DISMISS_S
            : DEPARTED_DISMISS_S,
        ).catch(() => {});
        isShowing = false;
      } else {
        isShowing = await BusLiveActivity.update(bus, activityState).catch(
          () => false,
        );
      }
    }
    const nextBus = isDone ? { ...bus, finished: true } : bus;
    if (isDone) void saveBus(nextBus);
    setState({
      bus: nextBus,
      calls,
      vehicle,
      progress,
      updatedAt: Date.now(),
      error: null,
      isShowing,
    });
    await syncBackgroundUpdates();
  } catch (error) {
    if (!isSameBus(state.bus, bus)) return;
    setState({
      error: error instanceof Error ? error.message : "Couldn't find the bus",
    });
  }
}

/**
 * Follows a bus to the stop it was picked at, and shows it on the Lock Screen.
 * Any other bus is no longer followed. Resolves with whether it's shown on
 * the Lock Screen, and rejects if it can't be. Either way, it's still
 * followed in the app.
 */
export async function trackBus(stop: BusStop, departure: Departure) {
  const bus: TrackedBus = {
    journeyId: departure.journeyId,
    date: departure.date,
    stopPosition: departure.stopPosition,
    quayId: departure.quayId,
    stopId: stop.id,
    stopName: stop.name,
    platform: departure.platform,
    line: departure.line,
    destination: departure.destination,
  };
  const previous = state.bus;
  if (previous && !isSameBus(previous, bus) && BusLiveActivity) {
    void BusLiveActivity.end(previous).catch(() => {});
  }
  setState({
    ...EMPTY,
    bus,
    backgroundPermission: state.backgroundPermission,
    runsInBackground: state.runsInBackground,
  });
  void saveBus(bus);
  void addRecentStop(stop);
  // Not `refresh`, which may be fetching the bus that was followed before
  await doRefresh();
  if (BusLiveActivity?.isSupported()) {
    // Asked for before it's shown, as the Lock Screen only keeps updating
    // with it. Only asks the first time.
    const permission =
      await BusLiveActivity.requestBackgroundPermission().catch(() => null);
    setState({ backgroundPermission: permission });
  }
  return showBusOnLockScreen();
}

/**
 * Brings the bus back to the Lock Screen, like after it was swiped away.
 * Resolves with whether it's shown, which it isn't on Android, or before the
 * bus has been fetched.
 */
export async function showBusOnLockScreen() {
  const { bus, progress } = state;
  if (!BusLiveActivity || !bus || !progress || bus.finished) return false;
  await BusLiveActivity.show(toAttributes(bus), toActivityState(progress));
  if (isSameBus(state.bus, bus)) setState({ isShowing: true });
  await syncBackgroundUpdates();
  return true;
}

export async function stopTrackingBus() {
  const bus = state.bus;
  setState({
    ...EMPTY,
    backgroundPermission: state.backgroundPermission,
    runsInBackground: state.runsInBackground,
  });
  void saveBus(null);
  if (bus && BusLiveActivity) {
    await BusLiveActivity.end(bus).catch(() => {});
  }
  await syncBackgroundUpdates();
}

/**
 * Whether the app should keep running while the phone is locked: only for a
 * bus on the Lock Screen, that's on its way soon
 */
function shouldRunInBackground(now = Date.now()) {
  const { bus, progress, isShowing } = state;
  if (!bus || bus.finished || !isShowing || !progress) return false;
  const arrival = progress.stop.expectedArrival.getTime();
  return (
    arrival - now < BACKGROUND_BEFORE_MS && now < arrival + BACKGROUND_AFTER_MS
  );
}

let syncing: Promise<void> = Promise.resolve();

/**
 * Starts or stops keeping the app running in the background, and polling
 * with it, to match `shouldRunInBackground`
 */
function syncBackgroundUpdates() {
  syncing = syncing.then(async () => {
    const activity = BusLiveActivity;
    if (!activity) return;
    const shouldRun = shouldRunInBackground();
    if (shouldRun && !state.runsInBackground) {
      const isRunning = await activity
        .startBackgroundUpdates()
        .catch(() => false);
      if (isRunning !== state.runsInBackground) {
        setState({ runsInBackground: isRunning });
      }
    } else if (!shouldRun && state.runsInBackground) {
      await activity.stopBackgroundUpdates().catch(() => {});
      setState({ runsInBackground: false });
    }
    // Nothing keeps polling while the phone is locked any more
    if (!state.runsInBackground && AppState.currentState === "background") {
      pausePolling();
    }
  });
  return syncing;
}

let interval: ReturnType<typeof setInterval> | null = null;

function startPolling() {
  interval ??= setInterval(() => {
    if (state.bus && !state.bus.finished) void refresh();
  }, POLL_MS);
}

function pausePolling() {
  if (interval) clearInterval(interval);
  interval = null;
}

/**
 * Keeps the followed bus up to date, every few seconds. While it's on the
 * Lock Screen, the app is kept running with background location updates, so
 * it keeps updating while the phone is locked. Without them, iOS pauses the
 * app soon after it leaves the screen, and the Lock Screen moves on from the
 * last times it was given, until the app is opened again.
 */
export function startBusTracking() {
  const resume = () => {
    const bus = state.bus;
    if (bus && BusLiveActivity) {
      setState({ isShowing: BusLiveActivity.isActive(bus) });
    }
    void refresh();
    startPolling();
  };

  void AsyncStorage.getItem(TRACKED_KEY)
    .then((stored) => {
      const bus: TrackedBus | null = stored ? JSON.parse(stored) : null;
      // A bus that has come and gone isn't kept until the next time
      if (!bus || bus.finished) {
        if (bus) void saveBus(null);
        return;
      }
      if (state.bus) return;
      setState({ bus });
      if (AppState.currentState === "active") resume();
    })
    .catch(() => {});

  if (AppState.currentState === "active") resume();
  const subscription = AppState.addEventListener("change", (appState) => {
    if (appState === "active") resume();
    // Keeps going while the app is kept running, but "inactive", like with
    // Control Center open, doesn't pause it either way
    else if (appState === "background" && !state.runsInBackground) {
      pausePolling();
    }
  });
  return () => {
    pausePolling();
    subscription.remove();
    void BusLiveActivity?.stopBackgroundUpdates().catch(() => {});
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;

export function useBusTracking() {
  return useSyncExternalStore(subscribe, getState);
}

export async function getRecentStops(): Promise<BusStop[]> {
  const stored = await AsyncStorage.getItem(RECENT_STOPS_KEY).catch(() => null);
  return stored ? JSON.parse(stored) : [];
}

export async function addRecentStop(stop: BusStop) {
  const stops = await getRecentStops();
  const next = [stop, ...stops.filter((other) => other.id !== stop.id)].slice(
    0,
    RECENT_STOPS_MAX,
  );
  await AsyncStorage.setItem(RECENT_STOPS_KEY, JSON.stringify(next)).catch(
    () => {},
  );
}
