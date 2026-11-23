import { useQueries, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import {
  Briefcase,
  ChevronRight,
  Clock,
  Home,
  LocateFixed,
  MapPin,
  Plus,
  Search,
  Settings,
  Star,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JourneyCard } from "@/components/bus/JourneyCard";
import { formatMinutesUntil, LineBadge, useNow } from "@/components/bus/shared";
import { TrackedBusCard } from "@/components/bus/TrackedBusCard";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  type SavedPlace,
  toggleFavoriteStop,
  useBusPreferences,
} from "@/lib/bus-preferences";
import { getRecentStops } from "@/lib/bus-tracking";
import type { Coordinates } from "@/lib/bus-utils";
import {
  type BusStop,
  fetchDepartures,
  fetchNearbyStops,
  type NearbyStop,
  searchStops,
} from "@/lib/entur";
import { useDebouncedValue } from "@/lib/hooks";
import { startJourney } from "@/lib/journey";
import { formatDistance } from "@/lib/journey-logic";
import { getOneShotLocation } from "@/lib/location";
import { toast } from "@/lib/toast";

const SAVED_ICONS = {
  home: Home,
  work: Briefcase,
  star: Star,
};

export default function BusScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), 250);
  const isSearching = query.length >= 2;
  const [recentStops, setRecentStops] = useState<BusStop[]>([]);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [startingPlaceId, setStartingPlaceId] = useState<string | null>(null);
  const { favoriteStops, savedPlaces, history } = useBusPreferences();
  const now = useNow(15 * 1000);

  // Stops picked on the departures screen show up when coming back, and refresh nearby coords
  useFocusEffect(
    useCallback(() => {
      void getRecentStops().then(setRecentStops);
      void getOneShotLocation(false).then((loc) => {
        if (loc) setCoords(loc);
      });
    }, []),
  );

  const search = useQuery({
    queryKey: ["bus-stops", query],
    queryFn: () => searchStops(query),
    enabled: isSearching,
    staleTime: 60 * 60 * 1000,
  });

  const nearby = useQuery({
    queryKey: [
      "bus-nearby-stops",
      coords?.latitude.toFixed(3),
      coords?.longitude.toFixed(3),
    ],
    queryFn: () => fetchNearbyStops(coords!, 800, 6),
    enabled: !!coords && !isSearching,
    staleTime: 2 * 60 * 1000,
  });

  // Live next 2 departures for each pinned stop
  const favoriteQueries = useQueries({
    queries: favoriteStops.map((stop) => ({
      queryKey: ["bus-departures-preview", stop.id],
      queryFn: () => fetchDepartures(stop.id),
      enabled: !isSearching,
      staleTime: 25 * 1000,
      refetchInterval: 30 * 1000,
    })),
  });

  const askForNearby = async () => {
    void Haptics.selectionAsync();
    const loc = await getOneShotLocation(true);
    if (loc) setCoords(loc);
    else toast.error("Allow location to see nearby stops");
  };

  const quickStartSaved = async (saved: SavedPlace) => {
    if (startingPlaceId) return;
    void Haptics.selectionAsync();
    setStartingPlaceId(saved.id);
    try {
      await startJourney(saved.place);
      router.push("/bus/journey");
    } finally {
      setStartingPlaceId(null);
    }
  };

  const favoriteIds = new Set(favoriteStops.map((s) => s.id));
  const nonFavoriteRecent = recentStops.filter((s) => !favoriteIds.has(s.id));
  const nearbyStops = (nearby.data ?? []).filter((s) => !favoriteIds.has(s.id));
  const stops = isSearching ? (search.data ?? []) : nonFavoriteRecent;

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: 32,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={stops}
      keyExtractor={(stop) => stop.id}
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-3xl font-bold tracking-tight">Bus</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Plan live trips or follow AtB buses in Trondheim.
              </Text>
            </View>
            <View className="flex-row items-center gap-1 pt-1">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Trip history"
                onPress={() => router.push("/bus/history")}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-card active:bg-accent"
              >
                <Icon as={Clock} size={17} className="text-foreground" />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bus settings"
                onPress={() => router.push("/bus/settings")}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-card active:bg-accent"
              >
                <Icon as={Settings} size={17} className="text-foreground" />
              </Pressable>
            </View>
          </View>

          <JourneyCard />
          <TrackedBusCard />

          {/* Quick-start saved places (Home, Work, etc.) */}
          {!isSearching && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {savedPlaces.map((saved) => (
                <Pressable
                  key={saved.id}
                  accessibilityRole="button"
                  disabled={startingPlaceId !== null}
                  onPress={() => void quickStartSaved(saved)}
                  className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 active:bg-accent"
                >
                  {startingPlaceId === saved.id ? (
                    <Spinner />
                  ) : (
                    <Icon
                      as={SAVED_ICONS[saved.icon]}
                      size={14}
                      className="text-foreground"
                    />
                  )}
                  <Text className="text-xs font-semibold">{saved.label}</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/bus/settings")}
                className="flex-row items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 py-2 active:bg-accent"
              >
                <Icon as={Plus} size={13} className="text-muted-foreground" />
                <Text className="text-xs font-medium text-muted-foreground">
                  {savedPlaces.length === 0 ? "Save Home / Work" : "Places"}
                </Text>
              </Pressable>
              {history.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/bus/history")}
                  className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 active:bg-accent"
                >
                  <Icon
                    as={Clock}
                    size={13}
                    className="text-muted-foreground"
                  />
                  <Text className="text-xs font-medium text-muted-foreground">
                    {history.length} past trip{history.length === 1 ? "" : "s"}
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}

          <View className="justify-center">
            <Input
              value={text}
              onChangeText={setText}
              placeholder="Search for a stop"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              className="pl-10"
            />
            <View className="absolute left-3" pointerEvents="none">
              <Icon as={Search} size={18} className="text-muted-foreground" />
            </View>
          </View>

          {/* Pinned / Favorite Stops with inline next departures */}
          {!isSearching && favoriteStops.length > 0 && (
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pinned stops
              </Text>
              {favoriteStops.map((stop, index) => {
                const depData = favoriteQueries[index]?.data;
                const upcoming = (depData?.quays ?? [])
                  .flatMap((q) => q.departures)
                  .filter((d) => !d.cancelled)
                  .sort(
                    (a, b) =>
                      a.expectedArrival.getTime() - b.expectedArrival.getTime(),
                  )
                  .slice(0, 2);
                return (
                  <Pressable
                    key={stop.id}
                    accessibilityRole="button"
                    onPress={() => {
                      Keyboard.dismiss();
                      router.push({
                        pathname: "/bus/[stopId]",
                        params: { stopId: stop.id, name: stop.name },
                      });
                    }}
                    className="gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
                  >
                    <View className="flex-row items-center gap-3">
                      <Icon
                        as={Star}
                        size={16}
                        className="text-amber-500"
                        fill="#f59e0b"
                      />
                      <Text
                        className="min-w-0 flex-1 text-sm font-semibold"
                        numberOfLines={1}
                      >
                        {stop.name}
                      </Text>
                      <Icon
                        as={ChevronRight}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </View>
                    {upcoming.length > 0 && (
                      <View className="gap-1.5 pl-7">
                        {upcoming.map((dep) => (
                          <View
                            key={`${dep.journeyId}/${dep.date}/${dep.stopPosition}`}
                            className="flex-row items-center gap-2"
                          >
                            <LineBadge
                              line={dep.line}
                              mode={dep.mode}
                              submode={dep.submode}
                            />
                            <Text
                              className="min-w-0 flex-1 text-xs text-muted-foreground"
                              numberOfLines={1}
                            >
                              {dep.destination}
                            </Text>
                            <Text className="text-xs font-semibold tabular-nums">
                              {formatMinutesUntil(dep.expectedArrival, now)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Nearby stops */}
          {!isSearching && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nearby stops
                </Text>
                {!coords && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void askForNearby()}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <Icon
                      as={LocateFixed}
                      size={13}
                      className="text-foreground"
                    />
                    <Text className="text-xs font-semibold text-foreground">
                      Find nearby
                    </Text>
                  </Pressable>
                )}
              </View>
              {coords && nearby.isPending ? (
                <Spinner className="py-4" />
              ) : nearbyStops.length > 0 ? (
                <View className="gap-2">
                  {nearbyStops.map((stop) => (
                    <StopRow
                      key={stop.id}
                      stop={stop}
                      distance={stop.distance}
                      isFavorite={false}
                      onToggleFavorite={() => {
                        void Haptics.selectionAsync();
                        toggleFavoriteStop({
                          id: stop.id,
                          name: stop.name,
                          locality: stop.locality,
                        });
                      }}
                    />
                  ))}
                </View>
              ) : coords ? (
                <Text className="text-xs text-muted-foreground">
                  No stops found within 800 m.
                </Text>
              ) : null}
            </View>
          )}

          {!isSearching && nonFavoriteRecent.length > 0 && (
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent stops
            </Text>
          )}
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => (
        <StopRow
          stop={item}
          isFavorite={favoriteIds.has(item.id)}
          onToggleFavorite={() => {
            void Haptics.selectionAsync();
            toggleFavoriteStop(item);
          }}
        />
      )}
      ListEmptyComponent={
        !isSearching ? (
          favoriteStops.length === 0 && nearbyStops.length === 0 ? (
            <Text className="py-10 text-center text-sm text-muted-foreground">
              Search for the stop you take the bus from.
            </Text>
          ) : null
        ) : search.isPending ? (
          <Spinner className="py-10" />
        ) : search.error ? (
          <ErrorState error={search.error} onRetry={search.refetch} />
        ) : (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            No stops called “{query}”
          </Text>
        )
      }
    />
  );
}

function StopRow({
  stop,
  distance,
  isFavorite,
  onToggleFavorite,
}: {
  stop: BusStop | NearbyStop;
  distance?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const subtitle = [
    distance !== undefined ? `${formatDistance(distance)} away` : null,
    stop.locality,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Keyboard.dismiss();
        router.push({
          pathname: "/bus/[stopId]",
          params: { stopId: stop.id, name: stop.name },
        });
      }}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon as={MapPin} size={16} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {stop.name}
        </Text>
        {subtitle.length > 0 && (
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? "Unpin stop" : "Pin stop"}
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        className="h-8 w-8 items-center justify-center rounded-lg active:bg-muted"
      >
        <Icon
          as={Star}
          size={16}
          className={isFavorite ? "text-amber-500" : "text-muted-foreground"}
          fill={isFavorite ? "#f59e0b" : "none"}
        />
      </Pressable>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
