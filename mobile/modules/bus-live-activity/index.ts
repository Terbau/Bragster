import { requireOptionalNativeModule } from "expo";

/** Which bus is shown, see BusArrivalAttributes.swift */
export interface BusLiveActivityAttributes {
  journeyId: string;
  date: string;
  /** The stop's place in the trip, from 0 */
  stopPosition: number;
  quayId: string;
  line: string;
  destination: string;
  stopName: string;
  platform: string | null;
}

/** What the Live Activity shows. Times are in seconds since 1970. */
export interface BusLiveActivityState {
  expectedArrival: number;
  aimedArrival: number;
  status: "coming" | "approaching" | "here" | "departed" | "cancelled";
  lastPassed: string | null;
  atLastPassed: boolean;
  previousStop: string | null;
  stopsAway: number;
  progressStart: number | null;
  progressEnd: number | null;
  realtime: boolean;
  /** Whether the bus can be seen from the stop now */
  inSight: boolean;
}

/** What the trip's Live Activity shows, see JourneyAttributes.swift */
export interface JourneyLiveActivityState {
  step: "walk" | "wait" | "ride" | "rental" | "stay" | "arrived" | "planning";
  /** Like "Walk to Prinsens gate P1" */
  headline: string;
  detail: string | null;
  line: string | null;
  /** In seconds since 1970 */
  countdownTo: number | null;
  /** Like "Bus in" */
  countdownLabel: string | null;
  destination: string;
  /** In seconds since 1970 */
  arrival: number | null;
  inSight: boolean;
  progressStart: number | null;
  progressEnd: number | null;
  /** Like "6 min faster route found" */
  notice: string | null;
  /** Whether the notice is something you have to act on, shown bigger */
  urgent: boolean;
}

/** Said with a sound when the trip's Live Activity is updated */
export interface JourneyAlert {
  /** Like "Line 3 left without you" */
  title: string;
  /** Like "New route: Walk to Prinsens gate P1 · line 22 at 14:32" */
  body: string;
}

/** Where the phone is */
export interface DeviceLocation {
  latitude: number;
  longitude: number;
  /** In metres */
  accuracy: number;
  /** When it was there, in ms since 1970 */
  timestamp: number;
}

/** A shop, a restaurant or an address, from Apple Maps */
export interface FoundPlace {
  name: string;
  /** Its address */
  detail: string;
  latitude: number;
  longitude: number;
}

interface BusLiveActivityNativeModule {
  setUsesLocationAsync(uses: boolean): Promise<boolean>;
  getLocationAsync(): Promise<Partial<DeviceLocation>>;
  searchPlacesAsync(
    query: string,
    latitude: number,
    longitude: number,
  ): Promise<FoundPlace[]>;
  isJourneyActive(id: string): boolean;
  showJourneyAsync(id: string, stateJson: string): Promise<void>;
  updateJourneyAsync(
    id: string,
    stateJson: string,
    alertTitle: string | null,
    alertBody: string | null,
  ): Promise<boolean>;
  endJourneyAsync(
    id: string,
    stateJson: string | null,
    dismissAfter: number,
  ): Promise<void>;
  isSupported(): boolean;
  isActive(journeyId: string, stopPosition: number): boolean;
  showAsync(attributesJson: string, stateJson: string): Promise<void>;
  updateAsync(
    journeyId: string,
    stopPosition: number,
    stateJson: string,
  ): Promise<boolean>;
  endAsync(
    journeyId: string,
    stopPosition: number,
    stateJson: string | null,
    dismissAfter: number,
  ): Promise<void>;
  requestBackgroundPermissionAsync(): Promise<BackgroundPermission>;
  startBackgroundUpdatesAsync(): Promise<boolean>;
  stopBackgroundUpdatesAsync(): Promise<void>;
}

export type BackgroundPermission = "granted" | "denied" | "undetermined";

const native =
  requireOptionalNativeModule<BusLiveActivityNativeModule>("BusLiveActivity");

type Bus = Pick<BusLiveActivityAttributes, "journeyId" | "stopPosition">;

/** Only on iOS, `null` elsewhere */
export const BusLiveActivity = native && {
  isSupported: () => native.isSupported(),
  isActive: (bus: Bus) => native.isActive(bus.journeyId, bus.stopPosition),
  /** Shows the bus, in place of any other */
  show: (attributes: BusLiveActivityAttributes, state: BusLiveActivityState) =>
    native.showAsync(JSON.stringify(attributes), JSON.stringify(state)),
  /** Resolves with whether it's showing */
  update: (bus: Bus, state: BusLiveActivityState) =>
    native.updateAsync(bus.journeyId, bus.stopPosition, JSON.stringify(state)),
  /** With a final state, it's left on the Lock Screen for `dismissAfter` s */
  end: (bus: Bus, finalState?: BusLiveActivityState, dismissAfter = 0) =>
    native.endAsync(
      bus.journeyId,
      bus.stopPosition,
      finalState ? JSON.stringify(finalState) : null,
      dismissAfter,
    ),
  /**
   * Asks for the location permission that keeps the app running in the
   * background, the first time
   */
  requestBackgroundPermission: () => native.requestBackgroundPermissionAsync(),
  /**
   * Keeps the app running while the phone is locked, with location updates.
   * Resolves with whether it is, which it isn't without permission.
   */
  startBackgroundUpdates: () => native.startBackgroundUpdatesAsync(),
  stopBackgroundUpdates: () => native.stopBackgroundUpdatesAsync(),
  /**
   * Turns the GPS on for a trip, and off after it. Resolves with whether
   * it's on, which it isn't without permission.
   */
  setUsesLocation: (uses: boolean) => native.setUsesLocationAsync(uses),
  /** Where the phone is, or null before the GPS has found it */
  getLocation: async (): Promise<DeviceLocation | null> => {
    const location = await native.getLocationAsync();
    return location.latitude === undefined
      ? null
      : (location as DeviceLocation);
  },
  /** Places called something like `query`, near the coordinates */
  searchPlaces: (query: string, latitude: number, longitude: number) =>
    native.searchPlacesAsync(query, latitude, longitude),
  isJourneyActive: (id: string) => native.isJourneyActive(id),
  /** Shows the trip, in place of any other */
  showJourney: (id: string, state: JourneyLiveActivityState) =>
    native.showJourneyAsync(id, JSON.stringify(state)),
  /** Resolves with whether it's showing */
  /**
   * With an alert, the Lock Screen lights up with a sound, and the Dynamic
   * Island opens
   */
  updateJourney: (
    id: string,
    state: JourneyLiveActivityState,
    alert: JourneyAlert | null = null,
  ) =>
    native.updateJourneyAsync(
      id,
      JSON.stringify(state),
      alert?.title ?? null,
      alert?.body ?? null,
    ),
  /** With a final state, it's left on the Lock Screen for `dismissAfter` s */
  endJourney: (
    id: string,
    finalState?: JourneyLiveActivityState,
    dismissAfter = 0,
  ) =>
    native.endJourneyAsync(
      id,
      finalState ? JSON.stringify(finalState) : null,
      dismissAfter,
    ),
};
