import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatClock, type ServiceSituation } from "@/lib/bus-utils";
import { cn } from "@/lib/utils";

/** The current time, updated every `intervalMs` */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
  return now;
}

const MODE_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  tram: { bg: "bg-violet-600", text: "text-white" },
  rail: { bg: "bg-red-700", text: "text-white" },
  water: { bg: "bg-cyan-700", text: "text-white" },
  metro: { bg: "bg-orange-600", text: "text-white" },
  bus: { bg: "bg-yellow-400", text: "text-black" },
};

/** The line number, styled by transport mode (AtB yellow for bus, violet for tram, etc.) */
export function LineBadge({
  line,
  mode,
  size = "default",
}: {
  line: string;
  mode?: string;
  size?: "default" | "lg";
}) {
  const palette = MODE_BADGE_STYLES[mode ?? "bus"] ?? MODE_BADGE_STYLES.bus;
  return (
    <View
      className={cn(
        "items-center justify-center rounded-md",
        palette.bg,
        size === "lg" ? "h-9 min-w-11 px-2" : "h-7 min-w-9 px-1.5",
      )}
    >
      <Text
        className={cn(
          "font-extrabold",
          palette.text,
          size === "lg" ? "text-lg" : "text-sm",
        )}
      >
        {line}
      </Text>
    </View>
  );
}

/** Expandable banner for AtB / Entur service alerts (SIRI-SX) */
export function SituationsBanner({
  situations,
}: {
  situations: ServiceSituation[];
}) {
  const [expanded, setExpanded] = useState(false);
  if (situations.length === 0) return null;
  const first = situations[0];
  const hasMore = situations.length > 1 || first.description !== null;
  return (
    <Pressable
      accessibilityRole={hasMore ? "button" : undefined}
      disabled={!hasMore}
      onPress={() => setExpanded((open) => !open)}
      className="gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 active:opacity-80"
    >
      <View className="flex-row items-start gap-2.5">
        <Icon
          as={AlertTriangle}
          size={16}
          className="mt-0.5 text-amber-600 dark:text-amber-400"
        />
        <View className="min-w-0 flex-1">
          <Text
            className="text-xs font-semibold text-foreground"
            numberOfLines={expanded ? undefined : 2}
          >
            {first.summary}
          </Text>
          {!expanded && situations.length > 1 && (
            <Text className="mt-0.5 text-xs text-muted-foreground">
              +{situations.length - 1} more service alert
              {situations.length > 2 ? "s" : ""}
            </Text>
          )}
        </View>
        {hasMore && (
          <Icon
            as={expanded ? ChevronUp : ChevronDown}
            size={15}
            className="mt-0.5 text-muted-foreground"
          />
        )}
      </View>
      {expanded && (
        <View className="gap-2.5 pl-6">
          {first.description && (
            <Text className="text-xs leading-4 text-muted-foreground">
              {first.description}
            </Text>
          )}
          {situations.slice(1).map((item) => (
            <View
              key={item.id}
              className="gap-0.5 border-t border-amber-500/20 pt-2"
            >
              <Text className="text-xs font-semibold text-foreground">
                {item.summary}
              </Text>
              {item.description && (
                <Text className="text-xs leading-4 text-muted-foreground">
                  {item.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

/** Like "4 min", "Now", or "14:32" for later than an hour */
export function formatMinutesUntil(time: Date, now: number) {
  const ms = time.getTime() - now;
  if (ms < 45 * 1000) return "Now";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  return formatClock(time);
}

/** Like "4:07", for the countdown */
export function formatCountdown(time: Date, now: number) {
  const seconds = Math.max(0, Math.round((time.getTime() - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${rest}`;
  }
  return `${minutes}:${rest}`;
}

export { formatClock };

/** Like "+3 min", or null when it's on time. The same as on the Lock Screen. */
export function delayText(aimed: Date, expected: Date, realtime: boolean) {
  if (!realtime) return "Scheduled";
  const minutes = Math.round((expected.getTime() - aimed.getTime()) / 60000);
  if (minutes >= 1) return `+${minutes} min`;
  if (minutes <= -1) return `${-minutes} min early`;
  return null;
}

export { busStatusText as statusText } from "@/lib/entur";
