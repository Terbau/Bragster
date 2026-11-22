import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import type { BusStop } from "./entur";
import type { Journey } from "./journey";
import type { JourneyReport } from "./journey-report";
import type { Place } from "./places";

const FAVORITE_STOPS_KEY = "bragster.bus.favorite-stops";
const SAVED_PLACES_KEY = "bragster.bus.saved-places";
const SETTINGS_KEY = "bragster.bus.settings";
const HISTORY_KEY = "bragster.journey.history";
const HISTORY_MAX = 30;

export type WalkSpeedMode = "slow" | "normal" | "fast" | "auto";

export const WALK_SPEED_PRESETS: Record<Exclude<WalkSpeedMode, "auto">, number> = {
  slow: 1.0,
  normal: 1.3,
  fast: 1.6,
};

export interface SavedPlace {
  id: string;
  label: string;
  icon: "home" | "work" | "star";
  place: Place;
}

export interface BusAlertPreferences {
  /** Buzz & notify 1 stop before your alighting stop */
  alightSoon: boolean;
  /** Buzz & notify 2 min before it's time to leave a stopover */
  leaveStopoverSoon: boolean;
}

export interface CompletedJourney {
  id: string;
  journey: Journey;
  report: JourneyReport;
}

export interface BusPreferencesState {
  loaded: boolean;
  favoriteStops: BusStop[];
  savedPlaces: SavedPlace[];
  walkSpeedMode: WalkSpeedMode;
  /** Exponential moving average of observed walking speed in m/s */
  learnedWalkSpeed: number | null;
  walkSamples: number;
  alerts: BusAlertPreferences;
  history: CompletedJourney[];
}

const DEFAULT_STATE: BusPreferencesState = {
  loaded: false,
  favoriteStops: [],
  savedPlaces: [],
  walkSpeedMode: "normal",
  learnedWalkSpeed: null,
  walkSamples: 0,
  alerts: {
    alightSoon: true,
    leaveStopoverSoon: true,
  },
  history: [],
};

let state: BusPreferencesState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function setState(next: Partial<BusPreferencesState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;

export function useBusPreferences() {
  return useSyncExternalStore(subscribe, getState);
}

let hydrated = false;

export async function loadBusPreferences() {
  if (hydrated) return;
  hydrated = true;
  try {
    const [favRaw, placesRaw, settingsRaw, historyRaw] = await Promise.all([
      AsyncStorage.getItem(FAVORITE_STOPS_KEY).catch(() => null),
      AsyncStorage.getItem(SAVED_PLACES_KEY).catch(() => null),
      AsyncStorage.getItem(SETTINGS_KEY).catch(() => null),
      AsyncStorage.getItem(HISTORY_KEY).catch(() => null),
    ]);
    const parsedSettings = settingsRaw
      ? (JSON.parse(settingsRaw) as Partial<
          Pick<
            BusPreferencesState,
            "walkSpeedMode" | "learnedWalkSpeed" | "walkSamples" | "alerts"
          >
        >)
      : {};
    setState({
      loaded: true,
      favoriteStops: favRaw ? (JSON.parse(favRaw) as BusStop[]) : [],
      savedPlaces: placesRaw ? (JSON.parse(placesRaw) as SavedPlace[]) : [],
      walkSpeedMode: parsedSettings.walkSpeedMode ?? "normal",
      learnedWalkSpeed: parsedSettings.learnedWalkSpeed ?? null,
      walkSamples: parsedSettings.walkSamples ?? 0,
      alerts: {
        alightSoon: parsedSettings.alerts?.alightSoon ?? true,
        leaveStopoverSoon: parsedSettings.alerts?.leaveStopoverSoon ?? true,
      },
      history: historyRaw ? (JSON.parse(historyRaw) as CompletedJourney[]) : [],
    });
  } catch {
    setState({ loaded: true });
  }
}

void loadBusPreferences();

function persistSettings() {
  const payload = {
    walkSpeedMode: state.walkSpeedMode,
    learnedWalkSpeed: state.learnedWalkSpeed,
    walkSamples: state.walkSamples,
    alerts: state.alerts,
  };
  void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload)).catch(
    () => {},
  );
}

/** Active walking speed in m/s for trip planning */
export function getWalkSpeed(): number {
  if (state.walkSpeedMode === "auto") {
    return state.learnedWalkSpeed ?? WALK_SPEED_PRESETS.normal;
  }
  return WALK_SPEED_PRESETS[state.walkSpeedMode];
}

export function setWalkSpeedMode(mode: WalkSpeedMode) {
  setState({ walkSpeedMode: mode });
  persistSettings();
}

/**
 * Updates the learned walking speed from a completed walking leg.
 * Ignores implausible samples (too short or vehicle speeds).
 */
export function recordWalkSample(distanceM: number, durationMs: number) {
  if (distanceM < 120 || durationMs < 60_000) return;
  const speed = distanceM / (durationMs / 1000);
  if (speed < 0.7 || speed > 2.2) return;
  const clamped = Math.max(0.9, Math.min(1.9, speed));
  const previous = state.learnedWalkSpeed;
  const next = previous === null ? clamped : previous * 0.75 + clamped * 0.25;
  setState({
    learnedWalkSpeed: Number(next.toFixed(2)),
    walkSamples: state.walkSamples + 1,
  });
  persistSettings();
}

export function getAlertPreferences(): BusAlertPreferences {
  return state.alerts;
}

export function setAlertPreference<K extends keyof BusAlertPreferences>(
  key: K,
  value: BusAlertPreferences[K],
) {
  setState({ alerts: { ...state.alerts, [key]: value } });
  persistSettings();
}

export function isFavoriteStop(stopId: string): boolean {
  return state.favoriteStops.some((stop) => stop.id === stopId);
}

export function toggleFavoriteStop(stop: BusStop) {
  const exists = state.favoriteStops.some((item) => item.id === stop.id);
  const next = exists
    ? state.favoriteStops.filter((item) => item.id !== stop.id)
    : [stop, ...state.favoriteStops];
  setState({ favoriteStops: next });
  void AsyncStorage.setItem(FAVORITE_STOPS_KEY, JSON.stringify(next)).catch(
    () => {},
  );
  return !exists;
}

export function savePlaceShortcut(
  entry: Omit<SavedPlace, "id"> & { id?: string },
) {
  const id =
    entry.id ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const item: SavedPlace = {
    id,
    label: entry.label.trim() || entry.place.name,
    icon: entry.icon,
    place: entry.place,
  };
  // Replace existing entry with same id or same preset icon (home/work)
  const next = [
    item,
    ...state.savedPlaces.filter(
      (other) =>
        other.id !== id &&
        (entry.icon === "star" || other.icon !== entry.icon),
    ),
  ];
  setState({ savedPlaces: next });
  void AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(next)).catch(
    () => {},
  );
  return item;
}

export function removePlaceShortcut(id: string) {
  const next = state.savedPlaces.filter((item) => item.id !== id);
  setState({ savedPlaces: next });
  void AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(next)).catch(
    () => {},
  );
}

export function addJourneyHistory(journey: Journey, report: JourneyReport) {
  const entry: CompletedJourney = { id: journey.id, journey, report };
  const next = [
    entry,
    ...state.history.filter((other) => other.id !== journey.id),
  ].slice(0, HISTORY_MAX);
  setState({ history: next });
  void AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
}

export function updateHistoryReport(id: string, report: JourneyReport) {
  if (!state.history.some((entry) => entry.id === id)) return;
  const next = state.history.map((entry) =>
    entry.id === id ? { ...entry, report } : entry,
  );
  setState({ history: next });
  void AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
}

export function removeJourneyHistory(id: string) {
  const next = state.history.filter((entry) => entry.id !== id);
  setState({ history: next });
  void AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
}

export function clearJourneyHistory() {
  setState({ history: [] });
  void AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
}

export interface HistoryStats {
  totalTrips: number;
  /** Net ms saved across trips compared to baseline (positive = saved time) */
  totalSavedMs: number;
  reroutesCount: number;
  flexibleSwitchesCount: number;
  topLines: { line: string; rides: number }[];
}

export function computeHistoryStats(history: CompletedJourney[]): HistoryStats {
  let totalSavedMs = 0;
  let reroutesCount = 0;
  let flexibleSwitchesCount = 0;
  const lineCounts = new Map<string, number>();

  for (const { report } of history) {
    if (report.differenceMs !== null && report.differenceMs < 0) {
      totalSavedMs += -report.differenceMs;
    }
    for (const change of report.changes) {
      if (change.kind === "switch") reroutesCount++;
      if (change.kind === "pick") flexibleSwitchesCount++;
    }
    for (const activity of report.activities) {
      if (activity.kind === "ride" && activity.line) {
        lineCounts.set(activity.line, (lineCounts.get(activity.line) ?? 0) + 1);
      }
    }
  }

  const topLines = [...lineCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([line, rides]) => ({ line, rides }));

  return {
    totalTrips: history.length,
    totalSavedMs,
    reroutesCount,
    flexibleSwitchesCount,
    topLines,
  };
}
