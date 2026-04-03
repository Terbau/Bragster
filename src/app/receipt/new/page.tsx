"use client";

import { StandardForm } from "@/components/Form";
import { createFileInput } from "@/components/Form/Fields";
import { receiptScanAction } from "./actions";
import { ReceiptUploadSchema } from "@/types/smart-receipt";
import { useRouter } from "next/navigation";

export default function SmartReceiptNewPage() {
  const router = useRouter();

  return (
    <StandardForm
      title="Receipt Scanner"
      description="Upload a receipt to scan and extract information."
      notices={[
        {
          variant: "tip",
          message: (
            <>
              <strong>Tip:</strong> Use Adobe Scan to photograph your receipt,
              then export as JPEG. This gives much sharper results than a
              regular photo.
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
      action={receiptScanAction}
      onActionResult={(result) => {
        if (!result) {
          console.error("No result from action");
          return;
        }

        router.push(`/receipt/${result.id}`);
      }}
    />
  );
}
