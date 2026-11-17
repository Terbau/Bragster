import { ActionSheetIOS, Linking, Platform } from "react-native";
import { toast } from "./toast";
import { type Coordinates, isTransit, type TripLeg } from "./trip-planner";

/** How a part of the way is gone, to get directions for */
export type TravelMode = "walking" | "transit" | "bicycling";

const point = (place: Coordinates) => `${place.latitude},${place.longitude}`;

/** Apple Maps has no cycling in its links, so it walks instead */
const APPLE_MODES: Record<TravelMode, string> = {
  walking: "w",
  transit: "r",
  bicycling: "w",
};

/**
 * Links to directions in Apple Maps and Google Maps. Without `from`, it's
 * from where you are. Google's opens its app when it's there, and the
 * website otherwise.
 */
export function getDirectionLinks(
  from: Coordinates | null,
  to: Coordinates,
  mode: TravelMode,
) {
  const apple = new URLSearchParams({
    ...(from ? { saddr: point(from) } : {}),
    daddr: point(to),
    dirflg: APPLE_MODES[mode],
  });
  const google = new URLSearchParams({
    api: "1",
    ...(from ? { origin: point(from) } : {}),
    destination: point(to),
    travelmode: mode,
  });
  return {
    apple: `https://maps.apple.com/?${apple}`,
    google: `https://www.google.com/maps/dir/?${google}`,
  };
}

const open = (url: string) =>
  void Linking.openURL(url).catch(() => toast.error("Couldn’t open the map"));

/**
 * Opens directions in a maps app, to be guided there by it. On iPhone it's
 * asked which one, and on Android it's Google Maps.
 */
export function openDirections({
  title,
  from,
  to,
  mode,
}: {
  /** Like "Walk to Prinsens gate" */
  title: string;
  from: Coordinates | null;
  to: Coordinates;
  mode: TravelMode;
}) {
  const links = getDirectionLinks(from, to, mode);
  if (Platform.OS !== "ios") {
    open(links.google);
    return;
  }
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title,
      message:
        mode === "bicycling"
          ? "Apple Maps shows the way on foot, as it can’t link to cycling"
          : undefined,
      options: ["Apple Maps", "Google Maps", "Cancel"],
      cancelButtonIndex: 2,
    },
    (index) => {
      if (index === 0) open(links.apple);
      else if (index === 1) open(links.google);
    },
  );
}

/** How a leg is gone, in a maps app */
export function getTravelMode(leg: TripLeg): TravelMode {
  if (leg.rented) return "bicycling";
  return isTransit(leg) ? "transit" : "walking";
}
