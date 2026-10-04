import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { Pressable } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  /** Amber, for highlighting a player */
  highlighted?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  icon,
  selected,
  highlighted,
  disabled,
  onPress,
  accessibilityLabel,
}: ChipProps) {
  const textClass = cn(
    "text-sm",
    selected ? "font-medium text-primary-foreground" : "text-foreground",
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      className={cn(
        "flex-row items-center gap-1 rounded-full border px-3 py-1.5 active:opacity-70",
        selected
          ? "border-primary bg-primary"
          : highlighted
            ? "border-amber-500 bg-amber-500/15"
            : "border-border bg-background",
        disabled && "opacity-40",
      )}
    >
      {icon && <Icon as={icon} size={14} className={textClass} />}
      <Text className={textClass}>{label}</Text>
    </Pressable>
  );
}
