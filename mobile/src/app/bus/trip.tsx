import { router } from "expo-router";
import { Bus, Check, LocateOff, Smartphone, X } from "lucide-react-native";
import { Linking, ScrollView, View } from "react-native";
import {
  delayText,
  formatClock,
  formatCountdown,
  LineBadge,
  statusText,
  useNow,
} from "@/components/bus/shared";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  isBusLiveActivitySupported,
  showBusOnLockScreen,
  stopTrackingBus,
  useBusTracking,
} from "@/lib/bus-tracking";
import {
  type BusProgress,
  getSegmentFraction,
  type TripCall,
} from "@/lib/entur";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** How many stops before the one it last passed are listed */
const STOPS_BEHIND = 1;

export default function TripScreen() {
  const tracking = useBusTracking();
  const { bus, progress, calls, error } = tracking;
  const now = useNow(1000);

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

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
    >
      <View className="flex-row items-center gap-3">
        <LineBadge line={bus.line} size="lg" />
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {bus.destination}
          </Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            To {stop}
          </Text>
        </View>
      </View>

      {progress ? (
        <ProgressCard progress={progress} now={now} />
      ) : error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : (
        <Spinner className="py-10" />
      )}

      {progress && calls && <StopList calls={calls} progress={progress} />}

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
  now,
}: {
  progress: BusProgress;
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

/** The stops from where the bus is to yours */
function StopList({
  calls,
  progress,
}: {
  calls: TripCall[];
  progress: BusProgress;
}) {
  const lastPassedIndex = progress.lastPassed
    ? calls.indexOf(progress.lastPassed)
    : -1;
  const stopIndex = calls.indexOf(progress.stop);
  const from = Math.max(0, lastPassedIndex - STOPS_BEHIND);
  const shown = calls.slice(from, stopIndex + 1);

  return (
    <View className="rounded-xl border border-border bg-card px-4 py-2">
      {shown.map((call) => {
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
