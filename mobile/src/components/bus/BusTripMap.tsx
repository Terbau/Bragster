import { AppleMaps } from "expo-maps";
import { Crosshair, Maximize2, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import type { BusProgress, TripCall, VehiclePosition } from "@/lib/entur";
import { getCamera } from "@/lib/route-shape";
import {
  getVisibleApproach,
  type LatLon,
  type Sightline,
} from "@/lib/sightline";

/**
 * Live map for single-bus tracking: shows the route, the moving bus, your stop,
 * optional alighting stop, and the green sightline segment where the bus comes
 * into view from your stop.
 */
export function BusTripMap({
  line,
  calls,
  progress,
  vehicle,
  route,
  sightline,
  alightStop,
}: {
  line: string;
  calls: TripCall[];
  progress: BusProgress;
  vehicle: VehiclePosition | null;
  route: LatLon[] | null;
  sightline: Sightline | null;
  alightStop: TripCall | null;
}) {
  const { isDark } = useColors();
  const insets = useSafeAreaInsets();
  const [recenterTick, setRecenterTick] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const visibleApproach = useMemo(
    () => (sightline ? getVisibleApproach(sightline) : []),
    [sightline],
  );

  const stopCoords = useMemo(() => {
    const list: LatLon[] = [];
    for (const call of calls) {
      if (call.latitude !== null && call.longitude !== null) {
        list.push({ latitude: call.latitude, longitude: call.longitude });
      }
    }
    return list;
  }, [calls]);

  const routePath = useMemo(() => {
    if (route && route.length >= 2) return route;
    return stopCoords;
  }, [route, stopCoords]);

  const camera = useMemo(() => {
    const focusPoints: LatLon[] = [];
    if (progress.stop.latitude !== null && progress.stop.longitude !== null) {
      focusPoints.push({
        latitude: progress.stop.latitude,
        longitude: progress.stop.longitude,
      });
    }
    if (vehicle) {
      focusPoints.push({
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      });
    } else if (
      progress.previousStop?.latitude != null &&
      progress.previousStop?.longitude != null
    ) {
      focusPoints.push({
        latitude: progress.previousStop.latitude,
        longitude: progress.previousStop.longitude,
      });
    }
    if (alightStop?.latitude != null && alightStop?.longitude != null) {
      focusPoints.push({
        latitude: alightStop.latitude,
        longitude: alightStop.longitude,
      });
    }
    if (visibleApproach.length > 0) {
      focusPoints.push(visibleApproach[visibleApproach.length - 1]);
    }
    return getCamera(focusPoints.length > 0 ? focusPoints : routePath);
    // Only recompute camera when user explicitly recenters or stop/alight changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.stop.quayId, alightStop?.quayId, recenterTick]);

  if (Platform.OS !== "ios" || !camera) return null;

  const casing = isDark ? "#0f172a" : "#ffffff";
  const polylines = [
    ...(routePath.length >= 2
      ? [
          {
            id: "route-casing",
            coordinates: routePath,
            color: casing,
            width: 8,
          },
          {
            id: "route",
            coordinates: routePath,
            color: "#2563eb",
            width: 5,
          },
        ]
      : []),
    ...(visibleApproach.length >= 2
      ? [
          {
            id: "sightline-visible",
            coordinates: visibleApproach,
            color: "#16a34a",
            width: 7,
          },
        ]
      : []),
  ];

  const markers = [
    ...(progress.stop.latitude !== null && progress.stop.longitude !== null
      ? [
          {
            id: "your-stop",
            coordinates: {
              latitude: progress.stop.latitude,
              longitude: progress.stop.longitude,
            },
            title: progress.stop.name,
            systemImage: "mappin.circle.fill",
            tintColor: "#2563eb",
          },
        ]
      : []),
    ...(alightStop?.latitude != null && alightStop?.longitude != null
      ? [
          {
            id: "alight-stop",
            coordinates: {
              latitude: alightStop.latitude,
              longitude: alightStop.longitude,
            },
            title: `Get off · ${alightStop.name}`,
            systemImage: "flag.checkered",
            tintColor: "#dc2626",
          },
        ]
      : []),
  ];

  const annotations = vehicle
    ? [
        {
          id: "live-bus",
          coordinates: {
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
          },
          title: `Line ${line}`,
          text: `🚌 ${line}`,
          textColor: "#000000",
          backgroundColor: "#facc15",
        },
      ]
    : [];

  const renderMap = (isFull: boolean) => (
    <View
      className={
        isFull
          ? "flex-1 bg-muted"
          : "h-56 overflow-hidden rounded-xl border border-border bg-muted"
      }
    >
      <AppleMaps.View
        key={`${recenterTick}-${isFull ? "full" : "inline"}`}
        style={{ flex: 1 }}
        cameraPosition={camera}
        polylines={polylines}
        markers={markers}
        annotations={annotations}
        uiSettings={{ togglePitchEnabled: false, compassEnabled: false }}
      />
      <View
        className="absolute right-3 flex-row gap-2"
        style={{ top: isFull ? insets.top + 12 : 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter map"
          onPress={() => setRecenterTick((n) => n + 1)}
          className="h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm active:opacity-75"
        >
          <Icon as={Crosshair} size={16} className="text-foreground" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFull ? "Close fullscreen map" : "Expand map"}
          onPress={() => setFullscreen((open) => !open)}
          className="h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm active:opacity-75"
        >
          <Icon
            as={isFull ? X : Maximize2}
            size={16}
            className="text-foreground"
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="gap-2">
      {renderMap(false)}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        {vehicle && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <Text className="text-xs text-muted-foreground">Live bus</Text>
          </View>
        )}
        {visibleApproach.length >= 2 && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-4 rounded-full bg-green-600" />
            <Text className="text-xs text-muted-foreground">
              Visible from {progress.stop.name}
            </Text>
          </View>
        )}
      </View>
      <Modal
        visible={fullscreen}
        animationType="slide"
        onRequestClose={() => setFullscreen(false)}
      >
        {renderMap(true)}
      </Modal>
    </View>
  );
}
