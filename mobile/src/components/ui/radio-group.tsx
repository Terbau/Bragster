import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface RadioGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Replaces the website's select dropdowns, which work poorly on phones */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: RadioGroupProps<T>) {
  return (
    <View className="overflow-hidden rounded-lg border border-border">
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            disabled={disabled}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(option.value);
            }}
            className={cn(
              "flex-row items-center gap-3 px-4 py-3 active:bg-accent",
              index > 0 && "border-t border-border",
              disabled && "opacity-50",
            )}
          >
            <View
              className={cn(
                "h-5 w-5 items-center justify-center rounded-full border-2",
                isSelected ? "border-primary" : "border-muted-foreground/40",
              )}
            >
              {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </View>
            <Text className="flex-1 text-sm">{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
