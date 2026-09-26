import { Info, Plus, RotateCcw, Trash2, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { FieldDescription, Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { formatAmount } from "@/lib/format";
import { type DraftGroup, unitCount } from "@/lib/receipt-draft";
import { parseAmount } from "@/lib/utils";
import { EditSheet } from "./EditSheet";

interface ItemEditorSheetProps {
  /** The item being edited, `null` when closed */
  group: DraftGroup | null;
  /** The item as it is saved, missing for new items */
  original: DraftGroup | undefined;
  currencyCode: string | null;
  focus?: "description" | "price";
  onDone: (group: DraftGroup) => void;
  onCancel: () => void;
}

interface SupplementForm {
  description: string;
  price: string;
}

const numberText = (value: number) => String(Math.round(value * 1000) / 1000);

export function ItemEditorSheet({
  group,
  original,
  currencyCode,
  focus,
  onDone,
  onCancel,
}: ItemEditorSheetProps) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [price, setPrice] = useState("");
  const [supplements, setSupplements] = useState<SupplementForm[]>([]);

  useEffect(() => {
    if (group) {
      setDescription(group.description);
      setQuantity(numberText(group.quantity));
      setQuantityUnit(group.quantityUnit ?? "");
      setPrice(numberText(group.price));
      setSupplements(
        group.supplements.map((s) => ({ description: s.description, price: numberText(s.price) })),
      );
    }
  }, [group]);

  if (!group) {
    return <EditSheet visible={false} title="" onCancel={onCancel} onDone={onCancel}>{null}</EditSheet>;
  }

  const parsedQuantity = parseAmount(quantity);
  const parsedPrice = parseAmount(price);
  const parsedSupplements = supplements.map((s) => ({
    description: s.description.trim(),
    price: parseAmount(s.price),
  }));

  const quantityError =
    parsedQuantity === null || parsedQuantity <= 0
      ? "Enter a quantity above 0."
      : Number.isInteger(parsedQuantity) && parsedQuantity > 100
        ? "Whole quantities can be at most 100."
        : null;
  const errors = {
    description: description.trim() === "" ? "Enter a name." : null,
    quantity: quantityError,
    price: parsedPrice === null ? "Enter a price." : null,
    supplements: parsedSupplements.some((s) => s.description === "" || s.price === null)
      ? "Every deposit needs a name and a price."
      : null,
  };
  const isValid = Object.values(errors).every((error) => error === null);
  const units = parsedQuantity && parsedQuantity > 0 ? unitCount(parsedQuantity) : 1;

  const commit = (removed: boolean) => {
    if (!isValid && !removed) return;
    onDone({
      ...group,
      removed,
      ...(isValid
        ? {
            description: description.trim(),
            quantity: parsedQuantity as number,
            quantityUnit: quantityUnit.trim() || null,
            price: parsedPrice as number,
            supplements: parsedSupplements.map((s) => ({
              description: s.description,
              price: s.price as number,
            })),
          }
        : {}),
    });
  };

  return (
    <EditSheet
      visible
      title={original ? "Edit item" : "New item"}
      onCancel={onCancel}
      onDone={() => commit(false)}
      doneDisabled={!isValid}
    >
      {original && (
        <View className="flex-row gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
          <Icon as={Info} size={16} className="mt-0.5 text-muted-foreground" />
          <Text className="flex-1 text-xs leading-4 text-muted-foreground">
            Saved as &quot;{original.description}&quot;
            {original.quantity !== 1 ? ` × ${original.quantity}${original.quantityUnit ? ` ${original.quantityUnit}` : ""}` : ""}{" "}
            for {formatAmount(original.price, currencyCode)}. Changes are saved when you
            tap Save on the receipt.
          </Text>
        </View>
      )}

      <View>
        <Label>Name</Label>
        <Input
          value={description}
          onChangeText={setDescription}
          autoFocus={focus === "description" || !original}
          placeholder="E.g. Milk 1L"
        />
        {errors.description && description !== group.description && (
          <FieldDescription className="text-destructive">{errors.description}</FieldDescription>
        )}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Label>Quantity</Label>
          <Input value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
        </View>
        <View className="flex-1">
          <Label>Unit (optional)</Label>
          <Input
            value={quantityUnit}
            onChangeText={setQuantityUnit}
            placeholder="kg, l, …"
            autoCapitalize="none"
          />
        </View>
      </View>
      {errors.quantity ? (
        <FieldDescription className="-mt-3 text-destructive">{errors.quantity}</FieldDescription>
      ) : (
        <FieldDescription className="-mt-3">
          {units > 1
            ? `Split into ${units} units that can be assigned to different people.`
            : "Weighed items (like 0.452 kg) are one unit."}
        </FieldDescription>
      )}

      <View>
        <Label>{`Price for the whole line${currencyCode ? ` (${currencyCode})` : ""}`}</Label>
        <Input
          value={price}
          onChangeText={setPrice}
          keyboardType="numbers-and-punctuation"
          autoFocus={focus === "price"}
        />
        <FieldDescription className={errors.price ? "text-destructive" : undefined}>
          {errors.price ??
            (parsedPrice !== null && parsedQuantity && parsedQuantity > 0
              ? `${formatAmount(parsedPrice / parsedQuantity, currencyCode)} per ${quantityUnit.trim() || "unit"}. Use a negative price for discounts.`
              : "Use a negative price for discounts.")}
        </FieldDescription>
      </View>

      <View className="gap-2">
        <Label className="mb-0">Deposit per unit</Label>
        <FieldDescription className="mt-0">
          Added to each unit, e.g. bottle deposit (pant).
        </FieldDescription>
        {supplements.map((supplement, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <Input
              className="flex-1"
              value={supplement.description}
              placeholder="PANT"
              onChangeText={(text) =>
                setSupplements((list) =>
                  list.map((s, i) => (i === index ? { ...s, description: text } : s)),
                )
              }
            />
            <Input
              className="w-24"
              value={supplement.price}
              placeholder="0"
              keyboardType="numbers-and-punctuation"
              onChangeText={(text) =>
                setSupplements((list) =>
                  list.map((s, i) => (i === index ? { ...s, price: text } : s)),
                )
              }
            />
            <Pressable
              hitSlop={8}
              accessibilityLabel="Remove deposit"
              onPress={() => setSupplements((list) => list.filter((_, i) => i !== index))}
            >
              <Icon as={X} size={18} className="text-muted-foreground" />
            </Pressable>
          </View>
        ))}
        {errors.supplements && (
          <FieldDescription className="text-destructive">{errors.supplements}</FieldDescription>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          className="self-start"
          onPress={() => setSupplements((list) => [...list, { description: "PANT", price: "" }])}
        >
          Add deposit
        </Button>
      </View>

      {original && (
        <FieldDescription className="mt-0">
          Removing the item or lowering the quantity also removes its assignments in smart
          receipts.
        </FieldDescription>
      )}

      {group.removed ? (
        <Button variant="outline" icon={RotateCcw} onPress={() => commit(false)}>
          Restore item
        </Button>
      ) : (
        <Button
          variant="outline"
          icon={Trash2}
          textClassName="text-destructive"
          onPress={() => commit(true)}
        >
          {original ? "Remove item" : "Discard new item"}
        </Button>
      )}
    </EditSheet>
  );
}
