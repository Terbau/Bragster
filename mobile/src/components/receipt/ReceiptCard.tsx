import { Calendar, CircleAlert, Pencil } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatAmount, formatDate } from "@/lib/format";
import {
  getItemGroupTotal,
  getTotalFromItems,
  isSpecialQuantity,
  isSumCorrect,
} from "@/lib/smart-receipt";
import type { ReceiptItemGroup, ReceiptWithItems } from "@/lib/types";

interface ReceiptCardProps {
  receipt: ReceiptWithItems;
  /** Called when an item is tapped, to edit it. Items are read-only without it. */
  onEditItemGroup?: (itemGroup: ReceiptItemGroup) => void;
}

export function ReceiptCard({ receipt, onEditItemGroup }: ReceiptCardProps) {
  const totalFromItems = getTotalFromItems(receipt);
  const isCorrectSum = isSumCorrect(totalFromItems, receipt.totalPrice);
  const currencyCode = receipt.currencyCode;

  return (
    <Card className="gap-5 p-5">
      {!isCorrectSum && (
        <Alert
          variant="destructive"
          title="Total sum doesn't match the sum computed from the items"
        >
          {onEditItemGroup
            ? "One or more receipt items were most likely incorrectly interpreted. Tap an item to change its description or price."
            : "One or more receipt items were most likely incorrectly interpreted."}
        </Alert>
      )}

      <View className="gap-1.5">
        <Text className="text-2xl font-semibold">{receipt.merchantName}</Text>
        <View className="flex-row items-center gap-1">
          <Icon as={Calendar} size={16} className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">
            {formatDate(receipt.receiptDate)}
          </Text>
        </View>
      </View>

      <View className="gap-4">
        {receipt.itemGroups.map((itemGroup) => (
          <ItemGroupRow
            key={itemGroup.id}
            itemGroup={itemGroup}
            currencyCode={currencyCode}
            onPress={onEditItemGroup ? () => onEditItemGroup(itemGroup) : undefined}
          />
        ))}
      </View>

      <View className="flex-row items-center justify-between gap-2 border-y border-dashed border-foreground/15 py-4">
        <View className="flex-row items-center gap-1">
          <Text className="font-bold">Total</Text>
          {!isCorrectSum && (
            <Icon as={CircleAlert} size={18} className="text-red-400" />
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {!isCorrectSum && (
            <Badge>{`Computed sum: ${formatAmount(totalFromItems)}`}</Badge>
          )}
          <Text className="font-bold">
            {formatAmount(receipt.totalPrice, currencyCode)}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-muted-foreground">Receipt ID: {receipt.id}</Text>
    </Card>
  );
}

function ItemGroupRow({
  itemGroup,
  currencyCode,
  onPress,
}: {
  itemGroup: ReceiptItemGroup;
  currencyCode: string | null;
  onPress?: () => void;
}) {
  const specialQuantity = isSpecialQuantity(itemGroup);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      className="-mx-2 rounded-lg px-2 py-1 active:bg-accent"
    >
      <View className="flex-row items-start justify-between gap-6">
        <View className="flex-1 flex-row flex-wrap items-center gap-x-1">
          <Text className="text-sm font-medium">{itemGroup.description}</Text>
          {specialQuantity && (
            <Text className="text-xs text-muted-foreground">
              {`(per ${itemGroup.quantityUnit ?? "unit"}: ${formatAmount(itemGroup.unitPrice, currencyCode)})`}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm font-medium">
            {formatAmount(getItemGroupTotal(itemGroup), currencyCode)}
          </Text>
          {onPress && <Icon as={Pencil} size={12} className="text-muted-foreground" />}
        </View>
      </View>

      <View className="ml-3 mt-2 gap-2">
        {itemGroup.items.map((item) => (
          <View key={item.id} className="gap-2">
            <View className="flex-row justify-between gap-10">
              <Text className="flex-1 text-xs text-muted-foreground">
                {itemGroup.description}
                {specialQuantity &&
                  ` (${itemGroup.quantity} ${itemGroup.quantityUnit ?? "unit"})`}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {formatAmount(item.price, currencyCode)}
              </Text>
            </View>
            {item.supplements.map((supplement) => (
              <View key={supplement.id} className="ml-3 flex-row justify-between gap-8">
                <Text className="text-xs text-muted-foreground">
                  + {supplement.description}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {formatAmount(supplement.price, currencyCode)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Pressable>
  );
}
