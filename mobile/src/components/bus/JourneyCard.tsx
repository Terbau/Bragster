import { router } from "expo-router";
import { ChevronRight, Navigation } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatClock } from "@/lib/bus-utils";
import { useJourney } from "@/lib/journey";
import { cn } from "@/lib/utils";

/**
 * Starts a trip to somewhere, or opens the one that's on.
 * With `onlyActive`, renders nothing when there's no active trip (used on Home).
 */
export function JourneyCard({
  onlyActive = false,
  className,
}: {
  onlyActive?: boolean;
  className?: string;
}) {
  const { journey, step, arrival, report } = useJourney();
  const isOn = !!journey;
  if (onlyActive && !isOn) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(isOn ? "/bus/journey" : "/bus/place")}
      className={cn(
        "flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent",
        className,
      )}
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-foreground">
        <Icon as={Navigation} size={16} className="text-background" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {isOn
            ? `${report ? "Trip to " : "To "}${journey.destination.name}`
            : "Where to?"}
        </Text>
        <Text
          className="mt-0.5 text-xs text-muted-foreground"
          numberOfLines={1}
        >
          {isOn
            ? (report?.short ?? step?.headline ?? "Finding the best route")
            : "The best route from where you are, kept up to date as you go"}
        </Text>
      </View>
      {isOn && arrival !== null && (
        <Text className="text-base font-semibold tabular-nums">
          {formatClock(arrival)}
        </Text>
      )}
      <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
