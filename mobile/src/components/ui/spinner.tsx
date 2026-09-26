import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useColors } from "@/lib/color-scheme";

export function Spinner(props: ActivityIndicatorProps) {
  const { colors } = useColors();
  return <ActivityIndicator color={colors.mutedForeground} {...props} />;
}
