import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Building2,
  Bus,
  ChevronRight,
  Home,
  MapPin,
  MapPinned,
  Search,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Keyboard, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlaceMap } from "@/components/bus/PlaceMap";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useDebouncedValue } from "@/lib/hooks";
import { addStopover, startJourney, useJourney } from "@/lib/journey";
import { formatDistance, metresBetween } from "@/lib/journey-logic";
import {
  findAddress,
  getRecentPlaces,
  type Place,
  searchPlaces,
} from "@/lib/places";
import type { Coordinates } from "@/lib/trip-planner";
import { cn } from "@/lib/utils";

/** How long a stop on the way can be stayed at, in minutes */
const MINUTES = [5, 10, 15, 20, 30, 45, 60];
/** Where the map starts when it's not known where you are */
const TRONDHEIM = { latitude: 63.4305, longitude: 10.3951 };
/** A pin moved less than this is still on the place, in metres */
const MOVED_M = 25;

const KIND_ICONS = {
  address: Home,
  street: MapPin,
  stop: Bus,
  place: Building2,
  pin: MapPinned,
};

/**
 * Finds a place to go: the destination of a new trip, or with `for=stopover`,
 * a stop on the way of the trip that's on. A place picked is shown on a map
 * before it's used, and the pin can be moved.
 */
export default function PlaceScreen() {
  const params = useLocalSearchParams<{ for?: string }>();
  const isStopover = params.for === "stopover";
  const { location } = useJourney();
  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), 300);
  const isSearching = query.length >= 2;
  const [recent, setRecent] = useState<Place[]>([]);
  const [picked, setPicked] = useState<Place | null>(null);

  useEffect(() => {
    void getRecentPlaces().then(setRecent);
  }, []);

  // Places near you first, but not searched again as you move
  const [near] = useState(location);
  const search = useQuery({
    queryKey: ["places", query],
    queryFn: () => searchPlaces(query, near),
    enabled: isSearching,
    staleTime: 10 * 60 * 1000,
  });

  const pick = (place: Place) => {
    Keyboard.dismiss();
    void Haptics.selectionAsync();
    setPicked(place);
  };

  if (picked) {
    return (
      <PickedPlace
        // A new place starts a new map
        key={`${picked.name}/${picked.latitude}/${picked.longitude}`}
        place={picked}
        isStopover={isStopover}
        location={location}
        onBack={() => setPicked(null)}
      />
    );
  }

  const places = isSearching ? (search.data ?? []) : recent;
  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={places}
      keyExtractor={(place) =>
        `${place.name}/${place.latitude}/${place.longitude}`
      }
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          <Stack.Screen
            options={{ title: isStopover ? "Add a stop" : "Where to?" }}
          />
          <View className="justify-center">
            <Input
              value={text}
              onChangeText={setText}
              placeholder={
                isStopover
                  ? "A shop, a place or an address"
                  : "An address, a place or a stop"
              }
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              className="pl-10"
            />
            <View className="absolute left-3" pointerEvents="none">
              <Icon as={Search} size={18} className="text-muted-foreground" />
            </View>
          </View>
          {!isSearching && Platform.OS === "ios" && (
            <PlaceRow
              place={{
                kind: "pin",
                name: "Choose on the map",
                detail: isStopover
                  ? "Put a pin where you want to stop"
                  : "Put a pin where you’re going",
                ...(location ?? TRONDHEIM),
              }}
              location={null}
              onPress={() =>
                pick({
                  kind: "pin",
                  name: "Pin on the map",
                  detail: null,
                  ...(location ?? TRONDHEIM),
                })
              }
            />
          )}
          {!isSearching && recent.length > 0 && (
            <Text className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent places
            </Text>
          )}
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => (
        <PlaceRow place={item} location={location} onPress={() => pick(item)} />
      )}
      ListEmptyComponent={
        !isSearching ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            {isStopover
              ? "Search for where you want to stop on the way, like “Rema 1000 Elgeseter”."
              : "Search for an address like “Fossegrenda 9”, or a place like “Havet Arena”."}
          </Text>
        ) : search.isPending ? (
          <Spinner className="py-10" />
        ) : search.error ? (
          <ErrorState error={search.error} onRetry={search.refetch} />
        ) : (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Nothing called “{query}”
          </Text>
        )
      }
    />
  );
}

function PlaceRow({
  place,
  location,
  onPress,
}: {
  place: Place;
  /** To say how far away it is */
  location: Coordinates | null;
  onPress: () => void;
}) {
  const detail = [
    place.detail,
    location ? formatDistance(metresBetween(location, place)) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon
          as={KIND_ICONS[place.kind ?? "street"]}
          size={16}
          className="text-muted-foreground"
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {place.name}
        </Text>
        {detail.length > 0 && (
          <Text
            className="mt-0.5 text-xs text-muted-foreground"
            numberOfLines={1}
          >
            {detail}
          </Text>
        )}
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}

/**
 * A place on a map, to check it's the right one before going there. Tapping
 * the map moves the pin, like to the entrance, and the place is then named
 * by the address nearest the pin.
 */
function PickedPlace({
  place,
  isStopover,
  location,
  onBack,
}: {
  place: Place;
  isStopover: boolean;
  location: Coordinates | null;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<Coordinates>(place);
  /** A pin of its own starts where you are, which is no place to go */
  const [hasTapped, setHasTapped] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [isStarting, setIsStarting] = useState(false);
  const isPinned = place.kind === "pin";
  const isMoved = isPinned ? hasTapped : metresBetween(place, pin) > MOVED_M;

  const address = useQuery({
    queryKey: ["address", pin.latitude.toFixed(5), pin.longitude.toFixed(5)],
    queryFn: () => findAddress(pin),
    enabled: isMoved,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const nearest = isMoved ? address.data : null;

  // A place keeps its name when the pin is moved, like to its entrance. A
  // pin of its own is named after the address it's at.
  const name = isPinned
    ? !hasTapped
      ? "No pin yet"
      : (nearest?.name ??
        (address.isPending ? "Finding the address…" : place.name))
    : place.name;
  const detail = !isMoved
    ? place.detail
    : nearest
      ? isPinned
        ? nearest.detail
        : `Pin near ${nearest.name}`
      : isPinned
        ? null
        : "Pin moved";
  const result: Place = {
    kind: isPinned ? (nearest ? "address" : "pin") : place.kind,
    name: isPinned && !nearest ? "Pin on the map" : name,
    detail,
    latitude: pin.latitude,
    longitude: pin.longitude,
  };
  const isReady = !isPinned || (hasTapped && !address.isPending);

  const go = async () => {
    void Haptics.selectionAsync();
    if (isStopover) {
      addStopover(result, minutes);
      router.back();
      return;
    }
    setIsStarting(true);
    try {
      await startJourney(result);
    } finally {
      setIsStarting(false);
    }
    router.replace("/bus/journey");
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{ title: isStopover ? "Add a stop" : "Go here?" }}
      />
      <View className="flex-1">
        <PlaceMap
          className="flex-1"
          pin={pin}
          showsPin={!isPinned || hasTapped}
          title={result.name}
          showsLocation={location !== null}
          onMove={(next) => {
            void Haptics.selectionAsync();
            setPin(next);
            setHasTapped(true);
          }}
        />
        {Platform.OS === "ios" && (
          <View
            pointerEvents="none"
            className="absolute left-0 right-0 top-3 items-center"
          >
            <View className="rounded-full bg-background/90 px-3 py-1.5">
              <Text className="text-xs font-medium text-muted-foreground">
                {isPinned
                  ? isStopover
                    ? "Tap the map where you want to stop"
                    : "Tap the map where you’re going"
                  : "Tap the map to move the pin, like to the entrance"}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View
        className="gap-5 border-t border-border bg-background px-5 pt-5"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View>
          <Text className="text-lg font-semibold" numberOfLines={2}>
            {name}
          </Text>
          {(detail || location) && (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {[
                detail,
                location
                  ? `${formatDistance(metresBetween(location, pin))} away`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>
        {isStopover && (
          <View className="gap-3">
            <Text className="text-sm font-medium">How long do you stay?</Text>
            <View className="flex-row flex-wrap gap-2">
              {MINUTES.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: minutes === option }}
                  onPress={() => setMinutes(option)}
                  className={cn(
                    "rounded-full border px-4 py-2",
                    minutes === option
                      ? "border-foreground bg-foreground"
                      : "border-border bg-background active:bg-accent",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      minutes === option
                        ? "text-background"
                        : "text-foreground",
                    )}
                  >
                    {option} min
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <View className="gap-2">
          <Button
            disabled={!isReady}
            isLoading={isStarting}
            onPress={() => void go()}
          >
            {isStopover ? "Add to the trip" : "Go here"}
          </Button>
          <Button variant="ghost" onPress={onBack}>
            Pick another place
          </Button>
        </View>
      </View>
    </View>
  );
}
