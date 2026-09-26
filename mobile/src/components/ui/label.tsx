import type { TextProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export function Label({ className, ...props }: TextProps) {
  return <Text className={cn("mb-1.5 text-sm font-medium", className)} {...props} />;
}

export function FieldDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("mt-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
