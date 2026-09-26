import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { UserManagement } from "@/components/smart-receipt/UserManagement";
import { Text } from "@/components/ui/text";

export default function UsersScreen() {
  return (
    <SmartReceiptSheet>
      {({ smartReceipt, viewer }) => (
        <>
          <Text className="text-sm text-muted-foreground">
            Here you can manage users associated with this smart receipt.
          </Text>
          <UserManagement smartReceipt={smartReceipt} isOwner={viewer.isOwner} />
        </>
      )}
    </SmartReceiptSheet>
  );
}
