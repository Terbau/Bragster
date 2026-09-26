import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Spinner } from "@/components/ui/spinner";
import { useSmartReceipt } from "@/lib/queries";
import type { SmartReceiptDetailResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SmartReceiptSheetProps {
  children: (data: SmartReceiptDetailResponse) => ReactNode;
  contentClassName?: string;
}

/**
 * Scrollable content of a sheet presented on top of a smart receipt. Uses the
 * cached smart receipt, so sheets open instantly.
 */
export function SmartReceiptSheet({ children, contentClassName }: SmartReceiptSheetProps) {
  const { smartReceiptId } = useLocalSearchParams<{ smartReceiptId: string }>();
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useSmartReceipt(smartReceiptId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName={cn("gap-5 p-5", contentClassName)}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {children(data)}
    </ScrollView>
  );
}
