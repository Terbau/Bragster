import * as Haptics from "expo-haptics";
import { CircleAlert, CircleCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

const DURATION_MS = 3000;

let nextId = 0;
let toasts: ToastMessage[] = [];
const listeners = new Set<(toasts: ToastMessage[]) => void>();

const setToasts = (next: ToastMessage[]) => {
  toasts = next;
  for (const listener of listeners) {
    listener(toasts);
  }
};

const dismiss = (id: number) => setToasts(toasts.filter((t) => t.id !== id));

const show = (type: ToastType, message: string) => {
  const id = nextId++;
  setToasts([...toasts.slice(-2), { id, type, message }]);
  void Haptics.notificationAsync(
    type === "success"
      ? Haptics.NotificationFeedbackType.Success
      : Haptics.NotificationFeedbackType.Error,
  );
  setTimeout(() => dismiss(id), DURATION_MS);
};

/** Same API as sonner's toast on the website */
export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
};

function ToastList() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(toasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center gap-2 px-4"
      style={{ top: insets.top + 8 }}
    >
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeInUp}
          exiting={FadeOutUp}
          layout={LinearTransition}
          className="w-full max-w-md"
        >
          <Pressable
            onPress={() => dismiss(item.id)}
            className="flex-row items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg shadow-black/10"
          >
            <Icon
              as={item.type === "success" ? CircleCheck : CircleAlert}
              size={18}
              className={
                item.type === "success" ? "text-green-600" : "text-destructive"
              }
            />
            <Text className="flex-1 text-sm font-medium">{item.message}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Renders toasts above everything, including native modal sheets (which would
 * otherwise cover views rendered in the root layout).
 */
export function Toaster() {
  if (Platform.OS === "ios") {
    return (
      <FullWindowOverlay>
        <ToastList />
      </FullWindowOverlay>
    );
  }
  return <ToastList />;
}
