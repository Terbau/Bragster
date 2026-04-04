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
import { useState, type ComponentProps } from "react";
import { receiptScanAndCreateSmartReceiptAction } from "../smart-receipt/new/actions";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";

interface ScanReceiptModalProps
  extends Omit<ComponentProps<typeof Dialog>, "children"> {}

export const ScanReceiptModal = ({ ...props }: ScanReceiptModalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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
          submitLabel="Scan"
          fields={{
            file: createFileInput({
              label: "Upload Receipt",
            }),
          }}
          action={receiptScanAndCreateSmartReceiptAction}
          submitIsLoading={isScanning}
          onActionLoading={(isLoading) => setIsScanning(isLoading)}
          onActionResult={(result) => {
            if (!result) {
              console.error("No result from action");
              return;
            }
            router.push(`/smart-receipt/${result.id}?setup=true`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
