import { Switch as RNSwitch, type SwitchProps } from "react-native";
import { useColors } from "@/lib/color-scheme";

export function Switch({ value, ...props }: SwitchProps) {
  const { isDark, colors } = useColors();
  return (
    <RNSwitch
      value={value}
      trackColor={{ true: colors.primary, false: colors.border }}
      // Keep the thumb visible on the dark track when off
      thumbColor={isDark && !value ? colors.foreground : colors.background}
      ios_backgroundColor={colors.border}
      {...props}
    />
  );
}
