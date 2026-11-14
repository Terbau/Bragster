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
}

interface BusLiveActivityNativeModule {
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
};
