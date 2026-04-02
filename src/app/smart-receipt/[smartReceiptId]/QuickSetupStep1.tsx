"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { StandardForm, type StandardFormHandle } from "@/components/Form/StandardForm";
import {
  createComboboxInput,
  createNumberInput,
} from "@/components/Form/Fields";
import { CURRENCIES } from "@/lib/currencies";
import { UpdateCurrencySchema } from "@/types/action";
import { updateSmartReceiptCurrencyProperties } from "./actions";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";

interface QuickSetupStep1Props {
  smartReceipt: SmartReceiptWithItemsUsers;
  onSuccess: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export interface QuickSetupStep1Handle {
  submit: () => void;
}

const currencies = Object.entries(CURRENCIES).map(([currencyCode, properties]) => ({
  label: `${currencyCode} - ${properties.name}`,
  value: currencyCode,
  keywords: [properties.name],
}));

export const QuickSetupStep1 = forwardRef<QuickSetupStep1Handle, QuickSetupStep1Props>(
  ({ smartReceipt, onSuccess, onLoadingChange }, ref) => {
    const formRef = useRef<StandardFormHandle<typeof UpdateCurrencySchema.shape>>(null);

    useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.submit(),
    }));

    return (
      <StandardForm
        ref={formRef}
        schema={UpdateCurrencySchema}
        defaultValues={{
          smartReceiptId: smartReceipt.id,
          currencyCode:
            smartReceipt.updatedCurrencyCode ??
            smartReceipt.receipt.currencyCode ??
            "",
          totalPrice:
            smartReceipt.updatedTotalPrice ?? smartReceipt.receipt.totalPrice,
        }}
        fields={{
          currencyCode: createComboboxInput({
            label: "Currency Code",
            items: currencies,
          }),
          totalPrice: createNumberInput({
            label: "Total Sum",
            step: 0.01,
            min: 0,
          }),
        }}
        action={updateSmartReceiptCurrencyProperties}
        onActionLoading={onLoadingChange}
        onActionResult={() => onSuccess()}
        className="[&>div:last-child]:hidden"
      />
    );
  },
);

QuickSetupStep1.displayName = "QuickSetupStep1";
