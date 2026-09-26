import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldDescription, Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useReceipt, useUpdateReceiptItemGroup } from "@/lib/queries";
import type { ReceiptItemGroup } from "@/lib/types";
import { parseAmount } from "@/lib/utils";

// Replaces the website's hover-to-edit text, which doesn't work on touch screens
export default function EditItemScreen() {
  const { receiptId, itemGroupId } = useLocalSearchParams<{
    receiptId: string;
    itemGroupId: string;
  }>();
  const { data, error, isPending } = useReceipt(receiptId);
  const itemGroup = data?.receipt.itemGroups.find((group) => group.id === itemGroupId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (!itemGroup) {
    return <ErrorState error={error ?? new Error("Item not found")} />;
  }

  return (
    <EditItemForm
      receiptId={receiptId}
      itemGroup={itemGroup}
      currencyCode={data?.receipt.currencyCode ?? null}
    />
  );
}

function EditItemForm({
  receiptId,
  itemGroup,
  currencyCode,
}: {
  receiptId: string;
  itemGroup: ReceiptItemGroup;
  currencyCode: string | null;
}) {
  const [description, setDescription] = useState(itemGroup.description);
  const [price, setPrice] = useState(String(itemGroup.price));
  const updateItemGroup = useUpdateReceiptItemGroup(receiptId);

  const parsedPrice = parseAmount(price);
  const descriptionChanged =
    description.trim() !== "" && description.trim() !== itemGroup.description;
  const priceChanged = parsedPrice !== null && parsedPrice !== itemGroup.price;

  const handleSave = () =>
    // Only send what changed, like the website does
    updateItemGroup.mutate(
      {
        itemGroupId: itemGroup.id,
        ...(descriptionChanged ? { description: description.trim() } : {}),
        ...(priceChanged ? { price: parsedPrice } : {}),
      },
      { onSuccess: () => router.back() },
    );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-5"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View>
        <Label>Description</Label>
        <Input
          value={description}
          onChangeText={setDescription}
          autoFocus
          returnKeyType="done"
        />
      </View>

      <View>
        <Label>{`Price${currencyCode ? ` (${currencyCode})` : ""}`}</Label>
        <Input value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <FieldDescription>The total price of this line on the receipt.</FieldDescription>
      </View>

      <Button
        onPress={handleSave}
        isLoading={updateItemGroup.isPending}
        disabled={!descriptionChanged && !priceChanged}
      >
        Save
      </Button>
    </ScrollView>
  );
}
