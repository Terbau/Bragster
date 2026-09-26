import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { useUpdatePermissions } from "@/lib/queries";
import { PERMISSION_OPTIONS } from "@/lib/smart-receipt";
import type { SmartReceiptWithItemsUsers } from "@/lib/types";

export function PermissionsForm({
  smartReceipt,
  disabled = false,
}: {
  smartReceipt: SmartReceiptWithItemsUsers;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(smartReceipt.allowedPaymentEditors);
  const updatePermissions = useUpdatePermissions(smartReceipt.id);

  useEffect(() => {
    setValue(smartReceipt.allowedPaymentEditors);
  }, [smartReceipt.allowedPaymentEditors]);

  return (
    <View className="gap-4">
      <View>
        <Label>Who can edit payments?</Label>
        <RadioGroup
          options={PERMISSION_OPTIONS}
          value={value}
          onChange={setValue}
          disabled={disabled}
        />
      </View>
      <Button
        onPress={() => updatePermissions.mutate(value)}
        isLoading={updatePermissions.isPending}
        disabled={disabled || value === smartReceipt.allowedPaymentEditors}
      >
        Update
      </Button>
    </View>
  );
}
