import * as Location from "expo-location";
import { Platform } from "react-native";
import {
  type BackgroundPermission,
  BusLiveActivity,
  type DeviceLocation,
} from "../../modules/bus-live-activity";
import type { Coordinates } from "./bus-utils";

/**
 * Cross-platform location access for bus features.
 * On iOS, uses BusBackgroundRunner (via BusLiveActivity) so location and
 * background keep-alive share a single CLLocationManager.
 * On Android, falls back to expo-location so trips and nearby stops work too.
 */

let androidSub: Location.LocationSubscription | null = null;
let androidLocation: DeviceLocation | null = null;

function mapExpoStatus(
  status: Location.PermissionStatus,
): BackgroundPermission {
  if (status === Location.PermissionStatus.GRANTED) return "granted";
  if (status === Location.PermissionStatus.UNDETERMINED) return "undetermined";
  return "denied";
}

export async function getLocationPermission(): Promise<BackgroundPermission> {
  if (Platform.OS === "ios" && BusLiveActivity) {
    return BusLiveActivity.getBackgroundPermission();
  }
  const result = await Location.getForegroundPermissionsAsync().catch(
    () => null,
  );
  return result ? mapExpoStatus(result.status) : "denied";
}

export async function requestLocationPermission(): Promise<BackgroundPermission> {
  if (Platform.OS === "ios" && BusLiveActivity) {
    return BusLiveActivity.requestBackgroundPermission().catch(() => "denied");
  }
  const result = await Location.requestForegroundPermissionsAsync().catch(
    () => null,
  );
  return result ? mapExpoStatus(result.status) : "denied";
}

export async function setLocationTracking(enabled: boolean): Promise<boolean> {
  if (Platform.OS === "ios" && BusLiveActivity) {
    return BusLiveActivity.setUsesLocation(enabled).catch(() => false);
  }
  if (!enabled) {
    androidSub?.remove();
    androidSub = null;
    androidLocation = null;
    return false;
  }
  const permission = await getLocationPermission();
  if (permission !== "granted") return false;
  if (androidSub) return true;
  try {
    const last = await Location.getLastKnownPositionAsync().catch(() => null);
    if (last) {
      androidLocation = {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
        accuracy: last.coords.accuracy ?? 25,
        timestamp: last.timestamp,
      };
    }
    androidSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 4000,
      },
      (loc) => {
        androidLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? 25,
          timestamp: loc.timestamp,
        };
      },
    );
    return true;
  } catch {
    return false;
  }
}

export async function setLocationLowPower(lowPower: boolean): Promise<void> {
  if (Platform.OS === "ios" && BusLiveActivity) {
    await BusLiveActivity.setLocationLowPower(lowPower).catch(() => {});
    return;
  }
  // On Android, recreate watch with balanced accuracy when staying
  if (androidSub) {
    androidSub.remove();
    androidSub = null;
    try {
      androidSub = await Location.watchPositionAsync(
        {
          accuracy: lowPower
            ? Location.Accuracy.Balanced
            : Location.Accuracy.High,
          distanceInterval: lowPower ? 40 : 5,
          timeInterval: lowPower ? 15000 : 4000,
        },
        (loc) => {
          androidLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? 25,
            timestamp: loc.timestamp,
          };
        },
      );
    } catch {
      // Ignore if permission was revoked
    }
  }
}

export async function getCurrentTrackedLocation(): Promise<DeviceLocation | null> {
  if (Platform.OS === "ios" && BusLiveActivity) {
    return BusLiveActivity.getLocation().catch(() => null);
  }
  return androidLocation;
}

/**
 * Fetches a single coarse/balanced location fix (e.g. for Nearby Stops)
 * without starting background keep-alive. Only prompts if `ask` is true.
 */
export async function getOneShotLocation(
  ask = false,
): Promise<Coordinates | null> {
  // Reuse active tracked location if already running
  const active = await getCurrentTrackedLocation();
  if (active && Date.now() - active.timestamp < 60_000) {
    return { latitude: active.latitude, longitude: active.longitude };
  }
  const status = ask
    ? await requestLocationPermission()
    : await getLocationPermission();
  if (status !== "granted") return null;
  try {
    const last = await Location.getLastKnownPositionAsync({
      maxAge: 2 * 60 * 1000,
    }).catch(() => null);
    if (last) {
      return {
        latitude: last.coords.latitude,
        longitude: last.coords.longitude,
      };
    }
    const fresh = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: fresh.coords.latitude,
      longitude: fresh.coords.longitude,
    };
  } catch {
    return null;
  }
}
