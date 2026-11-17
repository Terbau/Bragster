import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
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

/** The line number, in the same yellow as on the Lock Screen */
export function LineBadge({
  line,
  size = "default",
}: {
  line: string;
  size?: "default" | "lg";
}) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-md bg-yellow-400",
        size === "lg" ? "h-9 min-w-11 px-2" : "h-7 min-w-9 px-1.5",
      )}
    >
      <Text
        className={cn(
          "font-extrabold text-black",
          size === "lg" ? "text-lg" : "text-sm",
        )}
      >
        {line}
      </Text>
    </View>
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

/** Like "14:32", the same on every phone */
export function formatClock(time: Date) {
  return `${String(time.getHours()).padStart(2, "0")}:${String(
    time.getMinutes(),
  ).padStart(2, "0")}`;
}

/** Like "+3 min", or null when it's on time. The same as on the Lock Screen. */
export function delayText(aimed: Date, expected: Date, realtime: boolean) {
  if (!realtime) return "Scheduled";
  const minutes = Math.round((expected.getTime() - aimed.getTime()) / 60000);
  if (minutes >= 1) return `+${minutes} min`;
  if (minutes <= -1) return `${-minutes} min early`;
  return null;
}

export { busStatusText as statusText } from "@/lib/entur";
