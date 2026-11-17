import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Radio } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, View } from "react-native";
import {
  delayText,
  formatClock,
  formatMinutesUntil,
  LineBadge,
  useNow,
} from "@/components/bus/shared";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { trackBus, useBusTracking } from "@/lib/bus-tracking";
import { useColors } from "@/lib/color-scheme";
import { type Departure, fetchDepartures, type StopQuay } from "@/lib/entur";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** How many departures each part of the stop shows, with all parts listed */
const DEPARTURES_PER_PART = 4;

const departureKey = (departure: Departure) =>
  `${departure.journeyId}/${departure.date}/${departure.stopPosition}`;

/** Like "Towards Lohove, Strindheim" */
const towardsText = (quay: StopQuay) =>
  quay.towards.length > 0 ? `Towards ${quay.towards.join(", ")}` : null;

/** Like "P1", or "Towards Lohove" for a side of the road without a name */
const quayLabel = (quay: StopQuay) =>
  quay.platform ??
  (quay.towards[0]
    ? `Towards ${quay.towards[0]}`
    : (quay.description ?? "Stop"));

export default function DeparturesScreen() {
  const { stopId, name } = useLocalSearchParams<{
    stopId: string;
    name?: string;
  }>();
  const { colors } = useColors();
  const now = useNow(15 * 1000);
  const { bus } = useBusTracking();
  const [quayId, setQuayId] = useState<string | null>(null);
  const [startingKey, setStartingKey] = useState<string | null>(null);

  const { data, error, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["bus-departures", stopId],
    queryFn: () => fetchDepartures(stopId),
    staleTime: 0,
    refetchInterval: 30 * 1000,
  });
  const stopName = data?.name ?? name ?? "Stop";

  // The parts of the stop: its platforms, or the sides of the road
  const quays = data?.quays;
  const sections = useMemo(() => {
    const all = quays ?? [];
    const picked = all.find((quay) => quay.id === quayId);
    return (picked ? [picked] : all).map((quay) => ({
      quay,
      data:
        picked || all.length === 1
          ? quay.departures
          : quay.departures.slice(0, DEPARTURES_PER_PART),
    }));
  }, [quays, quayId]);
  const hasParts = (quays?.length ?? 0) > 1;

  const follow = async (departure: Departure) => {
    void Haptics.selectionAsync();
    setStartingKey(departureKey(departure));
    try {
      const isShown = await trackBus(
        { id: stopId, name: stopName, locality: null },
        departure,
      );
      if (isShown) toast.success("Shown on the Lock Screen");
      router.push("/bus/trip");
    } catch (failure) {
      // Still followed in the app
      toast.error(
        failure instanceof Error ? failure.message : "Couldn't follow the bus",
      );
      router.push("/bus/trip");
    } finally {
      setStartingKey(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: stopName }} />
      <SectionList
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        sections={sections}
        keyExtractor={departureKey}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View className="gap-3 pb-4">
            <Text className="text-sm text-muted-foreground">
              Tap a bus to follow it to {stopName}.
            </Text>
            {hasParts && (
              <View className="flex-row flex-wrap gap-2">
                {[null, ...(quays ?? [])].map((option) => {
                  const isSelected = (option?.id ?? null) === quayId;
                  return (
                    <Pressable
                      key={option?.id ?? "all"}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setQuayId(option?.id ?? null)}
                      className={cn(
                        "rounded-full border px-3 py-1.5",
                        isSelected
                          ? "border-foreground bg-foreground"
                          : "border-border bg-background active:bg-accent",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xs font-semibold",
                          isSelected ? "text-background" : "text-foreground",
                        )}
                      >
                        {option ? quayLabel(option) : "All"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) =>
          hasParts ? <QuayHeader quay={section.quay} /> : null
        }
        renderSectionFooter={({ section }) => {
          const more = section.quay.departures.length - section.data.length;
          return (
            <View className="pb-6 pt-2">
              {more > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setQuayId(section.quay.id)}
                  className="items-center rounded-xl py-2 active:bg-accent"
                >
                  <Text className="text-xs font-semibold text-muted-foreground">
                    Show {more} more from {quayLabel(section.quay)}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <DepartureRow
            departure={item}
            now={now}
            isFollowed={
              !!bus &&
              bus.journeyId === item.journeyId &&
              bus.date === item.date &&
              bus.stopPosition === item.stopPosition
            }
            isStarting={startingKey === departureKey(item)}
            disabled={startingKey !== null}
            onPress={() => void follow(item)}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <Spinner className="py-16" />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <Text className="py-16 text-center text-sm text-muted-foreground">
              No departures in the next 3 hours
            </Text>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.mutedForeground}
          />
        }
      />
    </>
  );
}

/** One part of the stop, above its departures */
function QuayHeader({ quay }: { quay: StopQuay }) {
  const towards = towardsText(quay);
  return (
    <View className="flex-row items-center gap-3 pb-3">
      {quay.platform && (
        <View className="h-7 min-w-9 items-center justify-center rounded-md bg-foreground px-1.5">
          <Text className="text-sm font-extrabold text-background">
            {quay.platform}
          </Text>
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold" numberOfLines={1}>
          {towards ?? quay.description ?? "Stop"}
        </Text>
        {towards && quay.description && (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {quay.description}
          </Text>
        )}
      </View>
    </View>
  );
}

function DepartureRow({
  departure,
  now,
  isFollowed,
  isStarting,
  disabled,
  onPress,
}: {
  departure: Departure;
  now: number;
  isFollowed: boolean;
  isStarting: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const delay = delayText(
    departure.aimedArrival,
    departure.expectedArrival,
    departure.realtime,
  );
  const details = [
    departure.cancelled
      ? `Cancelled, was ${formatClock(departure.aimedArrival)}`
      : formatClock(departure.expectedArrival),
    !departure.cancelled && delay,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Follows the bus to this stop"
      disabled={disabled || departure.cancelled}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 rounded-xl border bg-card px-4 py-3 active:bg-accent",
        isFollowed ? "border-foreground" : "border-border",
        departure.cancelled && "opacity-50",
      )}
    >
      <LineBadge line={departure.line} />
      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            "text-sm font-medium",
            departure.cancelled && "line-through",
          )}
          numberOfLines={1}
        >
          {departure.destination}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {details.join(" · ")}
          {isFollowed ? " · Following" : ""}
        </Text>
      </View>
      {isStarting ? (
        <Spinner />
      ) : (
        !departure.cancelled && (
          <View className="flex-row items-center gap-1.5">
            {departure.realtime && (
              <Icon as={Radio} size={12} className="text-green-600" />
            )}
            <Text className="text-base font-semibold tabular-nums">
              {formatMinutesUntil(departure.expectedArrival, now)}
            </Text>
          </View>
        )
      )}
    </Pressable>
  );
}
