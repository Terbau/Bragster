import { BadgeCent, RefreshCcw } from "lucide-react-native";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldDescription, Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import {
  useConvertCurrency,
  useResetTotalPrice,
  useUpdateCurrency,
} from "@/lib/queries";
import type { SmartReceiptWithItemsUsers } from "@/lib/types";
import { fixedDecimal, parseAmount } from "@/lib/utils";
import { CurrencySelect } from "./CurrencySelect";

export interface CurrencyFormHandle {
  /** Saves the form, resolving `true` on success */
  submit: () => Promise<boolean>;
}

interface CurrencyFormProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  disabled?: boolean;
  /** The quick setup has its own buttons and only needs the fields */
  compact?: boolean;
}

export const CurrencyForm = forwardRef<CurrencyFormHandle, CurrencyFormProps>(
  ({ smartReceipt, disabled = false, compact = false }, ref) => {
    const currentCurrency =
      smartReceipt.updatedCurrencyCode ?? smartReceipt.receipt.currencyCode ?? "";
    const currentTotal =
      smartReceipt.updatedTotalPrice ?? smartReceipt.receipt.totalPrice;

    const [currencyCode, setCurrencyCode] = useState(currentCurrency);
    const [total, setTotal] = useState(String(currentTotal));
    const [isConverterOpen, setIsConverterOpen] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const updateCurrency = useUpdateCurrency(smartReceipt.id);
    const resetTotalPrice = useResetTotalPrice(smartReceipt.id);

    // Show the saved values when they change
    useEffect(() => {
      setCurrencyCode(currentCurrency);
      setTotal(String(currentTotal));
    }, [currentCurrency, currentTotal]);

    const parsedTotal = parseAmount(total);
    const currencyError =
      currencyCode.length === 3 ? null : "Select the currency of the receipt.";
    const totalError =
      parsedTotal !== null && parsedTotal >= 0 ? null : "Enter a valid amount.";
    const isValid = !currencyError && !totalError;
    const isDirty = currencyCode !== currentCurrency || parsedTotal !== currentTotal;

    const save = () =>
      updateCurrency.mutateAsync({
        currencyCode,
        totalPrice: parsedTotal ?? undefined,
      });

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (!isValid) {
          setShowErrors(true);
          return false;
        }
        try {
          await save();
          return true;
        } catch {
          return false;
        }
      },
    }));

    return (
      <View className="gap-4">
        <View>
          <CurrencySelect
            label="Currency Code"
            value={currencyCode}
            onChange={setCurrencyCode}
            disabled={disabled}
          />
          {showErrors && currencyError && (
            <FieldDescription className="text-destructive">{currencyError}</FieldDescription>
          )}
        </View>

        <View>
          <Label>Total sum</Label>
          <View className="flex-row gap-2">
            <Input
              className="flex-1"
              value={total}
              onChangeText={setTotal}
              keyboardType="decimal-pad"
              editable={!disabled}
            />
            {!compact && smartReceipt.updatedTotalPrice !== null && (
              <Button
                variant="outline"
                size="icon"
                icon={RefreshCcw}
                accessibilityLabel="Reset to original total sum"
                disabled={disabled}
                isLoading={resetTotalPrice.isPending}
                onPress={() => resetTotalPrice.mutate(undefined)}
              />
            )}
            {!compact && (
              <Button
                variant="outline"
                size="icon"
                icon={BadgeCent}
                accessibilityLabel="Calculate total sum from another currency"
                disabled={disabled}
                onPress={() => setIsConverterOpen((open) => !open)}
              />
            )}
          </View>
          {showErrors && totalError && (
            <FieldDescription className="text-destructive">{totalError}</FieldDescription>
          )}
          {!compact && (
            <FieldDescription>
              If the total sum is incorrect, you can adjust it here. All receipt
              item prices will be modified to reflect the new sum.
            </FieldDescription>
          )}
        </View>

        {isConverterOpen && (
          <CurrencyConverter
            toCurrency={currencyCode}
            onResult={(amount) => {
              setTotal(String(fixedDecimal(amount, 2)));
              setIsConverterOpen(false);
            }}
          />
        )}

        {!compact && (
          <Button
            onPress={() => void save().catch(() => {})}
            isLoading={updateCurrency.isPending}
            disabled={disabled || !isDirty || !isValid}
          >
            Update
          </Button>
        )}
      </View>
    );
  },
);
CurrencyForm.displayName = "CurrencyForm";

function CurrencyConverter({
  toCurrency,
  onResult,
}: {
  toCurrency: string;
  onResult: (amount: number) => void;
}) {
  const [fromCurrency, setFromCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const convert = useConvertCurrency();
  const parsedAmount = parseAmount(amount);

  return (
    <View className="gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <View className="gap-1">
        <Text className="text-sm font-medium">Calculate Sum</Text>
        <Text className="text-xs text-muted-foreground">
          Converts an amount from another currency to{" "}
          {toCurrency || "the selected currency"}.
        </Text>
      </View>
      <CurrencySelect
        label="Currency Code (To convert from)"
        value={fromCurrency}
        onChange={setFromCurrency}
      />
      <View>
        <Label>Amount</Label>
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
        />
        <FieldDescription>
          The amount in the currency you want to convert from.
        </FieldDescription>
      </View>
      <Button
        variant="secondary"
        isLoading={convert.isPending}
        disabled={!fromCurrency || toCurrency.length !== 3 || parsedAmount === null}
        onPress={() =>
          parsedAmount !== null &&
          convert.mutate(
            { from: fromCurrency, to: toCurrency, amount: parsedAmount },
            { onSuccess: (result) => onResult(result.amount) },
          )
        }
      >
        Calculate
      </Button>
    </View>
  );
}
