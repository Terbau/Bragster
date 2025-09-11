"use client";

import { StandardForm } from "@/components/Form";
import { createFileInput } from "@/components/Form/Fields";
import { receiptScanAndCreateSmartReceiptAction } from "./actions";
import { ReceiptUploadSchema } from "@/types/smart-receipt";
import { useRouter } from "next/navigation";

export default function SmartReceiptNewPage() {
  const router = useRouter();

  return (
    <div>
      <StandardForm
        title="Smart Receipt Scanner"
        description="Upload a receipt to scan and extract information. A smart receipt will be created based on the scanned data."
        schema={ReceiptUploadSchema}
        submitLabel="Create"
        fields={{
          file: createFileInput({
            label: "Upload Receipt",
          }),
        }}
        action={receiptScanAndCreateSmartReceiptAction}
        onActionResult={(result) => {
          if (!result) {
            console.error("No result from action");
            return;
          }

          router.push(`/smart-receipt/${result.id}`);
        }}
      />
    </div>
  );
}
