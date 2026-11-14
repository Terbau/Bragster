import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { ChevronRight, MapPin, Search } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Keyboard, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formatMinutesUntil,
  LineBadge,
  statusText,
  useNow,
} from "@/components/bus/shared";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { getRecentStops, useBusTracking } from "@/lib/bus-tracking";
import { type BusStop, searchStops } from "@/lib/entur";
import { useDebouncedValue } from "@/lib/hooks";

export default function BusScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), 250);
  const isSearching = query.length >= 2;
  const [recentStops, setRecentStops] = useState<BusStop[]>([]);

  // Stops picked on the departures screen show up when coming back
  useFocusEffect(
    useCallback(() => {
      void getRecentStops().then(setRecentStops);
    }, []),
  );

  const search = useQuery({
    queryKey: ["bus-stops", query],
    queryFn: () => searchStops(query),
    enabled: isSearching,
    staleTime: 60 * 60 * 1000,
  });

  const stops = isSearching ? (search.data ?? []) : recentStops;

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={stops}
      keyExtractor={(stop) => stop.id}
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          <View>
            <Text className="text-3xl font-bold tracking-tight">Bus</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Pick a bus at your stop in Trondheim to see where it is and when
              it gets there, on the Lock Screen too.
            </Text>
          </View>
          <TrackedBusCard />
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
          {!isSearching && recentStops.length > 0 && (
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent stops
            </Text>
          )}
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => <StopRow stop={item} />}
      ListEmptyComponent={
        !isSearching ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Search for the stop you take the bus from.
          </Text>
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

function StopRow({ stop }: { stop: BusStop }) {
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
      className="flex-row items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon as={MapPin} size={16} className="text-muted-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {stop.name}
        </Text>
        {stop.locality && (
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {stop.locality}
          </Text>
        )}
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

/** The bus being followed, to open it again */
function TrackedBusCard() {
  const { bus, progress } = useBusTracking();
  const now = useNow(15 * 1000);
  if (!bus) return null;

  const isOnItsWay =
    progress?.status === "coming" || progress?.status === "approaching";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/bus/trip")}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <LineBadge line={bus.line} />
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {bus.destination}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {progress ? statusText(progress) : `To ${bus.stopName}`}
        </Text>
      </View>
      {isOnItsWay && progress && (
        <Text className="text-base font-semibold tabular-nums">
          {formatMinutesUntil(progress.stop.expectedArrival, now)}
        </Text>
      )}
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
