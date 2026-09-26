import { router } from "expo-router";
import { Pressable } from "react-native";
import { Text } from "./ui/text";

export function ModalCloseButton({ label = "Close" }: { label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => router.back()}
      className="px-1 active:opacity-50"
    >
      <Text className="text-base font-medium">{label}</Text>
    </Pressable>
  );
}
