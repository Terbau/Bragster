import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Mobile version of the website's pill tabs */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View className={cn("flex-row gap-1 rounded-lg bg-muted p-1", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              if (!isActive) {
                void Haptics.selectionAsync();
                onChange(option.value);
              }
            }}
            className={cn(
              "flex-1 items-center rounded-md px-3 py-1.5",
              isActive && "bg-background shadow-sm shadow-black/5",
            )}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
