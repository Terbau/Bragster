import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export function Separator({ className, ...props }: ViewProps) {
  return <View className={cn("h-px w-full bg-border", className)} {...props} />;
}

export function SeparatorWithText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <View className={cn("flex-row items-center gap-3", className)}>
      <View className="h-px flex-1 bg-border" />
      <Text className="text-xs uppercase text-muted-foreground">{text}</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
