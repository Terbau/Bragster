import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { AppleMaps } from "expo-maps";
import { router } from "expo-router";
import { ChevronRight, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MinutesPicker } from "@/components/bus/MinutesPicker";
import { formatClock } from "@/components/bus/shared";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { FlexibleOption } from "@/lib/flexible-stop";
import { useDebouncedValue } from "@/lib/hooks";
import { addFlexibleStop, rankFlexibleStop, useJourney } from "@/lib/journey";
import type { Place } from "@/lib/places";
import { getCamera } from "@/lib/route-shape";
import type { Coordinates } from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

const clock = (time: number) => formatClock(new Date(time));

/** Like "+3 min", next to the one picked */
export function compareOption(option: FlexibleOption, best: FlexibleOption) {
  const minutes = Math.round((option.endAt - best.endAt) / 60000);
  if (minutes === 0) return "Same time";
  return minutes > 0 ? `+${minutes} min` : `${-minutes} min sooner`;
}

/** The badge that says a stop is flexible, wherever it's shown */
export function FlexibleBadge({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1 self-start rounded-full bg-violet-600 px-2 py-0.5",
        className,
      )}
    >
      <Icon as={Sparkles} size={11} className="text-white" />
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-white">
        Flexible
      </Text>
    </View>
  );
}

/**
 * Adds a flexible stop: not one place, but any `label`, like any Rema 1000
 * or any grocery store. The ones around the way are shown, best first, with
 * when you'd be there, and the best one is gone to.
 */
export function FlexibleStopPicker({
  query,
  label,
  draftContext,
  onPickOne,
  onConfirmFlexible,
}: {
  /** What was searched for, like "rema 1000" or "grocery" */
  query: string;
  /** Like "Rema 1000" or "grocery store" */
  label: string;
  /** Optional pre-trip context when adding a stop before starting a trip */
  draftContext?: {
    from: Coordinates;
    to: Place;
    when?: number;
    preferTransit?: boolean;
  };
  onPickOne: (place: Place) => void;
  onConfirmFlexible?: (
    query: string,
    label: string,
    minutes: number,
    options: FlexibleOption[],
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const { journey, location } = useJourney();
  const [minutes, setMinutes] = useState(10);
  // Debounce so spinning the iOS wheel doesn't flood Entur with dozens of batches
  const debouncedMinutes = useDebouncedValue(minutes, 400);
  const ranking = useQuery({
    queryKey: [
      "flexible",
      draftContext ? `draft:${draftContext.to.name}` : journey?.id,
      query,
      debouncedMinutes,
    ],
    queryFn: () => rankFlexibleStop(query, debouncedMinutes, draftContext),
    enabled: !!draftContext || !!journey,
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
  const options = ranking.data ?? [];
  const best = options[0];
  const destination = draftContext?.to ?? journey?.destination ?? null;
  const next = destination?.name ?? "where you’re going";
  const isWaitingForDebounce = minutes !== debouncedMinutes;

  return (
    <View className="flex-1 bg-background">
      {Platform.OS === "ios" && (
        <View className="h-64 bg-muted">
          {best && (
            <OptionsMap
              // Looks at the first ones found, not again on every change
              key={query}
              options={options}
              destination={destination}
              location={draftContext?.from ?? location}
            />
          )}
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 20 }}
      >
        <View className="gap-2 rounded-xl border-2 border-violet-600 bg-card p-4">
          <FlexibleBadge />
          <Text className="text-lg font-semibold">Best {label} on the way</Text>
          <Text className="text-sm text-muted-foreground">
            You don’t pick which one. The {label} that gets you to {next}{" "}
            soonest is picked, with your stay. It’s picked again on the way if
            another gets quicker, like after a missed bus. Walking into another
            one of these counts too.
          </Text>
        </View>

        <MinutesPicker value={minutes} onChange={setMinutes} />

        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Right now · tap one to go to only that one
            </Text>
            {(ranking.isFetching || isWaitingForDebounce) && <Spinner />}
          </View>
          {ranking.isPending ? (
            <Text className="py-6 text-center text-sm text-muted-foreground">
              Working out the routes via every {label} on the way…
            </Text>
          ) : ranking.error ? (
            <ErrorState error={ranking.error} onRetry={ranking.refetch} />
          ) : options.length === 0 ? (
            <Text className="py-6 text-center text-sm text-muted-foreground">
              No {label} with a route was found on the way.
            </Text>
          ) : (
            options.map((option, index) => (
              <OptionRow
                key={`${option.place.latitude}/${option.place.longitude}`}
                option={option}
                compared={
                  index === 0 ? null : compareOption(option, options[0])
                }
                next={next}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onPickOne(option.place);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
      <View
        className="border-t border-border bg-background px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <Button
          icon={Sparkles}
          disabled={!best || ranking.isPlaceholderData || isWaitingForDebounce}
          onPress={() => {
            void Haptics.selectionAsync();
            if (onConfirmFlexible) {
              onConfirmFlexible(query, label, debouncedMinutes, options);
            } else {
              addFlexibleStop(query, label, debouncedMinutes, options);
              router.back();
            }
          }}
        >
          {best
            ? `Add flexible stop · ${best.place.name}`
            : "Add flexible stop"}
        </Button>
      </View>
    </View>
  );
}

function OptionRow({
  option,
  compared,
  next,
  onPress,
}: {
  option: FlexibleOption;
  /** Null for the best one */
  compared: string | null;
  next: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 rounded-xl border bg-card px-4 py-3 active:bg-accent",
        compared === null ? "border-violet-600" : "border-border",
      )}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {option.place.name}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          There {clock(option.arriveAt)} · at {next} {clock(option.endAt)}
        </Text>
      </View>
      {compared === null ? (
        <Text className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
          Best
        </Text>
      ) : (
        <Text className="text-xs tabular-nums text-muted-foreground">
          {compared}
        </Text>
      )}
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

/** Where they all are, the best one marked, and how much later the others are */
function OptionsMap({
  options,
  destination,
  location,
}: {
  options: FlexibleOption[];
  destination: Place | null;
  location: Coordinates | null;
}) {
  const [camera] = useState(() =>
    getCamera([
      ...options.map((option) => option.place),
      ...(location ? [location] : []),
      ...(destination ? [destination] : []),
    ]),
  );
  if (!camera) return null;
  return (
    <AppleMaps.View
      style={{ flex: 1 }}
      cameraPosition={camera}
      annotations={options.map((option, index) => ({
        id: `option-${index}`,
        coordinates: {
          latitude: option.place.latitude,
          longitude: option.place.longitude,
        },
        text:
          index === 0
            ? `Best · ${clock(option.arriveAt)}`
            : compareOption(option, options[0]),
        textColor: index === 0 ? "#ffffff" : "#0f172a",
        backgroundColor: index === 0 ? "#7c3aed" : "#e2e8f0",
      }))}
      markers={
        destination
          ? [
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
            ]
          : []
      }
      properties={{ isMyLocationEnabled: location !== null }}
      uiSettings={{ togglePitchEnabled: false, compassEnabled: false }}
    />
  );
}
