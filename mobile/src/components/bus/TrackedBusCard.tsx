import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useBusTracking } from "@/lib/bus-tracking";
import { cn } from "@/lib/utils";
import { formatMinutesUntil, LineBadge, statusText, useNow } from "./shared";

/** The bus being followed, to open it again. Nothing when there's none. */
export function TrackedBusCard({ className }: { className?: string }) {
  const { bus, progress } = useBusTracking();
  const now = useNow(15 * 1000);
  if (!bus) return null;

  const isOnItsWay =
    progress?.status === "coming" || progress?.status === "approaching";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/bus/trip")}
      className={cn(
        "flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 active:bg-accent",
        className,
      )}
    >
      <LineBadge line={bus.line} mode={bus.mode} />
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
