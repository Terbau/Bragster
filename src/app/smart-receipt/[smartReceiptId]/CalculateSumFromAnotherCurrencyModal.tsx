import { StandardForm } from "@/components/Form";
import {
  createComboboxInput,
  createNumberInput,
} from "@/components/Form/Fields";
import type { ComboBoxItem } from "@/components/Form/Fields/ComboBox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";
import { getCurrencyConversions } from "./actions";
import { CalculateSumSchema } from "@/types/action";

interface CalculateSumFromAnotherCurrencyModalProps
  extends ComponentProps<typeof Dialog> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: ComboBoxItem[];
  currentCurrencyCode?: string;
  onActionResult: (
    result?: Awaited<ReturnType<typeof getCurrencyConversions>>,
  ) => void;
}

export const CalculateSumFromAnotherCurrencyModal = ({
  currencies,
  currentCurrencyCode,
  onActionResult,
  ...props
}: CalculateSumFromAnotherCurrencyModalProps) => {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculate Sum</DialogTitle>
          <DialogDescription>
            This is where you can calculate the sum from another currency.
          </DialogDescription>
        </DialogHeader>
        <StandardForm
          schema={CalculateSumSchema}
          defaultValues={{
            currencyToConvertTo: currentCurrencyCode,
          }}
          fields={{
            currencyToConvertTo: createComboboxInput({
              label: "Currency Code (To convert to)",
              items: currencies,
            }),
            currencyToConvertFrom: createComboboxInput({
              label: "Currency Code (To convert from)",
              items: currencies,
              autoFocus: true,
            }),
            amount: createNumberInput({
              label: "Amount",
              description:
                "The amount in the currency you want to convert from.",
              step: 0.01,
              min: 0,
              placeholder: "0",
            }),
          }}
          action={getCurrencyConversions}
          onActionResult={onActionResult}
          submitLabel="Calculate"
        />
      </DialogContent>
    </Dialog>
  );
};
