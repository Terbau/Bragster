import { CircleAlert, Info, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

interface AlertProps {
  variant?: "default" | "destructive" | "tip";
  title?: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}

export function Alert({
  variant = "default",
  title,
  icon,
  className,
  children,
}: AlertProps) {
  const isDestructive = variant === "destructive";
  const isTip = variant === "tip";

  return (
    <View
      className={cn(
        "flex-row gap-3 rounded-lg border border-border px-4 py-3",
        isDestructive && "border-destructive/50",
        isTip && "rounded-none border-0 border-l-2 border-l-blue-500 py-2",
        className,
      )}
    >
      <Icon
        as={icon ?? (isTip ? Info : CircleAlert)}
        size={18}
        className={cn(
          "mt-0.5",
          isDestructive && "text-destructive",
          isTip && "text-blue-600 dark:text-blue-500",
        )}
      />
      <View className="flex-1 gap-1">
        {title && (
          <Text
            className={cn(
              "text-sm font-medium",
              isDestructive && "text-destructive",
            )}
          >
            {title}
          </Text>
        )}
        {typeof children === "string" ? (
          <Text
            className={cn(
              "text-sm",
              isDestructive ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
