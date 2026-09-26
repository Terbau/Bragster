import { Pressable, View } from "react-native";
import { AvatarGroup, EmptyAvatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { formatAmount } from "@/lib/format";
import { getItemGroupTotal, isSpecialQuantity } from "@/lib/smart-receipt";
import type {
  ReceiptItem,
  ReceiptItemGroup,
  SmartReceiptGuest,
  User,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { TranslatedText, TranslationBadge } from "./TranslatedText";

export interface ItemAssignees {
  users: User[];
  guests: SmartReceiptGuest[];
}

interface SmartReceiptItemGroupProps {
  itemGroup: ReceiptItemGroup;
  currencyCode: string;
  priceFactor: number;
  getAssignees: (itemId: string) => ItemAssignees;
  pendingItemIds: string[];
  canEditPayments: boolean;
  onItemPress: (item: ReceiptItem) => void;
}

export function SmartReceiptItemGroup({
  itemGroup,
  currencyCode,
  priceFactor,
  getAssignees,
  pendingItemIds,
  canEditPayments,
  onItemPress,
}: SmartReceiptItemGroupProps) {
  const translation = itemGroup.translations.at(-1);
  const specialQuantity = isSpecialQuantity(itemGroup);
  const description = translation?.description ?? itemGroup.description;

  return (
    <View>
      <View className="flex-row items-end gap-3">
        <View className="flex-1 gap-1">
          {translation && <TranslationBadge translation={translation} />}
          <View className="flex-row flex-wrap items-center gap-x-1">
            {translation ? (
              <TranslatedText
                translation={translation}
                originalText={itemGroup.description}
              />
            ) : (
              <Text className="text-sm font-medium">{itemGroup.description}</Text>
            )}
            {specialQuantity && (
              <Text className="text-xs text-muted-foreground">
                {`(per ${itemGroup.quantityUnit ?? "unit"}: ${formatAmount(itemGroup.unitPrice * priceFactor, currencyCode)})`}
              </Text>
            )}
          </View>
        </View>
        <Text className="text-sm font-medium">
          {formatAmount(getItemGroupTotal(itemGroup, priceFactor), currencyCode)}
        </Text>
      </View>

      <View className="mt-2 gap-2">
        {itemGroup.items.map((item) => (
          <SmartReceiptItemRow
            key={item.id}
            item={item}
            description={description}
            quantityLabel={
              specialQuantity
                ? `(${itemGroup.quantity} ${itemGroup.quantityUnit ?? "unit"})`
                : undefined
            }
            currencyCode={currencyCode}
            priceFactor={priceFactor}
            assignees={getAssignees(item.id)}
            isPending={pendingItemIds.includes(item.id)}
            canEditPayments={canEditPayments}
            onPress={() => onItemPress(item)}
          />
        ))}
      </View>
    </View>
  );
}

interface SmartReceiptItemRowProps {
  item: ReceiptItem;
  description: string;
  quantityLabel?: string;
  currencyCode: string;
  priceFactor: number;
  assignees: ItemAssignees;
  isPending: boolean;
  canEditPayments: boolean;
  onPress: () => void;
}

function SmartReceiptItemRow({
  item,
  description,
  quantityLabel,
  currencyCode,
  priceFactor,
  assignees,
  isPending,
  canEditPayments,
  onPress,
}: SmartReceiptItemRowProps) {
  const hasPayment = assignees.users.length > 0 || assignees.guests.length > 0;
  const names = [
    ...assignees.users.map((user) => user.email.split("@")[0]),
    ...assignees.guests.map((guest) => guest.name),
  ].join(", ");

  return (
    <Pressable
      disabled={!canEditPayments}
      onPress={onPress}
      className={cn(
        "ml-1 flex-row items-center gap-2 rounded p-2",
        hasPayment
          ? "border-2 border-green-600 bg-green-600/30 dark:bg-green-900/50"
          : "border border-foreground/15",
        !hasPayment && canEditPayments && "border-dashed",
        canEditPayments && "active:opacity-70",
        isPending && "opacity-50",
      )}
    >
      {hasPayment ? (
        <View className="items-center gap-0.5">
          <AvatarGroup users={assignees.users} guests={assignees.guests} size="sm" />
          <Text
            className="max-w-[80px] text-center text-[10px] leading-3 text-muted-foreground"
            numberOfLines={1}
          >
            {names}
          </Text>
        </View>
      ) : (
        <EmptyAvatar />
      )}

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-xs text-muted-foreground">
            {description}
            {quantityLabel ? ` ${quantityLabel}` : ""}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatAmount(item.price * priceFactor, currencyCode)}
          </Text>
        </View>
        {item.supplements.map((supplement) => (
          <View key={supplement.id} className="ml-3 mt-2 flex-row justify-between gap-8">
            <Text className="text-xs text-muted-foreground">+ {supplement.description}</Text>
            <Text className="text-xs text-muted-foreground">
              {formatAmount(supplement.price * priceFactor, currencyCode)}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}
