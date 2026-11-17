import { AppleMaps } from "expo-maps";
import { useState } from "react";
import { Platform, View } from "react-native";
import type { Coordinates } from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

/**
 * A map with a pin on a place, and where you are if that's known. Tapping
 * the map moves the pin there. Apple Maps, so it's iOS 17 and later only;
 * elsewhere there's nothing.
 */
export function PlaceMap({
  pin,
  showsPin = true,
  title,
  showsLocation,
  onMove,
  className,
}: {
  /** Where the map first looks, and the pin is */
  pin: Coordinates;
  /** False until a pin of its own has been put down */
  showsPin?: boolean;
  title: string;
  /** Only when you've allowed it, or the map asks */
  showsLocation: boolean;
  onMove: (place: Coordinates) => void;
  className?: string;
}) {
  // Where the map first looks, so it doesn't jump as the pin moves
  const [camera] = useState(() => ({ coordinates: pin, zoom: 16 }));
  if (Platform.OS !== "ios") return null;
  return (
    <View className={cn("overflow-hidden bg-muted", className)}>
      <AppleMaps.View
        style={{ flex: 1 }}
        cameraPosition={camera}
        markers={
          showsPin
            ? [
                {
                  id: "pin",
                  coordinates: pin,
                  title,
                  systemImage: "mappin",
                  tintColor: "#ef4444",
                },
              ]
            : []
        }
        properties={{ isMyLocationEnabled: showsLocation }}
        uiSettings={{ togglePitchEnabled: false, compassEnabled: false }}
        onMapClick={({ coordinates }) => {
          if (
            coordinates.latitude !== undefined &&
            coordinates.longitude !== undefined
          ) {
            onMove({
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            });
          }
        }}
      />
    </View>
  );
}
