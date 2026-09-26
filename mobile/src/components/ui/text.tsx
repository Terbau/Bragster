import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

/** Text with the theme's foreground color (React Native text doesn't inherit colors) */
export function Text({ className, ...props }: TextProps) {
  return (
    <RNText className={cn("text-base text-foreground", className)} {...props} />
  );
}
