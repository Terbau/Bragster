import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useColors } from "@/lib/color-scheme";
import { cn } from "@/lib/utils";

export const Input = forwardRef<TextInput, TextInputProps>(
  ({ className, editable = true, ...props }, ref) => {
    const { colors } = useColors();
    return (
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={colors.mutedForeground}
        className={cn(
          "h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground",
          !editable && "opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
