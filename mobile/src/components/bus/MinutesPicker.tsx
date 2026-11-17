import DateTimePicker from "@react-native-community/datetimepicker";
import { Minus, Plus, Timer } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDuration } from "@/lib/journey-report";
import { cn } from "@/lib/utils";

/** How long a stop on the way can be stayed at, in minutes */
const MINUTES = [5, 10, 15, 20, 30, 45, 60];
/** The longest stay, as a trip is forgotten after six hours */
const MAX_MINUTES = 5 * 60;

/** The countdown wheel shows the hours and minutes of a time of day */
function toTime(minutes: number) {
  const time = new Date();
  time.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return time;
}

/**
 * How long to stay at a stop on the way: one of the usual ones, or any
 * time, like 2 h 30 min, on a wheel like the iPhone's timer
 */
export function MinutesPicker({
  value,
  onChange,
  title = "How long do you stay?",
}: {
  value: number;
  onChange: (minutes: number) => void;
  title?: string | null;
}) {
  const { isDark } = useColors();
  const [isCustom, setIsCustom] = useState(!MINUTES.includes(value));
  const time = useMemo(() => toTime(value), [value]);
  const set = (minutes: number) =>
    onChange(Math.min(MAX_MINUTES, Math.max(1, minutes)));

  return (
    <View className="gap-3">
      {title && <Text className="text-sm font-medium">{title}</Text>}
      <View className="flex-row flex-wrap gap-2">
        {MINUTES.map((option) => (
          <Chip
            key={option}
            label={`${option} min`}
            isSelected={!isCustom && value === option}
            onPress={() => {
              setIsCustom(false);
              onChange(option);
            }}
          />
        ))}
        <Chip
          icon
          label={isCustom ? formatDuration(value * 60 * 1000) : "Other"}
          isSelected={isCustom}
          onPress={() => setIsCustom(true)}
        />
      </View>
      {isCustom &&
        (Platform.OS === "ios" ? (
          <View className="items-center rounded-xl bg-muted">
            <DateTimePicker
              mode="countdown"
              display="spinner"
              value={time}
              minuteInterval={1}
              themeVariant={isDark ? "dark" : "light"}
              onChange={(_, picked) => {
                if (picked) set(picked.getHours() * 60 + picked.getMinutes());
              }}
            />
          </View>
        ) : (
          <View className="flex-row items-center justify-center gap-6 rounded-xl bg-muted py-3">
            <StepButton
              icon={Minus}
              label="5 min less"
              onPress={() => set(value - 5)}
            />
            <Text className="min-w-24 text-center text-lg font-semibold tabular-nums">
              {formatDuration(value * 60 * 1000)}
            </Text>
            <StepButton
              icon={Plus}
              label="5 min more"
              onPress={() => set(value + 5)}
            />
          </View>
        ))}
    </View>
  );
}

function Chip({
  label,
  icon,
  isSelected,
  onPress,
}: {
  label: string;
  /** With a timer in front, for any time */
  icon?: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-1.5 rounded-full border px-4 py-2",
        isSelected
          ? "border-foreground bg-foreground"
          : "border-border bg-background active:bg-accent",
      )}
    >
      {icon && (
        <Icon
          as={Timer}
          size={14}
          className={isSelected ? "text-background" : "text-foreground"}
        />
      )}
      <Text
        className={cn(
          "text-sm font-semibold",
          isSelected ? "text-background" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepButton({
  icon,
  label,
  onPress,
}: {
  icon: typeof Plus;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-background active:bg-accent"
    >
      <Icon as={icon} size={18} className="text-foreground" />
    </Pressable>
  );
}
