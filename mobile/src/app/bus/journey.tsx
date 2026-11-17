import { router } from "expo-router";
import {
  Bike,
  Bus,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Eye,
  Flag,
  Footprints,
  LocateOff,
  type LucideIcon,
  MapPin,
  Navigation,
  Plus,
  Map as MapIcon,
  Smartphone,
  Timer,
  X,
  Zap,
} from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import {
  formatClock,
  formatCountdown,
  LineBadge,
  useNow,
} from "@/components/bus/shared";
import {
  compareOption,
  FlexibleBadge,
} from "@/components/bus/FlexibleStopPicker";
import { JourneyReportView } from "@/components/bus/JourneyReportView";
import { MinutesPicker } from "@/components/bus/MinutesPicker";
import { OtherWays, RouteMap } from "@/components/bus/RouteMap";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { isBusLiveActivitySupported } from "@/lib/bus-tracking";
import {
  acceptSuggestion,
  chooseRoute,
  dismissSuggestion,
  endJourney,
  type Journey,
  type JourneyState,
  finishStopover,
  getFinishableStopover,
  moveStopover,
  pickFlexibleOption,
  removeStopover,
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
import type { FlexibleOption } from "@/lib/flexible-stop";
import { formatDuration } from "@/lib/journey-report";
import { getTravelMode, openDirections } from "@/lib/open-in-maps";
import { toast } from "@/lib/toast";
import { isTransit, type TripLeg, type TripPattern } from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<JourneyStep["kind"], LucideIcon> = {
  walk: Footprints,
  wait: Bus,
  ride: Bus,
  rental: Zap,
  stay: MapPin,
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
  const now = useNow(1000);

  if (!journey) {
    return (
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
    );
  }

  const hasArrived = journey.arrivedAt !== null;
  // Not needed: the stay also ends when the time is up, or you walk away
  const finishable = getFinishableStopover(journey, state.location);
  return (
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

      {suggestion && <SuggestionCard suggestion={suggestion} />}

      {state.notice && !suggestion && (
        <Text className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          {state.notice}. The route has been changed.
        </Text>
      )}

      {step && (
        <StepCard step={step} now={now}>
          {finishable && (
            <Button
              variant="outline"
              icon={Check}
              onPress={() => finishStopover(finishable.id)}
            >
              {finishable.arrivedAt === null
                ? `I’m done at ${finishable.place.name}`
                : "Done here, leave now"}
            </Button>
          )}
        </StepCard>
      )}

      {hasArrived && state.report && (
        <JourneyReportView report={state.report} />
      )}

      {state.permission === "denied" && !hasArrived && <LocationDenied />}

      {!hasArrived && state.plan && (
        <RouteMap
          plan={state.plan}
          // At a stop on the way, the whole route from it is still to come
          legIndex={
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
          onChoose={chooseRoute}
        />
      )}

      {!hasArrived && <Route {...state} journey={journey} />}

      {!hasArrived && (
        <>
          <Stopovers journey={journey} finishableId={finishable?.id ?? null} />

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
  );
}

/** What to do now */
function StepCard({
  step,
  now,
  children,
}: {
  step: JourneyStep;
  now: number;
  /** Like a button to be done at a stop on the way */
  children?: ReactNode;
}) {
  const { progress } = step;
  const fraction =
    progress && progress.end > progress.start
      ? Math.max(
          0,
          Math.min(1, (now - progress.start) / (progress.end - progress.start)),
        )
      : 0;
  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3">
        {step.line ? (
          <LineBadge line={step.line} size="lg" />
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon
              as={STEP_ICONS[step.kind]}
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
  return leg.rented ? Zap : Footprints;
}

/** One leg of the route, with when it starts */
function LegRow({
  leg,
  isDone,
  isCurrent,
}: {
  leg: TripLeg;
  isDone: boolean;
  isCurrent: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-full",
          isCurrent ? "bg-yellow-400" : "bg-muted",
        )}
      >
        <Icon
          as={legIcon(leg)}
          size={13}
          className={isCurrent ? "text-black" : "text-muted-foreground"}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            "text-sm",
            isDone && "text-muted-foreground line-through",
            isCurrent && "font-semibold",
          )}
          numberOfLines={1}
        >
          {describeLeg(leg)}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {isTransit(leg)
            ? `From ${leg.from.name}${leg.from.platform ? ` ${leg.from.platform}` : ""}${leg.headsign ? ` · towards ${leg.headsign}` : ""}`
            : formatDistance(leg.distance)}
        </Text>
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
  later,
  arrival,
}: JourneyState & { journey: Journey }) {
  if (!plan) return null;
  const left = journey.stopovers.filter((stopover) => !stopover.done);
  const staying = left[0]?.arrivedAt != null ? left[0] : null;
  const next = (staying ? left.slice(1) : left)[0];
  const nextPlace = next?.place ?? journey.destination;
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
          Open the way to {nextPlace.name} in Apple Maps or Google Maps
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
          isDone={!staying && index < legIndex}
          isCurrent={!staying && index === legIndex}
        />
      ))}
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
