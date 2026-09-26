import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { useColors } from "@/lib/color-scheme";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const containerVariants: Record<Variant, string> = {
  default: "bg-primary active:opacity-80",
  outline: "border border-border bg-background active:bg-accent",
  secondary: "bg-secondary active:opacity-80",
  ghost: "active:bg-accent",
  destructive: "bg-destructive active:opacity-80",
};

const textVariants: Record<Variant, string> = {
  default: "text-primary-foreground",
  outline: "text-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const sizes: Record<Size, string> = {
  default: "h-11 px-4 gap-2",
  sm: "h-9 px-3 gap-1.5",
  lg: "h-12 px-6 gap-2",
  icon: "h-10 w-10",
};

interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
  children?: ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  icon,
  isLoading = false,
  disabled,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) {
  const { colors } = useColors();
  const isDisabled = disabled || isLoading;
  const textClass = cn(
    "font-medium",
    size === "sm" ? "text-sm" : "text-base",
    textVariants[variant],
    textClassName,
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-lg",
        containerVariants[variant],
        sizes[size],
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "default"
              ? colors.primaryForeground
              : variant === "destructive"
                ? "#fafafa"
                : colors.foreground
          }
        />
      ) : (
        icon && (
          <Icon as={icon} size={size === "sm" ? 16 : 18} className={textClass} />
        )
      )}
      {typeof children === "string" ? (
        <Text className={textClass}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
