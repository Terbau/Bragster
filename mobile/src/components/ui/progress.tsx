import { View } from "react-native";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  /** 0-100 */
  value: number;
  className?: string;
}) {
  return (
    <View
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <View
        className="h-full rounded-full bg-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </View>
  );
}
