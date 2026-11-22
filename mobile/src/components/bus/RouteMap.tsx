import * as Haptics from "expo-haptics";
import { AppleMaps } from "expo-maps";
import { ChevronRight, Crosshair, Maximize2, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { compareOption } from "@/components/bus/FlexibleStopPicker";
import { formatClock } from "@/components/bus/shared";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { TRONDHEIM } from "@/lib/bus-utils";
import { useColors } from "@/lib/color-scheme";
import type { VehiclePosition } from "@/lib/entur";
import type { FlexibleOption } from "@/lib/flexible-stop";
import type { LaterPart, Stopover } from "@/lib/journey";
import { describePattern } from "@/lib/journey-logic";
import { formatDuration } from "@/lib/journey-report";
import type { Place } from "@/lib/places";
import {
  getCamera,
  getDots,
  getLabelPoint,
  getMidpoint,
  getRoutePath,
  getShapes,
  getTappedRoute,
  type LegShape,
  metresPerPoint,
} from "@/lib/route-shape";
import { getVisibleApproach, type Sightline } from "@/lib/sightline";
import {
  isTransit,
  patternSignature,
  type TripLeg,
  type TripPattern,
} from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

/** What each way of getting about is drawn in */
const MODES = {
  foot: { color: "#64748b", symbol: "figure.walk", label: "Walk" },
  bus: { color: "#2563eb", symbol: "bus.fill", label: "Bus" },
  tram: { color: "#7c3aed", symbol: "tram.fill", label: "Tram" },
  rail: { color: "#b91c1c", symbol: "train.side.front.car", label: "Train" },
  water: { color: "#0891b2", symbol: "ferry.fill", label: "Boat" },
  scooter: { color: "#ea580c", symbol: "scooter", label: "E-scooter" },
  bicycle: { color: "#db2777", symbol: "bicycle", label: "E-bike" },
} as const;
type Mode = keyof typeof MODES;

/** The routes not taken, faded, like other ways in a car's sat nav */
const ALTERNATIVE_COLOR = "#94a3b8cc";
/** How near a route a tap has to be to pick it, in points on the screen */
const TAP_REACH = 22;
/** How big a passed stop and a stop to get off at are, in points */
const STOP_SIZE = 3.5;
const GET_OFF_SIZE = 5.5;
/** Walks are dots this big, this far apart, in points, like on foot maps */
const WALK_DOT_SIZE = 3;
const WALK_DOT_SPACING = 10;
/** What a flexible stop is drawn in, the one picked and the others */
const PICKED_COLOR = "#7c3aed";
const OTHER_OPTION_COLOR = "#ede9fe";
const OTHER_OPTION_TEXT = "#5b21b6";
/** A stop on the way that's one place */
const STOPOVER_COLOR = "#d97706";

function getMode(leg: TripLeg): Mode {
  if (leg.rented) return leg.mode === "bicycle" ? "bicycle" : "scooter";
  if (!isTransit(leg)) return "foot";
  if (leg.mode === "tram" || leg.mode === "rail" || leg.mode === "water") {
    return leg.mode;
  }
  return "bus";
}

const clock = (time: number) => formatClock(new Date(time));

/** Like "+3 min" or "2 min earlier", from the route you're on */
function compareTimes(other: TripPattern, chosen: TripPattern) {
  const minutes = Math.round((other.end - chosen.end) / 60000);
  if (minutes === 0) return "Same time";
  return minutes > 0 ? `+${minutes} min` : `${-minutes} min earlier`;
}

/**
 * The route on a map: each leg in the colour of how it's done, with the
 * buses' line numbers where you get on, the stops they pass, where you get off,
 * the live bus position, and sightline visibility. Includes Recenter and
 * Fullscreen controls.
 */
export function RouteMap({
  plan,
  legIndex,
  later,
  alternatives,
  stopovers,
  destination,
  showsLocation,
  vehicle,
  sightline,
  onChoose,
}: {
  plan: TripPattern;
  /** The legs before it are done, and left out */
  legIndex: number;
  /** The parts after the next stop on the way */
  later: LaterPart[];
  alternatives: TripPattern[];
  /** The ones not done yet */
  stopovers: Stopover[];
  destination: Place;
  showsLocation: boolean;
  vehicle?: VehiclePosition | null;
  sightline?: Sightline | null;
  onChoose: (pattern: TripPattern) => void;
}) {
  const { isDark } = useColors();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(360);
  const [zoom, setZoom] = useState<number | null>(null);
  const [recenterTick, setRecenterTick] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const shapes = useMemo(() => getShapes(plan, legIndex), [plan, legIndex]);
  const laterShapes = useMemo(
    () =>
      later.flatMap((part) => (part.pattern ? getShapes(part.pattern) : [])),
    [later],
  );
  const alternativePaths = useMemo(
    () => alternatives.map((pattern) => getRoutePath(getShapes(pattern))),
    [alternatives],
  );
  const chosenPath = useMemo(() => getRoutePath(shapes), [shapes]);
  const labels = useMemo(
    () =>
      alternativePaths.map((path, index) =>
        getLabelPoint(path, [
          ...chosenPath,
          ...alternativePaths.filter((_, other) => other !== index).flat(),
        ]),
      ),
    [alternativePaths, chosenPath],
  );
  const visibleApproach = useMemo(
    () => (sightline ? getVisibleApproach(sightline) : []),
    [sightline],
  );

  // Reframe when the active route signature, target stopover, or user recenter changes
  const nextStopId = stopovers[0]?.id ?? "dest";
  const routeId = `${nextStopId}/${patternSignature(plan)}/${recenterTick}`;
  const camera = useMemo(
    () => getCamera([...chosenPath, ...alternativePaths.flat()]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeId],
  );
  const latitude = camera?.coordinates.latitude ?? TRONDHEIM.latitude;
  const scale = metresPerPoint(zoom ?? camera?.zoom ?? 14, width, latitude);

  const modes = [
    ...new Set([...shapes, ...laterShapes].map((shape) => getMode(shape.leg))),
  ];

  if (Platform.OS !== "ios" || !camera) return null;

  const casing = isDark ? "#0f172a" : "#ffffff";
  const walkColor = isDark ? "#e2e8f0" : "#1e293b";
  const isWalk = (shape: LegShape) => getMode(shape.leg) === "foot";
  const legLine = (shape: LegShape, id: string, isLater: boolean) => {
    const mode = getMode(shape.leg);
    return {
      id,
      coordinates: shape.path,
      color: `${MODES[mode].color}${isLater ? "99" : ""}`,
      width: isLater ? 4 : 6,
    };
  };

  const polylines = [
    ...alternativePaths.map((path, index) => ({
      id: `alternative-${index}`,
      coordinates: path,
      color: ALTERNATIVE_COLOR,
      width: 6,
    })),
    ...laterShapes.flatMap((shape, index) =>
      isWalk(shape) ? [] : [legLine(shape, `later-${index}`, true)],
    ),
    // An edge round the route you're on, so it stands out from the others
    ...shapes
      .filter((shape) => getMode(shape.leg) !== "foot")
      .map((shape, index) => ({
        id: `casing-${index}`,
        coordinates: shape.path,
        color: casing,
        width: 10,
      })),
    ...shapes.flatMap((shape, index) =>
      isWalk(shape) ? [] : [legLine(shape, `leg-${index}`, false)],
    ),
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

  // Walks as dots, so they don't look like a ride
  const walks = [
    ...shapes.filter(isWalk).map((shape) => ({ shape, isLater: false })),
    ...laterShapes.filter(isWalk).map((shape) => ({ shape, isLater: true })),
  ];
  const walkDots = walks.flatMap(({ shape, isLater }, index) =>
    getDots(shape.path, WALK_DOT_SPACING * scale).map((center, dot) => ({
      id: `walk-${index}-${dot}`,
      center,
      radius: WALK_DOT_SIZE * scale,
      color: `${walkColor}${isLater ? "80" : ""}`,
      lineColor: `${casing}${isLater ? "80" : ""}`,
      lineWidth: 1,
    })),
  );

  const rides = [...shapes, ...laterShapes].filter(
    (shape) => getMode(shape.leg) !== "foot",
  );
  const rideStops = rides.flatMap((shape, index) => {
    const { color } = MODES[getMode(shape.leg)];
    return [
      ...shape.stops.map((stop, stopIndex) => ({
        id: `stop-${index}-${stopIndex}`,
        center: stop,
        radius: STOP_SIZE * scale,
        color: casing,
        lineColor: color,
        lineWidth: 1.5,
      })),
      {
        id: `off-${index}`,
        center: {
          latitude: shape.leg.to.latitude,
          longitude: shape.leg.to.longitude,
        },
        radius: GET_OFF_SIZE * scale,
        color: casing,
        lineColor: color,
        lineWidth: 3,
      },
    ];
  });
  const circles = [...walkDots, ...rideStops];

  // The one of a flexible stop that's picked, and the others it could be
  const flexibles = stopovers.flatMap((stopover) => {
    const { flexible } = stopover;
    if (!flexible || stopover.arrivedAt !== null) return [];
    const isPicked = (option: FlexibleOption) =>
      option.place.latitude === stopover.place.latitude &&
      option.place.longitude === stopover.place.longitude;
    const picked = flexible.options.find(isPicked) ?? flexible.options[0];
    return [
      {
        stopover,
        label: flexible.label,
        others: flexible.options
          .filter((option) => !isPicked(option))
          .map((option) => ({
            option,
            compared: picked ? compareOption(option, picked) : null,
          })),
      },
    ];
  });

  const activeLeg = plan.legs[legIndex];

  // The line numbers where you get on, live bus marker, and how much later the others are
  const annotations = [
    ...rides
      .filter((shape) => isTransit(shape.leg))
      .map((shape, index) => ({
        id: `line-${index}`,
        coordinates: shape.path[0],
        title: [shape.leg.from.name, shape.leg.from.platform]
          .filter(Boolean)
          .join(" "),
        text: shape.leg.line ?? "",
        textColor: "#ffffff",
        backgroundColor: MODES[getMode(shape.leg)].color,
      })),
    ...(vehicle
      ? [
          {
            id: "live-vehicle",
            coordinates: {
              latitude: vehicle.latitude,
              longitude: vehicle.longitude,
            },
            title: activeLeg?.line ? `Line ${activeLeg.line}` : "Live bus",
            text: `🚌 ${activeLeg?.line ?? ""}`.trim(),
            textColor: "#000000",
            backgroundColor: "#facc15",
          },
        ]
      : []),
    // How long each walk is, as a ride has its line number
    ...walks.flatMap(({ shape }, index) => {
      const middle = getMidpoint(shape.path);
      const minutes = Math.round((shape.leg.end - shape.leg.start) / 60000);
      if (!middle || minutes < 1) return [];
      return [
        {
          id: `walk-label-${index}`,
          coordinates: middle,
          title: "",
          text: `🚶 ${minutes} min`,
          textColor: "#ffffff",
          backgroundColor: "#1e293b",
        },
      ];
    }),
    ...flexibles.flatMap(({ stopover, label, others }) =>
      others.map(({ option, compared }, index) => ({
        id: `option-${stopover.id}-${index}`,
        coordinates: {
          latitude: option.place.latitude,
          longitude: option.place.longitude,
        },
        title: "",
        text: compared ? `${label} ${compared}` : label,
        textColor: OTHER_OPTION_TEXT,
        backgroundColor: OTHER_OPTION_COLOR,
      })),
    ),
    ...alternatives.flatMap((pattern, index) => {
      const point = labels[index];
      if (!point) return [];
      return [
        {
          id: `label-${index}`,
          coordinates: point,
          title: "",
          text: compareTimes(pattern, plan),
          textColor: "#0f172a",
          backgroundColor: "#e2e8f0",
        },
      ];
    }),
  ];

  const markers = [
    ...rides
      .filter((shape) => shape.leg.rented)
      .map((shape, index) => {
        const mode = MODES[getMode(shape.leg)];
        return {
          id: `rental-${index}`,
          coordinates: shape.path[0],
          title: `${shape.leg.network ?? ""} ${mode.label}`.trim(),
          systemImage: mode.symbol,
          tintColor: mode.color,
        };
      }),
    ...stopovers.map((stopover) => {
      const isFlexible = !!stopover.flexible && stopover.arrivedAt === null;
      return {
        id: `stopover-${stopover.id}`,
        coordinates: {
          latitude: stopover.place.latitude,
          longitude: stopover.place.longitude,
        },
        title: isFlexible
          ? `${stopover.place.name} · picked`
          : `${stopover.place.name} · ${formatDuration(stopover.minutes * 60 * 1000)}`,
        systemImage: isFlexible ? "star.fill" : "bag.fill",
        tintColor: isFlexible ? PICKED_COLOR : STOPOVER_COLOR,
      };
    }),
    {
      id: "destination",
      coordinates: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      title: destination.name,
      systemImage: "flag.checkered",
      tintColor: "#dc2626",
    },
  ];

  const choose = (pattern: TripPattern) => {
    void Haptics.selectionAsync();
    onChoose(pattern);
  };

  const renderMapView = (isFull: boolean) => (
    <View
      className={
        isFull
          ? "flex-1 bg-muted"
          : "h-80 overflow-hidden rounded-xl border border-border bg-muted"
      }
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <AppleMaps.View
        key={`${routeId}-${isFull ? "full" : "inline"}`}
        style={{ flex: 1 }}
        cameraPosition={camera}
        polylines={polylines}
        circles={circles}
        annotations={annotations}
        markers={markers}
        properties={{ isMyLocationEnabled: showsLocation }}
        uiSettings={{ togglePitchEnabled: false, compassEnabled: false }}
        onCameraMove={(event) => {
          // Coarse zoom steps reduce overlay rebuild churn while pinching
          const rounded = Math.round(event.zoom * 2) / 2;
          if (rounded !== zoom) setZoom(rounded);
        }}
        onMapClick={({ coordinates }) => {
          if (
            coordinates.latitude === undefined ||
            coordinates.longitude === undefined
          ) {
            return;
          }
          const index = getTappedRoute(
            {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
            chosenPath,
            alternativePaths,
            TAP_REACH * scale,
          );
          const picked = index === null ? null : alternatives[index];
          if (picked) choose(picked);
        }}
      />
      <View
        className="absolute right-3 flex-row gap-2"
        style={{ top: isFull ? insets.top + 12 : 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Recenter map on route"
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
    <View className="gap-3">
      {renderMapView(false)}

      <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
        {modes.map((mode) => (
          <View key={mode} className="flex-row items-center gap-1.5">
            {mode === "foot" ? (
              <View className="w-4 flex-row justify-between">
                {[0, 1, 2].map((dot) => (
                  <View
                    key={dot}
                    className="h-1 w-1 rounded-full bg-foreground"
                  />
                ))}
              </View>
            ) : (
              <View
                className="h-1.5 w-4 rounded-full"
                style={{ backgroundColor: MODES[mode].color }}
              />
            )}
            <Text className="text-xs text-muted-foreground">
              {MODES[mode].label}
            </Text>
          </View>
        ))}
        {vehicle && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <Text className="text-xs text-muted-foreground">Live bus</Text>
          </View>
        )}
        {visibleApproach.length >= 2 && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-4 rounded-full bg-green-600" />
            <Text className="text-xs text-muted-foreground">In sight zone</Text>
          </View>
        )}
        {alternatives.length > 0 && (
          <View className="flex-row items-center gap-1.5">
            <View
              className="h-1.5 w-4 rounded-full"
              style={{ backgroundColor: ALTERNATIVE_COLOR }}
            />
            <Text className="text-xs text-muted-foreground">Other ways</Text>
          </View>
        )}
        {flexibles.map(({ stopover, label, others }) => (
          <View key={stopover.id} className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: PICKED_COLOR }}
              />
              <Text className="text-xs text-muted-foreground">
                {label} picked for you
              </Text>
            </View>
            {others.length > 0 && (
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-3 w-3 rounded-full border"
                  style={{
                    backgroundColor: OTHER_OPTION_COLOR,
                    borderColor: OTHER_OPTION_TEXT,
                  }}
                />
                <Text className="text-xs text-muted-foreground">
                  Other {label}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <Modal
        visible={fullscreen}
        animationType="slide"
        onRequestClose={() => setFullscreen(false)}
      >
        {renderMapView(true)}
      </Modal>
    </View>
  );
}

/**
 * The other ways to the next place, to switch to. Under the rest of the
 * trip, as they're there for when you want another way, not to read.
 */
export function OtherWays({
  plan,
  alternatives,
  onChoose,
}: {
  plan: TripPattern;
  alternatives: TripPattern[];
  onChoose: (pattern: TripPattern) => void;
}) {
  if (alternatives.length === 0) return null;
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Other ways · tap one to take it
      </Text>
      {alternatives.map((pattern, index) => (
        <AlternativeRow
          // biome-ignore lint/suspicious/noArrayIndexKey: routes have no id and are in order
          key={index}
          pattern={pattern}
          chosen={plan}
          onPress={() => {
            void Haptics.selectionAsync();
            onChoose(pattern);
          }}
        />
      ))}
    </View>
  );
}

/** Another way there, with when it gets there compared to yours */
function AlternativeRow({
  pattern,
  chosen,
  onPress,
}: {
  pattern: TripPattern;
  chosen: TripPattern;
  onPress: () => void;
}) {
  const difference = compareTimes(pattern, chosen);
  const isEarlier = pattern.end < chosen.end - 30_000;
  const firstRide = pattern.legs.find(isTransit);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Switches to this route"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 active:bg-accent"
    >
      <View className="flex-row items-center gap-1">
        {pattern.legs
          .filter((leg) => getMode(leg) !== "foot")
          .map((leg, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: legs have no id and keep their order
              key={index}
              className="h-6 min-w-6 items-center justify-center rounded-md px-1"
              style={{ backgroundColor: MODES[getMode(leg)].color }}
            >
              <Text className="text-xs font-bold text-white">
                {isTransit(leg) ? leg.line : leg.mode === "bicycle" ? "B" : "S"}
              </Text>
            </View>
          ))}
        {pattern.legs.every((leg) => getMode(leg) === "foot") && (
          <View
            className="h-6 items-center justify-center rounded-md px-1.5"
            style={{ backgroundColor: MODES.foot.color }}
          >
            <Text className="text-xs font-bold text-white">Walk</Text>
          </View>
        )}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {describePattern(pattern)}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {firstRide
            ? `Leaves ${clock(firstRide.start)} · `
            : `Leave ${clock(pattern.start)} · `}
          there {clock(pattern.end)}
        </Text>
      </View>
      <Text
        className={cn(
          "text-xs font-semibold tabular-nums",
          isEarlier ? "text-green-600" : "text-muted-foreground",
        )}
      >
        {difference}
      </Text>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
