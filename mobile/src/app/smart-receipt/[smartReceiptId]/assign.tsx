import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SmartReceiptSheet } from "@/components/smart-receipt/SmartReceiptSheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useUpdatePayments } from "@/lib/queries";
import type { SmartReceiptDetailResponse } from "@/lib/types";

export default function AssignScreen() {
  return <SmartReceiptSheet>{(data) => <AssignForm data={data} />}</SmartReceiptSheet>;
}

function AssignForm({ data }: { data: SmartReceiptDetailResponse }) {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { smartReceipt } = data;
  const updatePayments = useUpdatePayments(smartReceipt.id);

  const [userIds, setUserIds] = useState(() =>
    smartReceipt.payments.filter((p) => p.receiptItemId === itemId).map((p) => p.userId),
  );
  const [guestIds, setGuestIds] = useState(() =>
    smartReceipt.guestPayments
      .filter((p) => p.receiptItemId === itemId)
      .map((p) => p.guestId),
  );

  const itemGroup = smartReceipt.receipt.itemGroups.find((group) =>
    group.items.some((item) => item.id === itemId),
  );
  const description =
    itemGroup?.translations.at(-1)?.description ?? itemGroup?.description;
  const allSelected =
    userIds.length === smartReceipt.users.length &&
    guestIds.length === smartReceipt.guests.length;

  const setAll = (selected: boolean) => {
    setUserIds(selected ? smartReceipt.users.map((user) => user.id) : []);
    setGuestIds(selected ? smartReceipt.guests.map((guest) => guest.id) : []);
  };

  const toggle = (ids: string[], id: string, checked: boolean) =>
    checked ? [...ids, id] : ids.filter((existing) => existing !== id);

  const handleSave = () => {
    // Optimistic, so the sheet can close right away
    updatePayments.mutate({ itemId, userIds, guestIds });
    router.back();
  };

  return (
    <>
      <View className="gap-1">
        {description && <Text className="text-lg font-semibold">{description}</Text>}
        <Text className="text-sm text-muted-foreground">
          Select users from the list below to assign them to this item.
        </Text>
      </View>

      <View className="flex-row items-center justify-end gap-2">
        <Text className="text-sm font-medium">Select All</Text>
        <Switch value={allSelected} onValueChange={setAll} />
      </View>

      <View className="gap-2">
        {smartReceipt.users.map((user) => (
          <AssignRow
            key={user.id}
            name={user.email}
            avatar={<Avatar src={user.avatarUrl} email={user.email} />}
            checked={userIds.includes(user.id)}
            onCheckedChange={(checked) =>
              setUserIds((ids) => toggle(ids, user.id, checked))
            }
          />
        ))}
        {smartReceipt.guests.map((guest) => (
          <AssignRow
            key={guest.id}
            name={guest.name}
            isGuest
            avatar={<Avatar email={guest.name} />}
            checked={guestIds.includes(guest.id)}
            onCheckedChange={(checked) =>
              setGuestIds((ids) => toggle(ids, guest.id, checked))
            }
          />
        ))}
      </View>

      <Separator />

      <View className="flex-row gap-3">
        <Button variant="outline" className="flex-1" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button className="flex-1" onPress={handleSave}>
          Save
        </Button>
      </View>
    </>
  );
}

function AssignRow({
  name,
  isGuest = false,
  avatar,
  checked,
  onCheckedChange,
}: {
  name: string;
  isGuest?: boolean;
  avatar: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      className="flex-row items-center justify-between gap-2 rounded-lg py-1 active:opacity-70"
    >
      <View className="flex-1 flex-row items-center gap-2">
        {avatar}
        <Text className="shrink text-base" numberOfLines={1}>
          {name}
          {isGuest && <Text className="text-xs text-muted-foreground"> (Guest)</Text>}
        </Text>
      </View>
      <Switch value={checked} onValueChange={onCheckedChange} />
    </Pressable>
  );
}
