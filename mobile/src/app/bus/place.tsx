import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Briefcase,
  Building2,
  Bus,
  ChevronRight,
  Home,
  MapPin,
  MapPinned,
  Plus,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FlexibleBadge,
  FlexibleStopPicker,
} from "@/components/bus/FlexibleStopPicker";
import { MinutesPicker } from "@/components/bus/MinutesPicker";
import { PlaceMap } from "@/components/bus/PlaceMap";
import {
  defaultTripTime,
  TripTimePicker,
  type TripTimeMode,
} from "@/components/bus/TripTimePicker";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { savePlaceShortcut, useBusPreferences } from "@/lib/bus-preferences";
import { TRONDHEIM } from "@/lib/bus-utils";
import { useDebouncedValue } from "@/lib/hooks";
import {
  addStopover,
  type DraftStopover,
  type JourneySchedule,
  startJourney,
  useJourney,
} from "@/lib/journey";
import { formatDistance, formatWhen, metresBetween } from "@/lib/journey-logic";
import { formatDuration } from "@/lib/journey-report";
import { getOneShotLocation } from "@/lib/location";
import {
  FLEXIBLE_CATEGORIES,
  findAddress,
  getChainName,
  getRecentPlaces,
  matchCategory,
  type Place,
  searchPlaces,
} from "@/lib/places";
import { toast } from "@/lib/toast";
import type { Coordinates } from "@/lib/trip-planner";

/** A pin moved less than this is still on the place, in metres */
const MOVED_M = 25;

const KIND_ICONS = {
  address: Home,
  street: MapPin,
  stop: Bus,
  place: Building2,
  pin: MapPinned,
};

const SAVED_ICONS = {
  home: Home,
  work: Briefcase,
  star: Star,
};

/**
 * Finds a place to go: the destination of a new trip, with `for=stopover` a
 * stop on the way of the trip that's on, or with `for=saved` a saved shortcut.
 */
export default function PlaceScreen() {
  const params = useLocalSearchParams<{
    for?: string;
    preset?: "home" | "work" | "star";
  }>();
  const isStopover = params.for === "stopover";
  const isSavingShortcut = params.for === "saved";
  const shortcutIcon = params.preset ?? "star";

  const { location: trackedLocation } = useJourney();
  const { savedPlaces } = useBusPreferences();
  const [oneShot, setOneShot] = useState<Coordinates | null>(null);
  const location = trackedLocation ?? oneShot;

  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), 300);
  const isSearching = query.length >= 2;
  const [recent, setRecent] = useState<Place[]>([]);
  const [picked, setPicked] = useState<Place | null>(null);
  /** Any of a kind, like any Rema 1000 or grocery store, to pick the best one */
  const [flexible, setFlexible] = useState<{
    query: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    void getRecentPlaces().then(setRecent);
    if (!trackedLocation) {
      void getOneShotLocation(false).then((loc) => {
        if (loc) setOneShot(loc);
      });
    }
  }, [trackedLocation]);

  // Places near you first, but not searched again as you move
  const [near] = useState<Coordinates | null>(trackedLocation);
  const search = useQuery({
    queryKey: ["places", query],
    queryFn: () => searchPlaces(query, near ?? oneShot),
    enabled: isSearching,
    staleTime: 10 * 60 * 1000,
  });

  const pick = (place: Place) => {
    Keyboard.dismiss();
    void Haptics.selectionAsync();
    setPicked(place);
  };

  const title = picked
    ? isSavingShortcut
      ? "Save place"
      : isStopover
        ? "Add a stop"
        : "Go here?"
    : flexible
      ? "Flexible stop"
      : isSavingShortcut
        ? shortcutIcon === "home"
          ? "Set Home"
          : shortcutIcon === "work"
            ? "Set Work"
            : "Save a place"
        : isStopover
          ? "Add a stop"
          : "Where to?";

  // Keep a single memoized Stack.Screen at the top level so sub-views and typing
  // don't unmount/rebuild the native navigation header or break the Back button.
  const screenOptions = useMemo(() => ({ title }), [title]);

  if (picked) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <PickedPlace
          // A new place starts a new map
          key={`${picked.name}/${picked.latitude}/${picked.longitude}`}
          place={picked}
          isStopover={isStopover}
          isSavingShortcut={isSavingShortcut}
          shortcutIcon={shortcutIcon}
          location={location}
          onBack={() => setPicked(null)}
        />
      </>
    );
  }

  if (flexible) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <FlexibleStopPicker
          query={flexible.query}
          label={flexible.label}
          onPickOne={setPicked}
        />
      </>
    );
  }

  const places = isSearching ? (search.data ?? []) : recent;
  // Category match (e.g. "grocery", "apotek") or multi-branch chain (e.g. "Rema 1000")
  const matchedCat = isStopover && isSearching ? matchCategory(query) : null;
  const chainName =
    isStopover && isSearching && !matchedCat && search.data
      ? getChainName(query, search.data)
      : null;
  const flexibleMatch = matchedCat
    ? { query: matchedCat.query, label: matchedCat.label }
    : chainName
      ? { query, label: chainName }
      : null;

  return (
    <>
      <Stack.Screen options={screenOptions} />
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
            <View className="justify-center">
              <Input
                value={text}
                onChangeText={setText}
                placeholder={
                  isStopover
                    ? "A shop, category (grocery, pharmacy), or address"
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

            {/* Saved Places quick chips */}
            {!isSearching && !isSavingShortcut && savedPlaces.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {savedPlaces.map((saved) => (
                  <Pressable
                    key={saved.id}
                    accessibilityRole="button"
                    onPress={() => pick(saved.place)}
                    className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 active:bg-accent"
                  >
                    <Icon
                      as={SAVED_ICONS[saved.icon]}
                      size={14}
                      className="text-foreground"
                    />
                    <Text className="text-xs font-semibold">{saved.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Category-based flexible stop presets */}
            {!isSearching && isStopover && (
              <View className="gap-2">
                <View className="flex-row items-center gap-1.5">
                  <Icon as={Sparkles} size={13} className="text-violet-600" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Best on the way
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {FLEXIBLE_CATEGORIES.map((category) => (
                    <Pressable
                      key={category.id}
                      accessibilityRole="button"
                      onPress={() => {
                        Keyboard.dismiss();
                        void Haptics.selectionAsync();
                        setFlexible({
                          query: category.query,
                          label: category.label,
                        });
                      }}
                      className="flex-row items-center gap-1.5 rounded-full border border-violet-600/50 bg-violet-600/10 px-3.5 py-2 active:opacity-75"
                    >
                      <Icon
                        as={Sparkles}
                        size={12}
                        className="text-violet-600"
                      />
                      <Text className="text-xs font-semibold capitalize text-violet-700 dark:text-violet-300">
                        {category.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

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
            {flexibleMatch && (
              <FlexibleRow
                label={flexibleMatch.label}
                onPress={() => {
                  Keyboard.dismiss();
                  void Haptics.selectionAsync();
                  setFlexible(flexibleMatch);
                }}
              />
            )}
            {flexibleMatch && (
              <Text className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Or one in particular
              </Text>
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
          <PlaceRow
            place={item}
            location={location}
            onPress={() => pick(item)}
          />
        )}
        ListEmptyComponent={
          !isSearching ? (
            <Text className="py-10 text-center text-sm text-muted-foreground">
              {isStopover
                ? "Search for where you want to stop on the way, like “Rema 1000” or “pharmacy”."
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
    </>
  );
}

/** Any of a kind on the way, like any Rema 1000 or grocery store, the best one picked */
function FlexibleRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={`Picks the ${label} that gets you there soonest`}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border-2 border-violet-600 bg-card px-4 py-3.5 active:bg-accent"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
        <Icon as={Sparkles} size={16} className="text-white" />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <FlexibleBadge />
        <Text className="text-sm font-semibold" numberOfLines={1}>
          Best {label} on the way
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={2}>
          Don’t pick one: the {label} that gets you there soonest is picked, and
          picked again if things change
        </Text>
      </View>
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
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
 * A place on a map, to check it's the right one before going there.
 * For new trips, also lets you pick Leave now / Leave at / Arrive by and add
 * stopovers upfront before starting.
 */
function PickedPlace({
  place,
  isStopover,
  isSavingShortcut,
  shortcutIcon,
  location,
  onBack,
}: {
  place: Place;
  isStopover: boolean;
  isSavingShortcut: boolean;
  shortcutIcon: "home" | "work" | "star";
  location: Coordinates | null;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState<Coordinates>(place);
  /** A pin of its own starts where you are, which is no place to go */
  const [hasTapped, setHasTapped] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [isStarting, setIsStarting] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState(
    shortcutIcon === "home"
      ? "Home"
      : shortcutIcon === "work"
        ? "Work"
        : place.name,
  );
  const [timingMode, setTimingMode] = useState<TripTimeMode>("now");
  const [scheduleTime, setScheduleTime] = useState(() => defaultTripTime());
  const [preferTransit, setPreferTransit] = useState(false);
  const [draftStopovers, setDraftStopovers] = useState<DraftStopover[]>([]);
  const [addingDraftCategory, setAddingDraftCategory] = useState<{
    query: string;
    label: string;
  } | null>(null);

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

  if (addingDraftCategory) {
    return (
      <FlexibleStopPicker
        query={addingDraftCategory.query}
        label={addingDraftCategory.label}
        draftContext={{
          from: location ?? TRONDHEIM,
          to: result,
          when: timingMode === "leaveAt" ? scheduleTime : Date.now(),
          preferTransit,
        }}
        onPickOne={(pickedStop) => {
          setDraftStopovers((prev) => [
            ...prev,
            { place: pickedStop, minutes: 10 },
          ]);
          setAddingDraftCategory(null);
        }}
        onConfirmFlexible={(q, lbl, mins, opts) => {
          if (opts[0]) {
            setDraftStopovers((prev) => [
              ...prev,
              {
                place: opts[0].place,
                minutes: mins,
                flexible: { query: q, label: lbl, options: opts },
              },
            ]);
          }
          setAddingDraftCategory(null);
        }}
      />
    );
  }

  const go = async () => {
    void Haptics.selectionAsync();
    if (isSavingShortcut) {
      savePlaceShortcut({
        label: shortcutLabel || result.name,
        icon: shortcutIcon,
        place: result,
      });
      toast.success(`Saved ${shortcutLabel || result.name}`);
      router.back();
      return;
    }
    if (isStopover) {
      addStopover(result, minutes);
      router.back();
      return;
    }
    const schedule: JourneySchedule | null =
      timingMode === "now" ? null : { mode: timingMode, time: scheduleTime };
    setIsStarting(true);
    try {
      await startJourney(result, {
        stopovers: draftStopovers,
        schedule,
        preferTransit,
      });
    } finally {
      setIsStarting(false);
    }
    router.replace("/bus/journey");
  };

  return (
    <View className="flex-1 bg-background">
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
      <ScrollView
        className="max-h-[58%] border-t border-border bg-background"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: Math.max(insets.bottom, 20),
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
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

        {isSavingShortcut && (
          <View className="gap-1.5">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Shortcut name
            </Text>
            <Input
              value={shortcutLabel}
              onChangeText={setShortcutLabel}
              placeholder="Home, Work, Gym..."
            />
          </View>
        )}

        {isStopover && <MinutesPicker value={minutes} onChange={setMinutes} />}

        {/* Pre-trip timing & upfront stopovers */}
        {!isStopover && !isSavingShortcut && (
          <View className="gap-3">
            <TripTimePicker
              mode={timingMode}
              time={scheduleTime}
              onChange={(mode, time) => {
                setTimingMode(mode);
                setScheduleTime(time);
              }}
            />
            <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <Icon as={Bus} size={16} className="text-muted-foreground" />
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium">Mostly by bus</Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Avoids long walks, also when walking is a bit faster
                </Text>
              </View>
              <Switch value={preferTransit} onValueChange={setPreferTransit} />
            </View>

            {/* Upfront stopovers before starting */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quick stop on the way (optional)
              </Text>
              {draftStopovers.map((draft, index) => (
                <View
                  key={`${draft.place.name}-${index}`}
                  className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"
                >
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-medium" numberOfLines={1}>
                      {draft.flexible
                        ? `Best ${draft.flexible.label} (${draft.place.name})`
                        : draft.place.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Stay {formatDuration(draft.minutes * 60_000)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove stop"
                    hitSlop={8}
                    onPress={() =>
                      setDraftStopovers((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="h-7 w-7 items-center justify-center rounded-lg active:bg-accent"
                  >
                    <Icon as={X} size={14} className="text-muted-foreground" />
                  </Pressable>
                </View>
              ))}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                {FLEXIBLE_CATEGORIES.slice(0, 4).map((cat) => (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setAddingDraftCategory({
                        query: cat.query,
                        label: cat.label,
                      });
                    }}
                    className="flex-row items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 active:bg-accent"
                  >
                    <Icon as={Plus} size={12} className="text-violet-600" />
                    <Text className="text-xs font-medium capitalize">
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        <View className="gap-2">
          <Button
            disabled={!isReady}
            isLoading={isStarting}
            onPress={() => void go()}
          >
            {isSavingShortcut
              ? "Save shortcut"
              : isStopover
                ? "Add to the trip"
                : timingMode === "now"
                  ? "Go here"
                  : timingMode === "leaveAt"
                    ? `Leave at ${formatWhen(scheduleTime)}`
                    : `Arrive by ${formatWhen(scheduleTime)}`}
          </Button>
          <Button variant="ghost" onPress={onBack}>
            Pick another place
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
