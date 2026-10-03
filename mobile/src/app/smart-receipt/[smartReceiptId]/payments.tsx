import { Info, Share as ShareIcon, TriangleAlert } from "lucide-react-native";
import { useState } from "react";
import { Alert as NativeAlert, Pressable, Share, View } from "react-native";
import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { formatAmount } from "@/lib/format";
import {
  buildShareMessage,
  calculatePayments,
  getSmartReceiptSummary,
} from "@/lib/smart-receipt";
import type { SmartReceiptDetailResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PaymentsScreen() {
  return (
    <SmartReceiptSheet>{(data) => <PaymentCalculations data={data} />}</SmartReceiptSheet>
  );
}

function PaymentCalculations({ data }: { data: SmartReceiptDetailResponse }) {
  const { smartReceipt } = data;
  const [rowsReversed, setRowsReversed] = useState(false);
  const summary = getSmartReceiptSummary(smartReceipt);
  const payments = calculatePayments(smartReceipt, summary.priceFactor);

  const rows = [
    ...smartReceipt.users.map((user) => ({
      id: user.id,
      name: user.email,
      avatar: <Avatar src={user.avatarUrl} email={user.email} />,
      amount: payments.users[user.id] ?? 0,
    })),
    ...smartReceipt.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      avatar: <Avatar email={guest.name} />,
      amount: payments.guests[guest.id] ?? 0,
    })),
  ];

  return (
    <>
      <Text className="text-sm text-muted-foreground">
        This is how much each user should pay based on the items assigned to them.
      </Text>

      <Button
        icon={ShareIcon}
        disabled={payments.assignedSum === 0}
        onPress={() => void Share.share({ message: buildShareMessage(smartReceipt) })}
      >
        Share amounts
      </Button>

      <Alert variant="tip" title="Tip">
        If you were charged in your local currency, open the smart receipt
        properties, select your currency under &quot;Currency&quot; and enter the
        sum that was charged from your bank account. The item sums are then
        recalculated with the correct conversion.
      </Alert>

      <View className="flex-row items-center gap-2">
        <Switch value={rowsReversed} onValueChange={setRowsReversed} />
        <Text className="text-sm font-medium">Reverse rows</Text>
        <Pressable
          hitSlop={10}
          onPress={() =>
            NativeAlert.alert(
              "Reverse rows",
              'This is useful in case you need to see the amounts on iPhone while being in the "close apps" view.',
            )
          }
        >
          <Icon as={Info} size={18} className="text-muted-foreground" />
        </Pressable>
      </View>

      <View className="gap-3">
        {rows.map((row) => (
          <View
            key={row.id}
            className={cn(
              "items-center gap-2",
              rowsReversed ? "flex-row-reverse" : "flex-row",
            )}
          >
            {row.avatar}
            <Text
              className={cn("shrink text-sm", rowsReversed && "ml-auto")}
              numberOfLines={1}
            >
              {row.name}
            </Text>
            <Text className={cn("text-sm", !rowsReversed && "ml-auto")}>
              {formatAmount(row.amount, summary.currencyCode)}
            </Text>
          </View>
        ))}
      </View>

      <Separator />

      {!summary.allPaid && (
        <>
          <View className="flex-row items-center gap-1.5 self-start rounded-full border border-border px-2.5 py-1">
            <Icon as={TriangleAlert} size={18} className="text-orange-400" />
            <Text className="text-xs font-semibold text-muted-foreground">
              Not all items have been assigned
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Assigned</Text>
            <Text className="text-sm text-muted-foreground">
              {formatAmount(payments.assignedSum, summary.currencyCode)}
            </Text>
          </View>
        </>
      )}
      <View className="flex-row items-center justify-between">
        <Text className="font-bold">Total</Text>
        <Text className="font-bold">
          {formatAmount(summary.totalPrice, summary.currencyCode)}
        </Text>
      </View>
    </>
  );
}
