import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface BadgeProps extends ViewProps {
  textClassName?: string;
  children: ReactNode;
}

export function Badge({ className, textClassName, children, ...props }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full border border-border px-2.5 py-0.5",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-xs font-semibold", textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
