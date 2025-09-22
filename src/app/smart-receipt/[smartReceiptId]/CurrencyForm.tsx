"use client";

import { StandardForm } from "@/components/Form";
import {
  createComboboxInput,
  createNumberInput,
} from "@/components/Form/Fields";
import type { ComboBoxItem } from "@/components/Form/Fields/ComboBox";
import { BadgeCent, RefreshCcw } from "lucide-react";
import { CalculateSumFromAnotherCurrencyModal } from "./CalculateSumFromAnotherCurrencyModal";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StandardFormHandle } from "@/components/Form/StandardForm";
import {
  resetSmartReceiptTotalPrice,
  updateSmartReceiptCurrencyProperties,
} from "./actions";
import { UpdateCurrencySchema } from "@/types/action";
import { cn } from "@/utils/utils";

interface CurrencyFormProps {
  currencies: ComboBoxItem[];
  receiptTotalPrice: number;
  originalTotalSum: number;
  updatedTotalSum?: number;
  smartReceiptId: string;
  currentCurrencyCode?: string;
  formDisabled?: boolean;
}

export function CurrencyForm({
  currentCurrencyCode,
  receiptTotalPrice,
  originalTotalSum,
  updatedTotalSum,
  smartReceiptId,
  currencies,
  formDisabled,
}: CurrencyFormProps) {
  const router = useRouter();
  const formRef =
    useRef<StandardFormHandle<typeof UpdateCurrencySchema.shape>>(null);

  const [openCalculateSumModal, setOpenCalculateSumModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rerender = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <CalculateSumFromAnotherCurrencyModal
        open={openCalculateSumModal}
        onOpenChange={setOpenCalculateSumModal}
        currentCurrencyCode={currentCurrencyCode}
        currencies={currencies}
        onActionResult={(data) => {
          if (data) {
            formRef.current?.setValue("totalPrice", data.amount, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }

          setOpenCalculateSumModal(false);
        }}
      />
      <StandardForm
        formDisabled={formDisabled}
        ref={formRef}
        schema={UpdateCurrencySchema}
        defaultValues={{
          currencyCode: currentCurrencyCode || "",
          totalPrice: originalTotalSum,
          smartReceiptId,
        }}
        extraFieldButtons={{
          totalPrice: [
            {
              variant: "outline",
              size: "icon",
              type: "button",
              children: <RefreshCcw className="h-5 w-5" />,
              tooltip: "Reset to original total sum",
              onClick: async () => {
                await resetSmartReceiptTotalPrice(smartReceiptId);
                formRef.current?.setValue("totalPrice", receiptTotalPrice, {
                  shouldDirty: false,
                });
                rerender();
              },

              className: cn({ hidden: originalTotalSum !== updatedTotalSum }),
            },
            {
              variant: "outline",
              size: "icon",
              type: "button",
              children: <BadgeCent className="h-5 w-5" />,
              tooltip: "Calculate total sum from another currency",
              onClick: () => setOpenCalculateSumModal(true),
            },
          ],
        }}
        fields={{
          currencyCode: createComboboxInput({
            label: "Currency Code",
            items: currencies,
          }),
          totalPrice: createNumberInput({
            label: "Total sum",
            description:
              "If the total sum is incorrect, you can adjust it here. All receipt item prices will be modified to reflect the new sum.",
            step: 0.01,
            min: 0,
          }),
        }}
        action={updateSmartReceiptCurrencyProperties}
        onActionResult={() => rerender()}
        submitLabel="Update"
      />
    </>
  );
}
