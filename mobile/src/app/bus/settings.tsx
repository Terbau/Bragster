import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Bell,
  Brain,
  Briefcase,
  Footprints,
  Home,
  Plus,
  Star,
  Trash2,
} from "lucide-react-native";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { LineBadge } from "@/components/bus/shared";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import {
  getWalkSpeed,
  removePlaceShortcut,
  setAlertPreference,
  setWalkSpeedMode,
  useBusPreferences,
  WALK_SPEED_PRESETS,
  type WalkSpeedMode,
} from "@/lib/bus-preferences";
import { MIN_SAMPLES, summarize } from "@/lib/delay-memory";
import { clearDelayMemory, useDelayMemory } from "@/lib/delay-store";

/** Like "+3 min" */
const formatDelay = (ms: number) =>
  `+${Math.max(0, Math.round(ms / 60000))} min`;

const SAVED_ICONS = {
  home: Home,
  work: Briefcase,
  star: Star,
};

export default function BusSettingsScreen() {
  const { savedPlaces, walkSpeedMode, learnedWalkSpeed, walkSamples, alerts } =
    useBusPreferences();

  const home = savedPlaces.find((p) => p.icon === "home");
  const work = savedPlaces.find((p) => p.icon === "work");
  const customPlaces = savedPlaces.filter(
    (p) => p.icon !== "home" && p.icon !== "work",
  );
  const activeSpeed = getWalkSpeed();
  const delayRecords = useDelayMemory();
  const learned = useMemo(() => summarize(delayRecords), [delayRecords]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 24 }}
    >
      {/* Saved Places */}
      <View className="gap-2.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Saved places
        </Text>
        <View className="rounded-xl border border-border bg-card px-4 py-1">
          <ShortcutRow
            icon="home"
            title="Home"
            subtitle={home ? home.place.name : "Not set"}
            onPress={() =>
              router.push({
                pathname: "/bus/place",
                params: { for: "saved", preset: "home" },
              })
            }
            onRemove={home ? () => removePlaceShortcut(home.id) : undefined}
          />
          <View className="h-px bg-border" />
          <ShortcutRow
            icon="work"
            title="Work"
            subtitle={work ? work.place.name : "Not set"}
            onPress={() =>
              router.push({
                pathname: "/bus/place",
                params: { for: "saved", preset: "work" },
              })
            }
            onRemove={work ? () => removePlaceShortcut(work.id) : undefined}
          />
          {customPlaces.map((saved) => (
            <View key={saved.id}>
              <View className="h-px bg-border" />
              <ShortcutRow
                icon="star"
                title={saved.label}
                subtitle={saved.place.name}
                onPress={() =>
                  router.push({
                    pathname: "/bus/place",
                    params: { for: "saved", preset: "star" },
                  })
                }
                onRemove={() => removePlaceShortcut(saved.id)}
              />
            </View>
          ))}
        </View>
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onPress={() =>
            router.push({
              pathname: "/bus/place",
              params: { for: "saved", preset: "star" },
            })
          }
        >
          Add saved place
        </Button>
      </View>

      {/* Walking Speed */}
      <View className="gap-2.5">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Footprints} size={14} className="text-muted-foreground" />
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Walking speed
          </Text>
        </View>
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <SegmentedControl<WalkSpeedMode>
            value={walkSpeedMode}
            onChange={(mode) => setWalkSpeedMode(mode)}
            options={[
              { value: "slow", label: "Slow" },
              { value: "normal", label: "Normal" },
              { value: "fast", label: "Fast" },
              { value: "auto", label: "Auto" },
            ]}
          />
          <Text className="text-xs text-muted-foreground">
            {walkSpeedMode === "auto"
              ? learnedWalkSpeed !== null
                ? `Using your learned pace (${learnedWalkSpeed.toFixed(2)} m/s from ${walkSamples} walk${walkSamples === 1 ? "" : "s"}).`
                : `Learns from your walks automatically. Using ${WALK_SPEED_PRESETS.normal.toFixed(1)} m/s until enough walks are recorded.`
              : `Using ${activeSpeed.toFixed(1)} m/s (${(activeSpeed * 3.6).toFixed(1)} km/h) for bus transfers and walking estimates.`}
          </Text>
        </View>
      </View>

      {/* What's learned about how late buses really leave */}
      <View className="gap-2.5">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Brain} size={14} className="text-muted-foreground" />
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Delay memory
          </Text>
        </View>
        <View className="gap-3 rounded-xl border border-border bg-card p-4">
          <Text className="text-xs text-muted-foreground">
            During trips, the app notes how late buses show they are and when
            they really leave. After {MIN_SAMPLES} trips with a line from a stop
            at about the same time of day, it tells you when that bus usually
            leaves if it tends to catch up, and moves your leave time earlier.
          </Text>
          {learned.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              Nothing learned yet
            </Text>
          ) : (
            learned.slice(0, 8).map((item) => (
              <View
                key={`${item.line}|${item.quayId}|${item.hour}`}
                className="flex-row items-center gap-3"
              >
                <LineBadge line={item.line} />
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {item.stopName} · around{" "}
                    {String(item.hour).padStart(2, "0")}:00
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Shows up to {formatDelay(item.typicalShown)}, leaves{" "}
                    {formatDelay(item.typicalActual)} · {item.samples} trip
                    {item.samples === 1 ? "" : "s"}
                  </Text>
                </View>
              </View>
            ))
          )}
          {delayRecords.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onPress={() =>
                Alert.alert(
                  "Forget learned delays?",
                  "Leave times will go by what the buses show again.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Forget",
                      style: "destructive",
                      onPress: clearDelayMemory,
                    },
                  ],
                )
              }
            >
              Forget learned delays
            </Button>
          )}
        </View>
      </View>

      {/* Proactive Alerts */}
      <View className="gap-2.5">
        <View className="flex-row items-center gap-1.5">
          <Icon as={Bell} size={14} className="text-muted-foreground" />
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trip alerts
          </Text>
        </View>
        <View className="rounded-xl border border-border bg-card px-4 py-1">
          <View className="flex-row items-center gap-4 py-3">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium">
                Get off at the next stop
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Alert 1 stop before your alighting stop so you remember to press
                stop
              </Text>
            </View>
            <Switch
              value={alerts.alightSoon}
              onValueChange={(val) => {
                void Haptics.selectionAsync();
                setAlertPreference("alightSoon", val);
              }}
            />
          </View>
          <View className="h-px bg-border" />
          <View className="flex-row items-center gap-4 py-3">
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium">
                Leave stopover in 2 min
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                Heads-up before it’s time to walk to your next bus from a stop
                on the way
              </Text>
            </View>
            <Switch
              value={alerts.leaveStopoverSoon}
              onValueChange={(val) => {
                void Haptics.selectionAsync();
                setAlertPreference("leaveStopoverSoon", val);
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ShortcutRow({
  icon,
  title,
  subtitle,
  onPress,
  onRemove,
}: {
  icon: "home" | "work" | "star";
  title: string;
  subtitle: string;
  onPress: () => void;
  onRemove?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 active:opacity-75"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Icon as={SAVED_ICONS[icon]} size={15} className="text-foreground" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title}`}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="h-8 w-8 items-center justify-center rounded-lg active:bg-accent"
        >
          <Icon as={Trash2} size={15} className="text-muted-foreground" />
        </Pressable>
      )}
    </Pressable>
  );
}
