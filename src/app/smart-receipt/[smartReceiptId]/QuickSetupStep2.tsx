"use client";

import { SmartReceiptUserSearchModal } from "@/components/SmartReceiptUserSearchModal/SmartReceiptUserSearchModal";
import { Select } from "@/components/Form/Fields/Select";
import { SeparatorWithText } from "@/components/ui/separator";
import { SmartReceiptAllowedPaymentEditor } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import type { User } from "@/lib/generated/prisma";

interface QuickSetupStep2Props {
  smartReceipt: SmartReceiptWithItemsUsers;
  currentUser: User;
  selectedPermission: SmartReceiptAllowedPaymentEditor;
  onPermissionChange: (value: SmartReceiptAllowedPaymentEditor) => void;
}

const permissionItems = [
  { label: "Only the owner", value: SmartReceiptAllowedPaymentEditor.OWNER },
  {
    label: "Any authenticated user",
    value: SmartReceiptAllowedPaymentEditor.AUTHENTICATED_USERS,
  },
  { label: "Any guest", value: SmartReceiptAllowedPaymentEditor.GUESTS },
  {
    label: "Anyone with the link",
    value: SmartReceiptAllowedPaymentEditor.ANYONE,
  },
];

export function QuickSetupStep2({
  smartReceipt,
  currentUser,
  selectedPermission,
  onPermissionChange,
}: QuickSetupStep2Props) {
  return (
    <div className="flex flex-col gap-4">
      <SmartReceiptUserSearchModal
        smartReceiptId={smartReceipt.id}
        users={smartReceipt.users}
        guests={smartReceipt.guests}
        currentUserIsOwner={true}
        currentUser={currentUser}
      />

      <SeparatorWithText text="Payment permissions" />

      <Select
        label="Who can edit payments?"
        items={permissionItems}
        value={selectedPermission}
        onChange={(value) =>
          onPermissionChange(value as SmartReceiptAllowedPaymentEditor)
        }
      />
    </div>
  );
}
