import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import {
  Bike,
  Bus,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock,
  Eye,
  Flag,
  Footprints,
  History,
  LocateOff,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Navigation,
  Plus,
  Share2,
  Smartphone,
  Timer,
  X,
  Zap,
} from "lucide-react-native";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  View,
} from "react-native";
import {
  compareOption,
  FlexibleBadge,
} from "@/components/bus/FlexibleStopPicker";
import { JourneyReportView } from "@/components/bus/JourneyReportView";
import { MinutesPicker } from "@/components/bus/MinutesPicker";
import { OtherWays, RouteMap } from "@/components/bus/RouteMap";
import { TripTimePicker } from "@/components/bus/TripTimePicker";
import {
  formatClock,
  formatCountdown,
  LineBadge,
  SituationsBanner,
  useNow,
} from "@/components/bus/shared";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { isBusLiveActivitySupported } from "@/lib/bus-tracking";
import type { FlexibleOption } from "@/lib/flexible-stop";
import {
  acceptHistorySuggestion,
  acceptSuggestion,
  canReschedule,
  chooseRoute,
  dismissHistorySuggestion,
  dismissSuggestion,
  endJourney,
  finishStopover,
  getFinishableStopover,
  type Journey,
  type JourneyState,
  leaveNow,
  legKey,
  markGotOff,
  markMissedBus,
  markOnBus,
  moveStopover,
  pickFlexibleOption,
  refreshJourneyReport,
  removeStopover,
  repeatJourney,
  setPreferTransit,
  setSchedule,
  setStopoverMinutes,
  setUseRentals,
  showJourneyOnLockScreen,
  type Stopover,
  useJourney,
} from "@/lib/journey";
import {
  describeLeg,
  describePattern,
  formatDistance,
  type JourneyStep,
} from "@/lib/journey-logic";
import { formatDuration } from "@/lib/journey-report";
import { getTravelMode, openDirections } from "@/lib/open-in-maps";
import { toast } from "@/lib/toast";
import { useColors } from "@/lib/color-scheme";
import type {
  HistorySuggestion,
  LegHistory,
  RouteOutlook,
} from "@/lib/delay-history";
import { legColors } from "@/lib/transport-colors";
import {
  isTransit,
  patternSignature,
  type TripLeg,
  type TripPattern,
} from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<JourneyStep["kind"], LucideIcon> = {
  walk: Footprints,
  wait: Bus,
  ride: Bus,
  rental: Zap,
  stay: MapPin,
  scheduled: Clock,
  arrived: CircleCheck,
  planning: Navigation,
};

const clock = (time: number) => formatClock(new Date(time));

/**
 * The trip that's on: what to do now, the whole route with the stops on the
 * way, and a faster route when one turns up
 */
export default function JourneyScreen() {
  const state = useJourney();
  const { journey, step, suggestion } = state;
  const autoRefreshedId = useRef<string | null>(null);

  // Auto-refresh a non-final trip report once when reopening a finished trip
  useEffect(() => {
    if (
      journey?.arrivedAt != null &&
      state.report?.baseline &&
      !state.report.baseline.isFinal &&
      !state.isRefreshingReport &&
      autoRefreshedId.current !== journey.id
    ) {
      autoRefreshedId.current = journey.id;
      void refreshJourneyReport(journey);
    }
  }, [journey, state.report, state.isRefreshingReport]);

  const activeSituations = useMemo(() => {
    if (!state.plan) return [];
    const seen = new Set<string>();
    const list = [];
    for (const leg of state.plan.legs.slice(state.legIndex)) {
      for (const item of leg.situations ?? []) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          list.push(item);
        }
      }
    }
    return list;
  }, [state.plan, state.legIndex]);

  const hasArrived = journey?.arrivedAt !== null;
  const shareRef = useRef(() => {});
  shareRef.current = () => {
    if (!journey) return;
    const parts = [`Heading to ${journey.destination.name}`];
    if (state.arrival) parts.push(`ETA ${clock(state.arrival)}`);
    if (step?.line) parts.push(`Line ${step.line}`);
    else if (step?.headline) parts.push(step.headline);
    void Share.share({ message: parts.join(" · ") });
  };

  // Memoize Stack.Screen options so native header isn't rebuilt on every state tick
  const showShare = !!journey && !hasArrived;
  const renderShareButton = useCallback(
    () => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share ETA"
        hitSlop={10}
        onPress={() => shareRef.current()}
        className="active:opacity-50"
      >
        <Icon as={Share2} size={20} className="text-foreground" />
      </Pressable>
    ),
    [],
  );
  const screenOptions = useMemo(
    () => ({
      title: "Trip",
      headerRight: showShare ? renderShareButton : undefined,
    }),
    [showShare, renderShareButton],
  );

  if (!journey) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <View className="flex-1 items-center justify-center gap-3 bg-background px-8">
          <Icon
            as={Navigation}
            size={40}
            className="text-muted-foreground opacity-30"
          />
          <Text className="text-center text-sm text-muted-foreground">
            Say where you’re going, and the best route is found and kept up to
            date as you go.
          </Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.replace("/bus/place")}
          >
            Where to?
          </Button>
        </View>
      </>
    );
  }

  // Not needed: the stay also ends when the time is up, or you walk away
  const finishable = getFinishableStopover(journey, state.location);

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Icon as={Flag} size={18} className="text-foreground" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-lg font-semibold" numberOfLines={1}>
              {journey.destination.name}
            </Text>
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {hasArrived
                ? "You’re there"
                : state.arrival
                  ? `There at ${clock(state.arrival)}`
                  : (journey.destination.detail ?? "Finding the best route")}
            </Text>
          </View>
          {state.isPlanning && <Spinner />}
        </View>

        {!hasArrived && activeSituations.length > 0 && (
          <SituationsBanner situations={activeSituations} />
        )}

        {suggestion && <SuggestionCard suggestion={suggestion} />}

        {!hasArrived && state.historySuggestion && (
          <HistorySuggestionCard
            suggestion={state.historySuggestion}
            deadline={journey.arriveBy ?? null}
          />
        )}

        {state.notice && !suggestion && (
          <Text className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            {state.plan
              ? `${state.notice}. The route has been changed.`
              : state.notice}
          </Text>
        )}

        {step && (
          <StepCard step={step}>
            {finishable && (
              <Button
                variant="outline"
                icon={Check}
                onPress={() => {
                  void Haptics.selectionAsync();
                  finishStopover(finishable.id);
                }}
              >
                {finishable.arrivedAt === null
                  ? `I’m done at ${finishable.place.name}`
                  : "Done here, leave now"}
              </Button>
            )}
            {/* Manual state overrides when GPS or Entur realtime lags */}
            {!hasArrived && step.kind === "wait" && (
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onPress={() => {
                    void Haptics.selectionAsync();
                    markOnBus();
                  }}
                >
                  {step.line ? `I’m on line ${step.line}` : "I’m on the bus"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onPress={() => {
                    void Haptics.selectionAsync();
                    markMissedBus();
                  }}
                >
                  Missed it
                </Button>
              </View>
            )}
            {!hasArrived && step.kind === "ride" && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  void Haptics.selectionAsync();
                  markGotOff();
                }}
              >
                I got off
              </Button>
            )}
            {!hasArrived && step.kind === "scheduled" && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  void Haptics.selectionAsync();
                  leaveNow();
                }}
              >
                Leave now instead
              </Button>
            )}
          </StepCard>
        )}

        {hasArrived && state.isBuildingReport && !state.report && (
          <View className="items-center gap-3 rounded-xl border border-border bg-card p-6">
            <Spinner />
            <Text className="text-sm text-muted-foreground">
              Putting together your trip report…
            </Text>
          </View>
        )}

        {hasArrived && state.report && (
          <JourneyReportView
            report={state.report}
            onRefresh={() => void refreshJourneyReport(journey)}
            isRefreshing={state.isRefreshingReport}
            onRepeat={() => {
              void Haptics.selectionAsync();
              void repeatJourney(journey);
            }}
          />
        )}

        {state.permission === "denied" && !hasArrived && <LocationDenied />}

        {!hasArrived && state.plan && (
          <RouteMap
            plan={state.plan}
            // At a stop on the way or waiting to leave, the whole route is still to come
            legIndex={
              state.isWaitingToLeave ||
              journey.stopovers.find((stopover) => !stopover.done)?.arrivedAt !=
                null
                ? 0
                : state.legIndex
            }
            later={state.later}
            alternatives={state.alternatives}
            stopovers={journey.stopovers.filter((stopover) => !stopover.done)}
            destination={journey.destination}
            showsLocation={state.location !== null}
            vehicle={state.vehicle}
            sightline={state.sightline}
            onChoose={chooseRoute}
          />
        )}

        {!hasArrived && <Route {...state} journey={journey} />}

        {!hasArrived && (
          <>
            {canReschedule(state) && (
              <TripTimePicker
                mode={journey.schedule?.mode ?? "now"}
                time={journey.schedule?.time ?? 0}
                onChange={(mode, time) =>
                  setSchedule(mode === "now" ? null : { mode, time })
                }
              />
            )}

            <Stopovers
              journey={journey}
              finishableId={finishable?.id ?? null}
            />

            <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
              <Icon as={Bus} size={18} className="text-muted-foreground" />
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium">Mostly by bus</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Avoids long walks, also when walking is a bit faster
                </Text>
              </View>
              <Switch
                value={!!journey.preferTransit}
                onValueChange={(value) => setPreferTransit(value)}
              />
            </View>

            <View className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4">
              <Icon as={Bike} size={18} className="text-muted-foreground" />
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium">
                  Electric scooters and bikes
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Ryde, Voi and electric city bikes, for all or part of the way
                  when it’s faster
                </Text>
              </View>
              <Switch
                value={journey.useRentals}
                onValueChange={(value) => setUseRentals(value)}
              />
            </View>

            {state.plan && (
              <OtherWays
                outlooks={state.outlooks}
                plan={state.plan}
                alternatives={state.alternatives}
                onChoose={chooseRoute}
              />
            )}
          </>
        )}

        <View className="gap-2">
          {isBusLiveActivitySupported() && !state.isShowing && !hasArrived && (
            <Button
              variant="outline"
              icon={Smartphone}
              onPress={() =>
                showJourneyOnLockScreen()
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
              void endJourney();
              if (router.canGoBack()) router.back();
            }}
          >
            {hasArrived ? "Done" : "End trip"}
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

/** What to do now */
function StepCard({
  step,
  children,
}: {
  step: JourneyStep;
  /** Like a button to be done at a stop on the way */
  children?: ReactNode;
}) {
  const now = useNow(1000);
  const { progress } = step;
  const fraction =
    progress && progress.end > progress.start
      ? Math.max(
          0,
          Math.min(1, (now - progress.start) / (progress.end - progress.start)),
        )
      : 0;
  const StepIconComponent =
    step.kind === "rental" && step.vehicleMode === "bicycle"
      ? Bike
      : STEP_ICONS[step.kind];

  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        {step.line ? (
          <LineBadge line={step.line} size="lg" />
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon
              as={StepIconComponent}
              size={18}
              className="text-foreground"
            />
          </View>
        )}
        <View className="min-w-0 flex-1">
          {step.inSight && (
            <View className="mb-1.5 flex-row items-center gap-1.5 self-start rounded-full bg-green-600 px-2.5 py-1">
              <Icon as={Eye} size={13} className="text-white" />
              <Text className="text-xs font-semibold text-white">In sight</Text>
            </View>
          )}
          <Text className="text-base font-semibold" numberOfLines={2}>
            {step.headline}
          </Text>
          {step.detail && (
            <Text
              className="mt-0.5 text-sm text-muted-foreground"
              numberOfLines={2}
            >
              {step.detail}
            </Text>
          )}
        </View>
        {step.countdownTo !== null && (
          <View className="items-end">
            <Text className="text-3xl font-bold tabular-nums">
              {formatCountdown(new Date(step.countdownTo), now)}
            </Text>
            {step.countdownLabel && (
              <Text className="text-xs text-muted-foreground">
                {step.countdownLabel}
              </Text>
            )}
          </View>
        )}
      </View>
      {step.secondaryCountdownTo !== null && step.secondaryCountdownLabel && (
        <View className="flex-row items-center gap-2 border-t border-border pt-3">
          <Icon as={Bus} size={15} className="text-muted-foreground" />
          <Text className="flex-1 text-sm text-muted-foreground">
            {step.secondaryCountdownLabel}
          </Text>
          <Text className="text-lg font-semibold tabular-nums">
            {formatCountdown(new Date(step.secondaryCountdownTo), now)}
          </Text>
          <Text className="text-xs tabular-nums text-muted-foreground">
            {clock(step.secondaryCountdownTo)}
          </Text>
        </View>
      )}
      {progress && <Progress value={fraction * 100} className="h-3 bg-muted" />}
      {children}
    </View>
  );
}

/** A route that gets there earlier, to switch to or not */
function SuggestionCard({
  suggestion,
}: {
  suggestion: NonNullable<JourneyState["suggestion"]>;
}) {
  const minutes = Math.round(suggestion.savesMs / 60000);
  return (
    <View className="gap-3 rounded-xl border border-orange-500 bg-card p-4">
      <View className="flex-row gap-3">
        <Icon as={Zap} size={18} className="mt-0.5 text-orange-500" />
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold">
            {minutes} min faster: there at {clock(suggestion.pattern.end)}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {describePattern(suggestion.pattern)}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <Button size="sm" className="flex-1" onPress={acceptSuggestion}>
          Switch
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onPress={dismissSuggestion}
        >
          Keep mine
        </Button>
      </View>
    </View>
  );
}

function legIcon(leg: TripLeg) {
  if (isTransit(leg)) return Bus;
  if (leg.rented) return leg.mode === "bicycle" ? Bike : Zap;
  return Footprints;
}

/** Like "+3 min" */
const formatLate = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  return minutes > 0
    ? `+${minutes} min`
    : minutes < 0
      ? `${minutes} min`
      : "on time";
};

/**
 * One leg of the route, with when it starts, in AtB's colour for it: grey
 * for a walk, green for a city bus and so on
 */
function LegRow({
  leg,
  isDone,
  isCurrent,
  history,
}: {
  leg: TripLeg;
  isDone: boolean;
  isCurrent: boolean;
  /** What past delays say about its bus */
  history?: LegHistory | null;
}) {
  const { isDark } = useColors();
  const colors = legColors(leg, isDark);
  const minutes = Math.max(1, Math.round((leg.end - leg.start) / 60000));
  // Drawn straight, as an Icon is coloured by theme classes
  const LegIcon = legIcon(leg);
  return (
    <View
      className={cn("flex-row items-center gap-3 py-2", isDone && "opacity-50")}
    >
      <View
        className="w-1 self-stretch rounded-full"
        style={{ backgroundColor: colors.background }}
      />
      {isTransit(leg) && leg.line ? (
        <View
          className={cn(
            "h-6 min-w-8 items-center justify-center rounded-md px-1",
            isCurrent && "border-2 border-foreground",
          )}
          style={{ backgroundColor: colors.background }}
        >
          <Text
            className="text-xs font-extrabold"
            style={{ color: colors.foreground }}
          >
            {leg.line}
          </Text>
        </View>
      ) : (
        <View
          className={cn(
            "h-6 w-8 items-center justify-center rounded-md",
            isCurrent && "border-2 border-foreground",
          )}
          style={{ backgroundColor: colors.background }}
        >
          <LegIcon size={13} color={colors.foreground} />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            "text-sm",
            isDone && "line-through",
            isCurrent && "font-semibold",
          )}
          numberOfLines={1}
        >
          {describeLeg(leg)}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {isTransit(leg)
            ? `From ${leg.from.name}${leg.from.platform ? ` ${leg.from.platform}` : ""}${leg.headsign ? ` · towards ${leg.headsign}` : ""}`
            : `${minutes} min · ${formatDistance(leg.distance)}`}
        </Text>
        {leg.likely && !isDone && (
          <Text className="text-xs text-green-700 dark:text-green-500">
            Often leaves {clock(leg.likely.time)}, learned from{" "}
            {leg.likely.samples} earlier trips
          </Text>
        )}
        {history && !isDone && (history.departure || history.arrival) && (
          <View className="mt-0.5 flex-row items-center gap-1">
            <Icon as={History} size={11} className="text-muted-foreground" />
            <Text
              className="flex-1 text-xs italic text-muted-foreground"
              numberOfLines={2}
            >
              Past {history.days} days: usually{" "}
              {[
                history.departure
                  ? `leaves ${formatLate(history.departure.usual)}`
                  : null,
                history.arrival && leg.aimedEnd != null
                  ? `there ${clock(leg.aimedEnd + history.arrival.usual)}`
                  : null,
              ]
                .filter(Boolean)
                .join(", ")}
              {(history.snapBack ?? 0) >= 0.15
                ? " · often looks on time just before it leaves, but isn't"
                : ""}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-xs tabular-nums text-muted-foreground">
        {clock(leg.start)}
      </Text>
      {!isDone && (
        <IconButton
          icon={MapIcon}
          label="Open in a maps app"
          onPress={() =>
            openDirections({
              title: describeLeg(leg),
              // Partway there, it's from where you are
              from: isCurrent && !isTransit(leg) ? null : leg.from,
              to: leg.to,
              mode: getTravelMode(leg),
            })
          }
        />
      )}
    </View>
  );
}

/** Like "Line 18 at 08:24 from Lerkendal", the first bus of a route */
function firstBus(pattern: TripPattern) {
  const bus = pattern.legs.find(isTransit);
  return bus
    ? `Line ${bus.line} at ${clock(bus.aimedStart ?? bus.start)} from ${bus.from.name}`
    : "Walk all the way";
}

/** What past delays say about a route, in one line */
function outlookText(outlook: RouteOutlook) {
  return [
    outlook.arrival ? `usually there ${clock(outlook.arrival.usual)}` : null,
    outlook.onTime !== null
      ? `in time on ${Math.round(outlook.onTime * 100)}% of days`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Another route that past delays say is a better bet. Clearly a suggestion
 * from history, not live times, with your route shown next to it.
 */
function HistorySuggestionCard({
  suggestion,
  deadline,
}: {
  suggestion: HistorySuggestion;
  deadline: number | null;
}) {
  const { current, outlook, pattern, reason } = suggestion;
  const missed = current.transfers.find((transfer) => transfer.missed >= 0.25);
  return (
    <View className="gap-3 rounded-xl border border-dashed border-violet-500 bg-card p-4">
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-violet-500/15 px-2.5 py-1">
        <Icon as={History} size={12} className="text-violet-600" />
        <Text className="text-xs font-semibold text-violet-700 dark:text-violet-400">
          Suggestion from past delays · not live
        </Text>
      </View>
      <Text className="text-sm font-semibold">
        {reason === "late" && deadline !== null
          ? `Your bus is often too late for ${clock(deadline)}`
          : missed
            ? `The change to line ${missed.line} at ${missed.at} is missed on ${Math.round(missed.missed * 100)}% of days`
            : "Another route is usually a safer bet"}
      </Text>
      <View className="gap-2">
        <View className="flex-row gap-2">
          <Text className="w-20 text-xs font-medium text-muted-foreground">
            Your route
          </Text>
          <View className="min-w-0 flex-1">
            <Text className="text-sm">
              {firstBus(suggestion.currentPattern)}
            </Text>
            <Text className="text-xs text-muted-foreground">
              Planned there {clock(suggestion.currentPattern.end)} ·{" "}
              {outlookText(current)}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Text className="w-20 text-xs font-medium text-violet-700 dark:text-violet-400">
            Suggested
          </Text>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium">{firstBus(pattern)}</Text>
            <Text className="text-xs text-muted-foreground">
              Leave {clock(pattern.start)} · planned there {clock(pattern.end)}{" "}
              · {outlookText(outlook)}
            </Text>
          </View>
        </View>
      </View>
      <Text className="text-xs text-muted-foreground">
        From AtB’s real times on the last {outlook.days}+ similar days. Today
        may be different: the live times above are still what’s followed.
      </Text>
      <View className="flex-row gap-2">
        <Button
          size="sm"
          className="flex-1"
          onPress={() => {
            void Haptics.selectionAsync();
            acceptHistorySuggestion();
          }}
        >
          Take the suggestion
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onPress={dismissHistorySuggestion}
        >
          Keep mine
        </Button>
      </View>
    </View>
  );
}

/** A stop on the way, or the end of the trip, in the route */
function PlaceRow({
  icon,
  title,
  detail,
  time,
}: {
  icon: LucideIcon;
  title: string;
  detail?: string;
  time?: number | null;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-foreground">
        <Icon as={icon} size={11} className="text-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {detail && (
          <Text className="text-xs text-muted-foreground">{detail}</Text>
        )}
      </View>
      {time != null && (
        <Text className="text-xs font-semibold tabular-nums">
          {clock(time)}
        </Text>
      )}
    </View>
  );
}

const Legs = ({ pattern }: { pattern: TripPattern }) =>
  pattern.legs.map((leg, index) => (
    <LegRow
      // biome-ignore lint/suspicious/noArrayIndexKey: legs have no id and keep their order
      key={index}
      leg={leg}
      isDone={false}
      isCurrent={false}
    />
  ));

/** Like "Stay 10 min · best Rema 1000 on the way" */
function stayDetail(stopover: Stopover | undefined, minutes?: number) {
  const stay = `Stay ${formatDuration((minutes ?? stopover?.minutes ?? 0) * 60 * 1000)}`;
  return stopover?.flexible
    ? `Picked for you as the best ${stopover.flexible.label} · ${stay}`
    : stay;
}

/** The whole trip: the route to the next place, and on from each stop */
function Route({
  journey,
  plan,
  legIndex,
  isWaitingToLeave,
  later,
  arrival,
  outlooks,
  legHistory,
}: JourneyState & { journey: Journey }) {
  if (!plan) return null;
  const outlook = outlooks[patternSignature(plan)] ?? null;
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  const staying = left[0]?.arrivedAt != null ? left[0] : null;
  const next = (staying ? left.slice(1) : left)[0];
  const nextPlace = next?.place ?? journey.destination;
  const mapsName =
    Platform.OS === "ios" ? "Apple Maps or Google Maps" : "Google Maps";

  return (
    <View className="rounded-xl border border-border bg-card px-4 py-2">
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          openDirections({
            title: `The way to ${nextPlace.name}`,
            from: staying?.place ?? null,
            to: nextPlace,
            mode: "transit",
          })
        }
        className="-mx-4 flex-row items-center gap-2 border-b border-border px-4 pb-2.5 pt-1.5 active:bg-accent"
      >
        <Icon as={MapIcon} size={14} className="text-muted-foreground" />
        <Text className="flex-1 text-xs font-medium text-muted-foreground">
          Open the way to {nextPlace.name} in {mapsName}
        </Text>
        <Icon as={ChevronRight} size={14} className="text-muted-foreground" />
      </Pressable>
      {staying && (
        <PlaceRow
          icon={MapPin}
          title={staying.place.name}
          detail="You’re here now"
        />
      )}
      {plan.legs.map((leg, index) => (
        <LegRow
          // biome-ignore lint/suspicious/noArrayIndexKey: legs have no id and keep their order
          key={index}
          leg={leg}
          isDone={!staying && !isWaitingToLeave && index < legIndex}
          isCurrent={!staying && !isWaitingToLeave && index === legIndex}
          history={isTransit(leg) ? legHistory[legKey(leg)] : null}
        />
      ))}
      {outlook && (outlook.arrival || outlook.transfers.length > 0) && (
        <View className="my-1 gap-1 rounded-lg border border-dashed border-border px-3 py-2">
          <View className="flex-row items-center gap-1.5">
            <Icon as={History} size={12} className="text-muted-foreground" />
            <Text className="text-xs font-medium text-muted-foreground">
              Past delays, not live · {outlook.days}+ similar days
            </Text>
          </View>
          {outlook.arrival && (
            <Text className="text-xs text-muted-foreground">
              Usually there {clock(outlook.arrival.usual)}, by{" "}
              {clock(outlook.arrival.late)} on 9 in 10 days
              {outlook.onTime !== null && journey.arriveBy != null
                ? ` · in time for ${clock(journey.arriveBy)} on ${Math.round(outlook.onTime * 100)}%`
                : ""}
            </Text>
          )}
          {outlook.transfers
            .filter((transfer) => transfer.missed >= 0.1)
            .map((transfer) => (
              <Text
                key={transfer.index}
                className="text-xs text-muted-foreground"
              >
                The change to line {transfer.line} at {transfer.at} was missed
                on {Math.round(transfer.missed * 100)}% of days
              </Text>
            ))}
        </View>
      )}
      {next && (
        <PlaceRow
          icon={MapPin}
          title={next.place.name}
          detail={stayDetail(next)}
          time={plan.end}
        />
      )}
      {later.map((part, index) => {
        const isLast = index === later.length - 1;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts have no id and keep their order
          <View key={index}>
            {part.pattern ? (
              <Legs pattern={part.pattern} />
            ) : (
              <Text className="py-2 text-xs text-muted-foreground">
                No route from {part.from.name} to {part.to.name} yet
              </Text>
            )}
            {!isLast && (
              <PlaceRow
                icon={MapPin}
                title={part.to.name}
                detail={
                  later[index + 1].stopoverId
                    ? stayDetail(
                        left.find(
                          (stopover) =>
                            stopover.id === later[index + 1].stopoverId,
                        ),
                        later[index + 1].minutes,
                      )
                    : `Stay ${formatDuration(later[index + 1].minutes * 60 * 1000)}`
                }
                time={part.pattern?.end}
              />
            )}
          </View>
        );
      })}
      <PlaceRow icon={Flag} title={journey.destination.name} time={arrival} />
    </View>
  );
}

/** The stops on the way, to add, move and take away */
function Stopovers({
  journey,
  finishableId,
}: {
  journey: Journey;
  /** The stop on the way that can be marked as done */
  finishableId: string | null;
}) {
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Stops on the way
      </Text>
      {left.map((stopover, index) => (
        <StopoverRow
          key={stopover.id}
          stopover={stopover}
          canFinish={stopover.id === finishableId}
          canMoveUp={
            index > 0 &&
            stopover.arrivedAt === null &&
            left[index - 1].arrivedAt === null
          }
          canMoveDown={index < left.length - 1 && stopover.arrivedAt === null}
        />
      ))}
      <Button
        variant="outline"
        icon={Plus}
        onPress={() =>
          router.push({ pathname: "/bus/place", params: { for: "stopover" } })
        }
      >
        Add a stop
      </Button>
    </View>
  );
}

function StopoverRow({
  stopover,
  canFinish,
  canMoveUp,
  canMoveDown,
}: {
  stopover: Stopover;
  canFinish: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const isHere = stopover.arrivedAt !== null;
  const { flexible } = stopover;
  const [isOpen, setIsOpen] = useState(false);
  /** How long to stay, while it's being changed */
  const [editing, setEditing] = useState<number | null>(null);
  const isFlexible = !!flexible && !isHere;
  const canPick = isFlexible && flexible.options.length > 1;
  const isPicked = (option: FlexibleOption) =>
    option.place.latitude === stopover.place.latitude &&
    option.place.longitude === stopover.place.longitude;
  const picked = flexible?.options.find(isPicked) ?? flexible?.options[0];
  const stay = formatDuration(stopover.minutes * 60 * 1000);
  return (
    <View
      className={cn(
        "rounded-xl bg-card",
        isFlexible ? "border-2 border-violet-600" : "border border-border",
      )}
    >
      <View className="flex-row items-center gap-2 py-2 pl-4 pr-2">
        <View className="min-w-0 flex-1">
          {isFlexible && (
            <View className="mb-1 flex-row items-center gap-2">
              <FlexibleBadge />
              <Text className="text-xs font-semibold text-violet-600">
                Picked for you
              </Text>
            </View>
          )}
          <Text
            className={cn(
              "font-medium",
              isFlexible ? "text-base font-semibold" : "text-sm",
            )}
            numberOfLines={1}
          >
            {stopover.place.name}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {isHere ? "You’re here · " : ""}
            Stay {stay}
            {isFlexible
              ? ` · the best of ${flexible.options.length} ${flexible.label} on the way`
              : ""}
          </Text>
        </View>
        {canFinish && (
          <Button
            size="sm"
            variant="outline"
            onPress={() => finishStopover(stopover.id)}
          >
            Done
          </Button>
        )}
        <IconButton
          icon={Timer}
          label="How long to stay"
          onPress={() =>
            setEditing((minutes) =>
              minutes === null ? stopover.minutes : null,
            )
          }
        />
        {!isHere && (
          <>
            <IconButton
              icon={ChevronUp}
              label="Earlier"
              disabled={!canMoveUp}
              onPress={() => moveStopover(stopover.id, -1)}
            />
            <IconButton
              icon={ChevronDown}
              label="Later"
              disabled={!canMoveDown}
              onPress={() => moveStopover(stopover.id, 1)}
            />
            <IconButton
              icon={X}
              label="Remove"
              onPress={() => removeStopover(stopover.id)}
            />
          </>
        )}
      </View>
      {editing !== null && (
        <View className="gap-3 border-t border-border px-4 py-3">
          <MinutesPicker
            value={editing}
            onChange={setEditing}
            title={
              isHere ? "How long do you stay in all?" : "How long do you stay?"
            }
          />
          <View className="flex-row gap-2">
            <Button
              size="sm"
              className="flex-1"
              disabled={editing === stopover.minutes}
              onPress={() => {
                setStopoverMinutes(stopover.id, editing);
                setEditing(null);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onPress={() => setEditing(null)}
            >
              Cancel
            </Button>
          </View>
        </View>
      )}
      {canPick && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsOpen((open) => !open)}
          className="flex-row items-center gap-1 border-t border-border px-4 py-2 active:bg-accent"
        >
          <Text className="flex-1 text-xs font-medium text-violet-600">
            {isOpen
              ? "Hide the others"
              : `See the other ${flexible.options.length - 1} ${flexible.label}`}
          </Text>
          <Icon
            as={isOpen ? ChevronUp : ChevronDown}
            size={14}
            className="text-violet-600"
          />
        </Pressable>
      )}
      {canPick && isOpen && (
        <View className="px-4 pb-2">
          <Text className="py-1 text-xs text-muted-foreground">
            As of {clock(flexible.rankedAt)}. Tap one to go to only that one.
          </Text>
          {flexible.options.map((option) => (
            <Pressable
              key={`${option.place.latitude}/${option.place.longitude}`}
              accessibilityRole="button"
              disabled={isPicked(option)}
              onPress={() => pickFlexibleOption(stopover.id, option.place)}
              className="flex-row items-center gap-3 rounded-lg py-2 active:bg-accent"
            >
              <View className="min-w-0 flex-1">
                <Text
                  className={cn(
                    "text-sm",
                    isPicked(option) && "font-semibold text-violet-600",
                  )}
                  numberOfLines={1}
                >
                  {option.place.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  There {clock(option.arriveAt)}
                </Text>
              </View>
              <Text className="text-xs tabular-nums text-muted-foreground">
                {isPicked(option) || !picked
                  ? "Picked"
                  : compareOption(option, picked)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function IconButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      className={cn(
        "h-9 w-9 items-center justify-center rounded-lg active:bg-accent",
        disabled && "opacity-30",
      )}
    >
      <Icon as={icon} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

/** Without location permission, there's nowhere to plan from */
function LocationDenied() {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <View className="flex-row gap-3">
        <Icon
          as={LocateOff}
          size={18}
          className="mt-0.5 text-muted-foreground"
        />
        <Text className="flex-1 text-sm text-muted-foreground">
          The trip is planned from where you are. Allow location while using the
          app, and it’s also kept up to date while the phone is locked.
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
