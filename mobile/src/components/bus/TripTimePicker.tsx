import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import type { JourneySchedule } from "@/lib/journey";
import { formatWhen } from "@/lib/journey-logic";

export type TripTimeMode = "now" | JourneySchedule["mode"];

/**
 * The next time it's `picked` o'clock: today, or tomorrow when that's
 * passed, like 08:40 picked in the evening
 */
export function nextOccurrence(picked: Date, now = Date.now()) {
  const time = new Date(now);
  time.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  if (time.getTime() <= now + 60_000) time.setDate(time.getDate() + 1);
  return time.getTime();
}

/** In half an hour, to the next 5 minutes */
export function defaultTripTime(now = Date.now()) {
  const step = 5 * 60_000;
  return Math.ceil((now + 30 * 60_000) / step) * step;
}

/** Leave now, leave at, or arrive by a time, today or tomorrow */
export function TripTimePicker({
  mode,
  time,
  onChange,
}: {
  mode: TripTimeMode;
  /** In ms, already today or tomorrow, see `nextOccurrence` */
  time: number;
  onChange: (mode: TripTimeMode, time: number) => void;
}) {
  const { isDark } = useColors();
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const label = mode === "leaveAt" ? "Leave at" : "Arrive by";
  const pick = (picked: Date | undefined) => {
    if (picked) onChange(mode, nextOccurrence(picked));
  };

  return (
    <View className="gap-3">
      <SegmentedControl<TripTimeMode>
        value={mode}
        onChange={(next) =>
          onChange(next, time > Date.now() + 60_000 ? time : defaultTripTime())
        }
        options={[
          { value: "now", label: "Leave now" },
          { value: "leaveAt", label: "Leave at" },
          { value: "arriveBy", label: "Arrive by" },
        ]}
      />
      {mode !== "now" &&
        (Platform.OS === "ios" ? (
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon as={Clock} size={15} className="text-muted-foreground" />
              <Text className="text-sm font-medium" numberOfLines={1}>
                {label}
                {formatWhen(time).startsWith("tomorrow") ? " tomorrow" : ""}
              </Text>
            </View>
            {/* No minimum: an earlier time than now is taken as tomorrow */}
            <DateTimePicker
              mode="time"
              display="compact"
              value={new Date(time)}
              themeVariant={isDark ? "dark" : "light"}
              onChange={(_, picked) => pick(picked)}
            />
          </View>
        ) : (
          <View className="gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Clock}
              onPress={() => setShowAndroidPicker(true)}
            >
              {`${label} ${formatWhen(time)}`}
            </Button>
            {showAndroidPicker && (
              <DateTimePicker
                mode="time"
                value={new Date(time)}
                onChange={(_, picked) => {
                  setShowAndroidPicker(false);
                  pick(picked);
                }}
              />
            )}
          </View>
        ))}
    </View>
  );
}
