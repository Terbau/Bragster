import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";

interface EditSheetProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onDone: () => void;
  doneDisabled?: boolean;
  children: ReactNode;
}

/** Page sheet with Cancel/Done, used for editing parts of the draft */
export function EditSheet({
  visible,
  title,
  onCancel,
  onDone,
  doneDisabled,
  children,
}: EditSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable hitSlop={10} onPress={onCancel} className="active:opacity-50">
            <Text className="text-base">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold">{title}</Text>
          <Pressable
            hitSlop={10}
            onPress={onDone}
            disabled={doneDisabled}
            className={doneDisabled ? "opacity-40" : "active:opacity-50"}
          >
            <Text className="text-base font-semibold">Done</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerClassName="gap-5 p-5 pb-12"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}
