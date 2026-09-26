import { useEffect, useState } from "react";
import { View } from "react-native";
import { CurrencySelect } from "@/components/smart-receipt/CurrencySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldDescription, Label } from "@/components/ui/label";
import { formatAmount } from "@/lib/format";
import type { ReceiptDraft, ReceiptField } from "@/lib/receipt-draft";
import { fixedDecimal, parseAmount } from "@/lib/utils";
import { EditSheet } from "./EditSheet";

type Fields = Pick<ReceiptDraft, "merchantName" | "receiptDate" | "totalPrice" | "currencyCode">;

interface ReceiptFieldsSheetProps {
  visible: boolean;
  draft: ReceiptDraft;
  /** Sum of the items, offered as the total */
  itemsTotal: number;
  focus?: ReceiptField;
  onDone: (fields: Fields) => void;
  onCancel: () => void;
}

const pad = (value: number) => String(value).padStart(2, "0");

const toDateText = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toTimeText = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** "2026-09-24" + "18:42" in local time, `undefined` when invalid */
const parseDateTime = (dateText: string, timeText: string): string | null | undefined => {
  if (dateText.trim() === "") return null;
  const dateMatch = dateText.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const timeMatch = timeText.trim() === "" ? ["", "0", "0"] : timeText.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!dateMatch || !timeMatch) return undefined;

  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hours, minutes] = timeMatch.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    hours > 23 ||
    minutes > 59
  ) {
    return undefined;
  }
  return date.toISOString();
};

export function ReceiptFieldsSheet({
  visible,
  draft,
  itemsTotal,
  focus,
  onDone,
  onCancel,
}: ReceiptFieldsSheetProps) {
  const [merchantName, setMerchantName] = useState("");
  const [dateText, setDateText] = useState("");
  const [timeText, setTimeText] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [total, setTotal] = useState("");

  useEffect(() => {
    if (visible) {
      setMerchantName(draft.merchantName);
      setDateText(toDateText(draft.receiptDate));
      setTimeText(toTimeText(draft.receiptDate));
      setCurrencyCode(draft.currencyCode ?? "");
      setTotal(String(draft.totalPrice));
    }
  }, [visible, draft]);

  const receiptDate = parseDateTime(dateText, timeText);
  const parsedTotal = parseAmount(total);
  const errors = {
    merchantName: merchantName.trim() === "" ? "Enter the store name." : null,
    date: receiptDate === undefined ? "Use the format 2026-09-24 and 18:42." : null,
    total: parsedTotal === null || parsedTotal < 0 ? "Enter a total of 0 or more." : null,
  };
  const isValid = Object.values(errors).every((error) => error === null);

  return (
    <EditSheet
      visible={visible}
      title="Receipt details"
      onCancel={onCancel}
      doneDisabled={!isValid}
      onDone={() =>
        isValid &&
        onDone({
          merchantName: merchantName.trim(),
          receiptDate: receiptDate ?? null,
          totalPrice: parsedTotal as number,
          currencyCode: currencyCode || null,
        })
      }
    >
      <View>
        <Label>Store</Label>
        <Input
          value={merchantName}
          onChangeText={setMerchantName}
          autoFocus={focus === "merchantName"}
        />
        {errors.merchantName && (
          <FieldDescription className="text-destructive">{errors.merchantName}</FieldDescription>
        )}
      </View>

      <View>
        <View className="flex-row gap-3">
          <View className="flex-[3]">
            <Label>Date</Label>
            <Input
              value={dateText}
              onChangeText={setDateText}
              placeholder="2026-09-24"
              keyboardType="numbers-and-punctuation"
              autoFocus={focus === "receiptDate"}
            />
          </View>
          <View className="flex-[2]">
            <Label>Time</Label>
            <Input
              value={timeText}
              onChangeText={setTimeText}
              placeholder="18:42"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        {errors.date && (
          <FieldDescription className="text-destructive">{errors.date}</FieldDescription>
        )}
      </View>

      <CurrencySelect label="Currency" value={currencyCode} onChange={setCurrencyCode} />

      <View>
        <Label>Total</Label>
        <Input
          value={total}
          onChangeText={setTotal}
          keyboardType="decimal-pad"
          autoFocus={focus === "totalPrice"}
        />
        <FieldDescription className={errors.total ? "text-destructive" : undefined}>
          {errors.total ??
            `The items add up to ${formatAmount(itemsTotal, currencyCode || null)}.`}
        </FieldDescription>
        {parsedTotal !== fixedDecimal(itemsTotal, 2) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 self-start"
            onPress={() => setTotal(String(fixedDecimal(itemsTotal, 2)))}
          >
            Use the sum of the items
          </Button>
        )}
      </View>
    </EditSheet>
  );
}
