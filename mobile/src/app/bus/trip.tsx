import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Bell,
  BellOff,
  Bus,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  LocateOff,
  Smartphone,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { BusTripMap } from "@/components/bus/BusTripMap";
import {
  delayText,
  formatClock,
  formatCountdown,
  formatMinutesUntil,
  LineBadge,
  SituationsBanner,
  statusText,
  useNow,
} from "@/components/bus/shared";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  type BusTrackingState,
  calibrateSightline,
  isBusLiveActivitySupported,
  redoSightline,
  setAlightAt,
  showBusOnLockScreen,
  stopTrackingBus,
  trackBus,
  useBusTracking,
} from "@/lib/bus-tracking";
import {
  type BusProgress,
  type Departure,
  fetchDepartures,
  getSegmentFraction,
  type TripCall,
} from "@/lib/entur";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** How many stops before the one it last passed are listed */
const STOPS_BEHIND = 1;

export default function TripScreen() {
  const tracking = useBusTracking();
  const { bus, progress, calls, error, alightAtPosition, alightProgress } =
    tracking;
  const now = useNow(1000);
  const [switchingNext, setSwitchingNext] = useState(false);

  const isDepartedOrCancelled =
    progress?.status === "departed" || progress?.status === "cancelled";

  // Fetch next departure on the same line/quay when this bus left or was cancelled
  const nextBusQuery = useQuery({
    queryKey: ["next-bus-fallback", bus?.stopId, bus?.quayId, bus?.line],
    queryFn: () => fetchDepartures(bus!.stopId),
    enabled: !!bus && isDepartedOrCancelled && alightAtPosition === null,
    staleTime: 20 * 1000,
  });

  const nextDeparture: Departure | null = useMemo(() => {
    if (!bus || !nextBusQuery.data) return null;
    const all = nextBusQuery.data.quays.flatMap((q) => q.departures);
    return (
      all.find(
        (d) =>
          d.quayId === bus.quayId &&
          d.line === bus.line &&
          !d.cancelled &&
          (d.journeyId !== bus.journeyId || d.date !== bus.date),
      ) ?? null
    );
  }, [bus, nextBusQuery.data]);

  const situations = useMemo(() => {
    if (!calls) return [];
    const seen = new Set<string>();
    const list = [];
    for (const call of calls) {
      for (const s of call.situations) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          list.push(s);
        }
      }
    }
    return list;
  }, [calls]);

  if (!bus) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Icon as={Bus} size={40} className="text-muted-foreground opacity-30" />
        <Text className="text-center text-sm text-muted-foreground">
          You’re not following a bus. Pick one at your stop.
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/bus")
          }
        >
          Find a bus
        </Button>
      </View>
    );
  }

  const stop = bus.platform ? `${bus.stopName} ${bus.platform}` : bus.stopName;
  const alightStop =
    alightAtPosition !== null && calls
      ? (calls.find((c) => c.position === alightAtPosition) ?? null)
      : null;

  const followNext = async () => {
    if (!nextDeparture) return;
    void Haptics.selectionAsync();
    setSwitchingNext(true);
    try {
      const isShown = await trackBus(
        { id: bus.stopId, name: bus.stopName, locality: null },
        nextDeparture,
      );
      if (isShown) toast.success("Following next bus on Lock Screen");
    } catch (failure) {
      toast.error(
        failure instanceof Error ? failure.message : "Couldn't follow next bus",
      );
    } finally {
      setSwitchingNext(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <View className="flex-row items-center gap-3">
        <LineBadge line={bus.line} mode={bus.mode} size="lg" />
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {bus.destination}
          </Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            To {stop}
          </Text>
        </View>
      </View>

      {situations.length > 0 && <SituationsBanner situations={situations} />}

      {progress ? (
        <ProgressCard
          progress={
            progress.status === "departed" && alightProgress
              ? alightProgress
              : progress
          }
          inSight={
            progress.status === "departed" && alightProgress
              ? false
              : tracking.inSight
          }
          isAlighting={progress.status === "departed" && !!alightProgress}
          now={now}
        />
      ) : error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : (
        <Spinner className="py-10" />
      )}

      {isDepartedOrCancelled && alightAtPosition === null && nextDeparture && (
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-3">
            <LineBadge line={nextDeparture.line} mode={nextDeparture.mode} />
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-semibold" numberOfLines={1}>
                Next line {nextDeparture.line} ·{" "}
                {formatMinutesUntil(nextDeparture.expectedArrival, now)}
              </Text>
              <Text
                className="mt-0.5 text-xs text-muted-foreground"
                numberOfLines={1}
              >
                {nextDeparture.destination} ·{" "}
                {formatClock(nextDeparture.expectedArrival)}
              </Text>
            </View>
          </View>
          <Button
            size="sm"
            isLoading={switchingNext}
            onPress={() => void followNext()}
          >
            Follow next bus instead
          </Button>
        </View>
      )}

      {progress && calls && (
        <BusTripMap
          line={bus.line}
          calls={calls}
          progress={progress}
          vehicle={tracking.vehicle}
          route={tracking.route}
          sightline={tracking.sightline}
          alightStop={alightStop}
        />
      )}

      {progress && calls && (
        <StopList
          calls={calls}
          progress={progress}
          alightAtPosition={alightAtPosition}
          onSelectAlight={(pos) => {
            void Haptics.selectionAsync();
            setAlightAt(pos === alightAtPosition ? null : pos);
            if (pos !== alightAtPosition) {
              const target = calls.find((c) => c.position === pos);
              if (target) {
                toast.success(`Will remind you 1 stop before ${target.name}`);
              }
            }
          }}
        />
      )}

      {!bus.finished && <SightlineCard {...tracking} />}

      {tracking.isShowing &&
        !bus.finished &&
        tracking.backgroundPermission === "denied" && <BackgroundDenied />}

      <View className="gap-2">
        {isBusLiveActivitySupported() &&
          !tracking.isShowing &&
          !bus.finished &&
          progress && (
            <Button
              variant="outline"
              icon={Smartphone}
              onPress={() =>
                showBusOnLockScreen()
                  .then(
                    (isShown) =>
                      isShown && toast.success("Shown on the Lock Screen"),
                  )
                  .catch((failure: Error) => toast.error(failure.message))
              }
            >
              Show on Lock Screen
            </Button>
          )}
        <Button
          variant="ghost"
          icon={X}
          onPress={() => {
            void stopTrackingBus();
            if (router.canGoBack()) router.back();
          }}
        >
          {bus.finished ? "Done" : "Stop following"}
        </Button>
      </View>

      <UpdatedText {...tracking} now={now} />
    </ScrollView>
  );
}

function ProgressCard({
  progress,
  inSight,
  isAlighting,
  now,
}: {
  progress: BusProgress;
  inSight: boolean;
  isAlighting?: boolean;
  now: number;
}) {
  const { stop, previousStop, status } = progress;
  const isOnItsWay = status === "coming" || status === "approaching";
  const delay = delayText(
    stop.aimedArrival,
    stop.expectedArrival,
    stop.realtime,
  );
  const fraction =
    status === "here" || status === "departed"
      ? 1
      : getSegmentFraction(progress.segment, now);

  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-end justify-between gap-4">
        <View className="min-w-0 flex-1">
          {inSight && (
            <View className="mb-2 flex-row items-center gap-1.5 self-start rounded-full bg-green-600 px-2.5 py-1">
              <Icon as={Eye} size={13} className="text-white" />
              <Text className="text-xs font-semibold text-white">In sight</Text>
            </View>
          )}
          {isAlighting && (
            <View className="mb-2 flex-row items-center gap-1.5 self-start rounded-full bg-red-600 px-2.5 py-1">
              <Icon as={Bell} size={12} className="text-white" />
              <Text className="text-xs font-semibold text-white">
                Get off at {stop.name}
              </Text>
            </View>
          )}
          <Text className="text-sm font-medium" numberOfLines={2}>
            {statusText(progress)}
          </Text>
          {isOnItsWay && (
            <Text className="mt-1 text-xs text-muted-foreground">
              Expected {formatClock(stop.expectedArrival)}
              {delay ? ` · ${delay}` : ""}
            </Text>
          )}
        </View>
        <Text className="text-4xl font-bold tabular-nums">
          {status === "here"
            ? "Now"
            : isOnItsWay
              ? formatCountdown(stop.expectedArrival, now)
              : "–"}
        </Text>
      </View>

      {previousStop && status !== "cancelled" && (
        <View className="gap-1.5">
          <Progress value={fraction * 100} className="h-3 bg-muted" />
          <View className="flex-row justify-between gap-4">
            <Text
              className="flex-1 text-xs text-muted-foreground"
              numberOfLines={1}
            >
              {previousStop.name}
            </Text>
            <Text
              className="flex-1 text-right text-xs font-medium"
              numberOfLines={1}
            >
              {stop.name}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/** The stops from where the bus is to yours, plus optional stops after yours for alighting reminder */
function StopList({
  calls,
  progress,
  alightAtPosition,
  onSelectAlight,
}: {
  calls: TripCall[];
  progress: BusProgress;
  alightAtPosition: number | null;
  onSelectAlight: (position: number) => void;
}) {
  const [showAfter, setShowAfter] = useState(alightAtPosition !== null);
  const lastPassedIndex = progress.lastPassed
    ? calls.indexOf(progress.lastPassed)
    : -1;
  const stopIndex = calls.indexOf(progress.stop);
  const from = Math.max(0, lastPassedIndex - STOPS_BEHIND);
  const before = calls.slice(from, stopIndex + 1);
  const after = calls.slice(stopIndex + 1);

  return (
    <View className="rounded-xl border border-border bg-card px-4 py-2">
      {before.map((call) => {
        const index = calls.indexOf(call);
        const isPassed = index <= lastPassedIndex;
        const isBusHere = index === lastPassedIndex;
        const isMine = call === progress.stop;
        const time = call.actualDeparture ?? call.expectedArrival;
        return (
          <View
            key={call.position}
            className="flex-row items-center gap-3 py-2"
          >
            <View
              className={cn(
                "h-6 w-6 items-center justify-center rounded-full",
                isBusHere
                  ? "bg-yellow-400"
                  : isPassed
                    ? "bg-muted"
                    : isMine
                      ? "border-2 border-foreground"
                      : "border border-border",
              )}
            >
              {isBusHere ? (
                <Icon as={Bus} size={13} className="text-black" />
              ) : isPassed ? (
                <Icon as={Check} size={12} className="text-muted-foreground" />
              ) : null}
            </View>
            <Text
              className={cn(
                "flex-1 text-sm",
                isPassed && !isBusHere && "text-muted-foreground",
                isMine && "font-semibold",
              )}
              numberOfLines={1}
            >
              {call.name}
            </Text>
            <Text
              className={cn(
                "text-xs tabular-nums text-muted-foreground",
                isMine && "font-semibold text-foreground",
              )}
            >
              {formatClock(time)}
            </Text>
          </View>
        );
      })}

      {after.length > 0 && (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAfter((open) => !open)}
            className="flex-row items-center gap-1.5 border-t border-border py-2.5 active:opacity-70"
          >
            <Icon as={Bell} size={13} className="text-muted-foreground" />
            <Text className="flex-1 text-xs font-medium text-muted-foreground">
              {showAfter
                ? "Hide stops after yours"
                : `Remind me to get off (${after.length} stops after)`}
            </Text>
            <Icon
              as={showAfter ? ChevronUp : ChevronDown}
              size={14}
              className="text-muted-foreground"
            />
          </Pressable>
          {showAfter &&
            after.map((call) => {
              const index = calls.indexOf(call);
              const isPassed = index <= lastPassedIndex;
              const isBusHere = index === lastPassedIndex;
              const isSelected = call.position === alightAtPosition;
              const time = call.actualDeparture ?? call.expectedArrival;
              return (
                <Pressable
                  key={call.position}
                  accessibilityRole="button"
                  disabled={isPassed}
                  onPress={() => onSelectAlight(call.position)}
                  className="flex-row items-center gap-3 rounded-lg py-2 active:bg-accent"
                >
                  <View
                    className={cn(
                      "h-6 w-6 items-center justify-center rounded-full",
                      isBusHere
                        ? "bg-yellow-400"
                        : isSelected
                          ? "bg-red-600"
                          : isPassed
                            ? "bg-muted"
                            : "border border-border",
                    )}
                  >
                    {isBusHere ? (
                      <Icon as={Bus} size={13} className="text-black" />
                    ) : isSelected ? (
                      <Icon as={Bell} size={12} className="text-white" />
                    ) : isPassed ? (
                      <Icon
                        as={Check}
                        size={12}
                        className="text-muted-foreground"
                      />
                    ) : null}
                  </View>
                  <Text
                    className={cn(
                      "flex-1 text-sm",
                      isPassed && !isBusHere && "text-muted-foreground",
                      isSelected && "font-semibold text-red-600 dark:text-red-400",
                    )}
                    numberOfLines={1}
                  >
                    {call.name}
                  </Text>
                  {isSelected && (
                    <Icon
                      as={BellOff}
                      size={13}
                      className="text-muted-foreground"
                    />
                  )}
                  <Text className="text-xs tabular-nums text-muted-foreground">
                    {formatClock(time)}
                  </Text>
                </Pressable>
              );
            })}
        </>
      )}
    </View>
  );
}

/** Like "240 m", to the nearest 10 */
const formatMetres = (metres: number) => `${Math.round(metres / 10) * 10} m`;

/**
 * How far away the bus can be seen from the stop, with instant user
 * calibration and a separate map recompute option.
 */
function SightlineCard({
  bus,
  sightline,
  sightlineStatus,
  distanceToStop,
  inSight,
}: BusTrackingState) {
  if (!bus || sightlineStatus === null || sightlineStatus === "none") {
    return null;
  }
  const isWorking = sightlineStatus === "working";
  const canCalibrate = sightline !== null && distanceToStop !== null;

  const fix = () => {
    Alert.alert(
      "Sightline not right?",
      canCalibrate
        ? "Adjust it instantly to what you see right now, or recompute it from Kartverket's map."
        : "To adjust it yourself, come back here when the bus is close to the stop. You can also recompute it from the map.",
      [
        ...(canCalibrate
          ? [
              {
                text: inSight ? "I can’t see the bus" : "I can see the bus",
                onPress: () => {
                  void Haptics.selectionAsync();
                  void calibrateSightline(!inSight);
                  toast.success("Sightline adjusted");
                },
              },
            ]
          : []),
        {
          text: "Recompute from map",
          onPress: () => void redoSightline(),
        },
        { text: "Cancel", style: "cancel" as const },
      ],
    );
  };

  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <View className="flex-row gap-3">
        <Icon
          as={inSight || !sightline ? Eye : EyeOff}
          size={18}
          className={cn(
            "mt-0.5",
            inSight ? "text-green-600" : "text-muted-foreground",
          )}
        />
        <View className="min-w-0 flex-1 gap-1">
          {sightline ? (
            <>
              <Text className="text-sm font-medium">
                {inSight
                  ? `You can see the bus from ${bus.stopName} now`
                  : `In sight for the last ${formatMetres(sightline.distance)}`}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {distanceToStop !== null
                  ? `The bus has ${formatMetres(distanceToStop)} left. `
                  : ""}
                {inSight
                  ? `It came into sight ${formatMetres(sightline.distance)} from the stop.`
                  : "Worked out from the buildings, trees and hills on the map."}
                {sightlineStatus === "failed"
                  ? " Couldn’t work it out again."
                  : ""}
              </Text>
            </>
          ) : (
            <Text className="text-sm text-muted-foreground">
              {isWorking
                ? "Working out how far away you can see the bus from the stop…"
                : "Couldn’t work out how far away you can see the bus from the stop."}
            </Text>
          )}
        </View>
        {isWorking && <Spinner />}
      </View>
      {!isWorking && (
        <View className="flex-row gap-2">
          {canCalibrate && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onPress={() => {
                void Haptics.selectionAsync();
                void calibrateSightline(!inSight);
                toast.success("Sightline adjusted");
              }}
            >
              {inSight ? "Can’t see it yet" : "I see it now"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onPress={sightline ? fix : () => void redoSightline()}
          >
            {sightline ? "Not right?" : "Try again"}
          </Button>
        </View>
      )}
    </View>
  );
}

/** Without location permission, the app can't keep running in the background */
function BackgroundDenied() {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <View className="flex-row gap-3">
        <Icon
          as={LocateOff}
          size={18}
          className="mt-0.5 text-muted-foreground"
        />
        <Text className="flex-1 text-sm text-muted-foreground">
          The Lock Screen only updates while Bragster is open. Allow location
          while using the app, and Bragster keeps running in the background
          while you follow a bus.
        </Text>
      </View>
      <Button
        variant="outline"
        size="sm"
        onPress={() => void Linking.openSettings()}
      >
        Open Settings
      </Button>
    </View>
  );
}

function UpdatedText({
  updatedAt,
  vehicle,
  progress,
  error,
  runsInBackground,
  now,
}: {
  updatedAt: number | null;
  vehicle: unknown;
  progress: BusProgress | null;
  error: string | null;
  runsInBackground: boolean;
  now: number;
}) {
  if (!updatedAt) return null;
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  const source = vehicle
    ? "From the bus's GPS"
    : progress?.realtime
      ? "From real-time stop times"
      : "From the timetable";
  return (
    <Text className="text-center text-xs text-muted-foreground">
      {source} · Updated{" "}
      {seconds < 5
        ? "just now"
        : seconds < 90
          ? `${seconds} s ago`
          : `${Math.round(seconds / 60)} min ago`}
      {runsInBackground ? "\nKeeps updating while the phone is locked" : ""}
      {error && progress ? `\nCouldn't update: ${error}` : ""}
    </Text>
  );
}
