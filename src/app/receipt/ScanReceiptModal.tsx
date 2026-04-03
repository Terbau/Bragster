"use client";

import { StandardForm } from "@/components/Form";
import { createFileInput } from "@/components/Form/Fields";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReceiptUploadSchema } from "@/types/smart-receipt";
import { useEffect, useState, type ComponentProps } from "react";
import { receiptScanAndCreateSmartReceiptAction } from "../smart-receipt/new/actions";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import type { ReceiptWithItems } from "@/types/receipt";
import {
  translateReceiptItemGroups,
  translateReceiptItemSupplements,
} from "./actions";
import { ShiningText } from "@/components/ShiningText/ShiningText";

interface ScanReceiptModalProps
  extends Omit<ComponentProps<typeof Dialog>, "children"> {
  // children: ReactNode;
}

type ScanPhase = "idle" | "scanning" | "translating" | "finalizing";

const getUpdateText = (phase: ScanPhase) => {
  switch (phase) {
    case "scanning":
      return "Scanning receipt. This may take a minute or two...";
    case "translating":
      return "Translating using AI...";
    case "finalizing":
      return "Finalizing...";
    default:
      return "";
  }
};

export const ScanReceiptModal = ({ ...props }: ScanReceiptModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [updateText, setUpdateText] = useState("");

  const translateReceiptItems = async (
    itemGroups: ReceiptWithItems["itemGroups"],
  ) => {
    try {
      setPhase("translating");

      const itemGroupIds = itemGroups.map((ig) => ig.id);
      const supplementIds = itemGroups.flatMap((ig) =>
        ig.items.flatMap((item) => item.supplements.map((s) => s.id)),
      );

      const [itemGroupTranslations, supplementTranslations] = await Promise.all(
        [
          translateReceiptItemGroups(itemGroupIds),
          translateReceiptItemSupplements(supplementIds),
        ],
      );

      console.log("Item Group Translations:", itemGroupTranslations);
      console.log("Supplement Translations:", supplementTranslations);

      setPhase("finalizing");
    } catch (error) {
      console.error("Error translating receipt items:", error);
      setPhase("idle");
    }
  };

  useEffect(() => {
    setUpdateText(getUpdateText(phase));
  }, [phase]);

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center space-x-2 transform hover:scale-105"
        >
          <ScanLine className="w-5 h-5" />
          <span>Scan New Receipt</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">Scan receipt modal</DialogTitle>
        <StandardForm
          title="Smart Receipt Scanner"
          description="Upload a receipt to scan and extract information. A smart receipt will be created based on the scanned data."
          notices={[
            {
              variant: "tip",
              message: (
                <>
                  <strong>Tip:</strong> Use Adobe Scan to photograph your
                  receipt, then export as JPEG. This gives much sharper results
                  than a regular photo.
                </>
              ),
            },
          ]}
          schema={ReceiptUploadSchema}
          submitLabel="Create"
          fields={{
            file: createFileInput({
              label: "Upload Receipt",
            }),
          }}
          action={receiptScanAndCreateSmartReceiptAction}
          submitIsLoading={phase !== "idle"}
          onActionLoading={(isLoading) => setPhase(isLoading ? "scanning" : "idle")}
          onActionResult={async (result) => {
            if (!result) {
              console.error("No result from action");
              return;
            }

            await translateReceiptItems(result.receipt.itemGroups);

            router.push(`/smart-receipt/${result.id}?setup=true`);
          }}
        />
        {updateText !== "" && (
          <ShiningText className="text-sm">{updateText}</ShiningText>
        )}
      </DialogContent>
    </Dialog>
  );
};
