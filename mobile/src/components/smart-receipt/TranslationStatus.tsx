import { Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const TIMEOUT_MS = 150_000; // Same as the website

interface TranslationStatusProps {
  timedOut: boolean;
  onTimeout: () => void;
}

/** Shown while item translations are being created in the background */
export function TranslationStatus({ timedOut, onTimeout }: TranslationStatusProps) {
  const opacity = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.35, { duration: 900 }), -1, true);
  }, [opacity]);

  useEffect(() => {
    const timeout = setTimeout(onTimeout, TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [onTimeout]);

  if (timedOut) {
    return (
      <View className="flex-row items-center gap-1.5">
        <Icon as={Sparkles} size={14} className="text-muted-foreground" />
        <Text className="flex-1 text-xs text-muted-foreground">
          Translations took too long. Pull down to refresh.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon as={Sparkles} size={14} className="text-muted-foreground" />
      <Animated.View style={pulseStyle}>
        <Text className="text-xs text-muted-foreground">
          Translating items with AI...
        </Text>
      </Animated.View>
    </View>
  );
}
