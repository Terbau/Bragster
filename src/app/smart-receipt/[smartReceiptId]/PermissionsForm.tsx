"use client";

import { StandardForm } from "@/components/Form";
import { createSelectInput } from "@/components/Form/Fields";
import { SmartReceiptAllowedPaymentEditor } from "@/lib/generated/prisma";
import { UpdateSmartReceiptPermissionsSchema } from "@/types/action";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { updateSmartReceiptPermissions } from "./actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface PermissionsFormProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  formDisabled?: boolean;
}

export const PermissionsForm = ({
  smartReceipt,
  formDisabled,
}: PermissionsFormProps) => {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const rerender = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <StandardForm
      formDisabled={formDisabled}
      schema={UpdateSmartReceiptPermissionsSchema}
      defaultValues={{
        smartReceiptId: smartReceipt.id,
        allowedPaymentEditors: smartReceipt.allowedPaymentEditors,
      }}
      fields={{
        allowedPaymentEditors: createSelectInput({
          label: "Who can edit payments?",
          items: [
            {
              label: "Only the owner",
              value: SmartReceiptAllowedPaymentEditor.OWNER,
            },
            {
              label: "Any authenticated user",
              value: SmartReceiptAllowedPaymentEditor.AUTHENTICATED_USERS,
            },
            {
              label: "Any guest",
              value: SmartReceiptAllowedPaymentEditor.GUESTS,
            },
            {
              label: "Anyone with the link",
              value: SmartReceiptAllowedPaymentEditor.ANYONE,
            },
          ],
          required: true,
        }),
      }}
      action={updateSmartReceiptPermissions}
      onActionResult={() => rerender()}
      submitLabel="Update"
    />
  );
};
