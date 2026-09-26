import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import type { EditStatus } from "@/lib/receipt-draft";
import { cn } from "@/lib/utils";

// Blue: can be edited. Amber: edited (not saved yet). Grey: removed.

export const boxClasses: Record<EditStatus, string> = {
  unchanged: "border-blue-500 bg-blue-500/15",
  edited: "border-amber-500 bg-amber-400/35",
  new: "border-amber-500 bg-amber-400/35",
  removed: "border-neutral-400 bg-neutral-500/50",
};

const pillClasses: Record<EditStatus, string> = {
  unchanged: "border-blue-500/40 bg-blue-500/10",
  edited: "border-amber-500/70 bg-amber-400/25",
  new: "border-amber-500/70 bg-amber-400/25",
  removed: "border-neutral-400/40 bg-neutral-500/10",
};

/** A value that can be tapped to edit it, colored by its edit status */
export function EditablePill({
  status,
  onPress,
  className,
  textClassName,
  children,
}: {
  status: EditStatus;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  children: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={4}
      className={cn(
        "self-start rounded-md border px-1.5 py-0.5 active:opacity-60",
        pillClasses[status],
        className,
      )}
    >
      <Text
        className={cn(
          "text-sm",
          status === "removed" && "text-muted-foreground line-through",
          textClassName,
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function Legend() {
  return (
    <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
      <LegendEntry className={boxClasses.unchanged} label="Tap to edit" />
      <LegendEntry className={boxClasses.edited} label="Edited" />
      <LegendEntry className={boxClasses.removed} label="Removed" />
    </View>
  );
}

function LegendEntry({ className, label }: { className: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={cn("h-3 w-4 rounded-sm border", className)} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

export const statusLabel: Record<EditStatus, string | null> = {
  unchanged: null,
  edited: "Edited",
  new: "New",
  removed: "Removed",
};
