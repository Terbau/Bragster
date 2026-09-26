import { Check, ChevronDown, ChevronUp, User as UserIcon, UserRoundPlus, X } from "lucide-react-native";
import { useState } from "react";
import { Alert as NativeAlert, Pressable, View } from "react-native";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SeparatorWithText } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/format";
import { useDebouncedValue } from "@/lib/hooks";
import {
  useAddGuest,
  useAddParticipants,
  useAddUser,
  useGuestNameValidity,
  useMySmartReceipts,
  useRemoveGuest,
  useRemoveUser,
  useUserSearch,
} from "@/lib/queries";
import type { SmartReceiptWithItemsUsers, SmartReceiptWithUsers } from "@/lib/types";
import { cn, formatName } from "@/lib/utils";

interface UserManagementProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  isOwner: boolean;
}

/** Add and remove users and guests (SmartReceiptUserSearchModal on the website) */
export function UserManagement({ smartReceipt, isOwner }: UserManagementProps) {
  const [tab, setTab] = useState<"add" | "manage">("add");
  const formDisabled = !isOwner;

  return (
    <View className="gap-4">
      {formDisabled && (
        <Alert variant="destructive" title="Disabled">
          You do not have permission to manage users on this smart receipt.
        </Alert>
      )}

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "add", label: "Add users" },
          { value: "manage", label: "Manage users" },
        ]}
      />

      {tab === "add" ? (
        <View className="gap-4">
          <SeparatorWithText text="Add users" />
          <UserSearch smartReceipt={smartReceipt} disabled={formDisabled} />

          <SeparatorWithText text="Or add guests" />
          <AddGuest smartReceiptId={smartReceipt.id} disabled={formDisabled} />

          <SeparatorWithText text="Or add from existing smart receipt" />
          <ExistingSmartReceipts
            smartReceiptId={smartReceipt.id}
            disabled={formDisabled}
          />
        </View>
      ) : (
        <ParticipantList smartReceipt={smartReceipt} disabled={formDisabled} />
      )}
    </View>
  );
}

function UserSearch({
  smartReceipt,
  disabled,
}: {
  smartReceipt: SmartReceiptWithItemsUsers;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const { data: results, isFetching } = useUserSearch(debouncedQuery);
  const addUser = useAddUser(smartReceipt.id);
  const removeUser = useRemoveUser(smartReceipt.id);
  const [pendingUserIds, setPendingUserIds] = useState<string[]>([]);

  const toggleUser = (userId: string) => {
    if (pendingUserIds.includes(userId)) return;

    const isAdded = smartReceipt.users.some((user) => user.id === userId);
    setPendingUserIds((ids) => [...ids, userId]);
    (isAdded ? removeUser : addUser).mutate(userId, {
      onSettled: () => setPendingUserIds((ids) => ids.filter((id) => id !== userId)),
    });
  };

  return (
    <View className="gap-2">
      <Input
        placeholder="Search for users to add..."
        value={query}
        onChangeText={setQuery}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      {debouncedQuery.length > 2 && (
        <View className="overflow-hidden rounded-lg border border-border">
          {isFetching && !results ? (
            <Spinner className="py-3" />
          ) : results && results.length > 0 ? (
            results.map((user, index) => (
              <Pressable
                key={user.id}
                disabled={disabled}
                onPress={() => toggleUser(user.id)}
                className={cn(
                  "flex-row items-center gap-3 px-3 py-2.5 active:bg-accent",
                  index > 0 && "border-t border-border",
                )}
              >
                <Avatar src={user.avatarUrl} email={user.email} size="sm" />
                <Text className="flex-1 text-sm" numberOfLines={1}>
                  {user.email}
                </Text>
                {pendingUserIds.includes(user.id) ? (
                  <Spinner size="small" />
                ) : (
                  smartReceipt.users.some((u) => u.id === user.id) && (
                    <Icon as={Check} size={18} />
                  )
                )}
              </Pressable>
            ))
          ) : (
            <Text className="px-3 py-3 text-center text-sm text-muted-foreground">
              No users found.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function AddGuest({
  smartReceiptId,
  disabled,
}: {
  smartReceiptId: string;
  disabled: boolean;
}) {
  const [guestName, setGuestName] = useState("");
  const debouncedName = useDebouncedValue(guestName, 400);
  const validity = useGuestNameValidity(smartReceiptId, debouncedName);
  const addGuest = useAddGuest(smartReceiptId);

  const isNameLongEnough = formatName(guestName).length >= 2;
  const isValidating =
    isNameLongEnough && (validity.isFetching || guestName !== debouncedName);
  const nameTaken = !isValidating && validity.data?.existing === true;
  const canAdd = isNameLongEnough && !disabled && validity.data?.valid !== false;

  const submit = () => {
    if (canAdd) {
      addGuest.mutate(guestName, { onSuccess: () => setGuestName("") });
    }
  };

  return (
    <View>
      <View className="flex-row gap-2">
        <View className="flex-1 justify-center">
          <Input
            placeholder="Guest name..."
            value={guestName}
            onChangeText={setGuestName}
            editable={!disabled}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={submit}
            className="pr-9"
          />
          <View className="absolute right-3">
            {isValidating ? (
              <Spinner size="small" />
            ) : (
              isNameLongEnough &&
              validity.data?.valid && (
                <Icon as={Check} size={16} className="text-green-500" />
              )
            )}
          </View>
        </View>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11"
          icon={UserRoundPlus}
          accessibilityLabel="Add guest"
          isLoading={addGuest.isPending}
          disabled={!canAdd}
          onPress={submit}
        />
      </View>
      {nameTaken && (
        <Text className="mt-2 text-xs text-red-400">
          Guest by this name already exists.
        </Text>
      )}
    </View>
  );
}

function ExistingSmartReceipts({
  smartReceiptId,
  disabled,
}: {
  smartReceiptId: string;
  disabled: boolean;
}) {
  const { data, isPending } = useMySmartReceipts();
  const others = data?.filter((smartReceipt) => smartReceipt.id !== smartReceiptId);

  if (isPending) {
    return <Spinner />;
  }
  if (!others || others.length === 0) {
    return (
      <Text className="text-center text-sm text-muted-foreground">
        No smart receipts found.
      </Text>
    );
  }

  return (
    <View>
      {others.map((smartReceipt, index) => (
        <ExistingSmartReceiptRow
          key={smartReceipt.id}
          targetSmartReceiptId={smartReceiptId}
          smartReceipt={smartReceipt}
          disabled={disabled}
          isLast={index === others.length - 1}
        />
      ))}
    </View>
  );
}

function ExistingSmartReceiptRow({
  targetSmartReceiptId,
  smartReceipt,
  disabled,
  isLast,
}: {
  targetSmartReceiptId: string;
  smartReceipt: SmartReceiptWithUsers;
  disabled: boolean;
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const addParticipants = useAddParticipants(targetSmartReceiptId);

  const confirmAddAll = () =>
    NativeAlert.alert(
      "Add all",
      "Are you sure you want to add all users and guests from this smart receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add all",
          onPress: () =>
            addParticipants.mutate({
              userIds: smartReceipt.users.map((user) => user.id),
              guestNames: smartReceipt.guests.map((guest) => guest.name),
            }),
        },
      ],
    );

  return (
    <View className={cn("border-border", !isLast && "border-b")}>
      <Pressable
        onPress={() => setIsExpanded((expanded) => !expanded)}
        className="flex-row items-center gap-2 py-3 active:opacity-60"
      >
        <Text className="shrink text-sm font-medium" numberOfLines={1}>
          {smartReceipt.receipt.merchantName}
        </Text>
        <Text className="text-sm text-muted-foreground">
          ({formatDate(smartReceipt.receipt.createdAt)})
        </Text>
        <Text className="text-sm">•</Text>
        <Icon as={UserIcon} size={16} />
        <Text className="text-sm">
          {smartReceipt.users.length + smartReceipt.guests.length}
        </Text>
        <Icon
          as={isExpanded ? ChevronUp : ChevronDown}
          size={16}
          className="ml-auto text-muted-foreground"
        />
      </Pressable>

      {isExpanded && (
        <View className="gap-3 pb-4">
          <Button
            variant="outline"
            isLoading={addParticipants.isPending}
            disabled={disabled}
            onPress={confirmAddAll}
          >
            Add all
          </Button>
          {smartReceipt.users.map((user) => (
            <View key={user.id} className="flex-row items-center gap-2">
              <Avatar email={user.email} src={user.avatarUrl} size="sm" />
              <Text className="shrink text-sm" numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          ))}
          {smartReceipt.guests.map((guest) => (
            <View key={guest.id} className="flex-row items-center gap-2">
              <Avatar email={guest.name} size="sm" />
              <Text className="text-sm">
                {guest.name}
                <Text className="text-sm text-muted-foreground"> (Guest)</Text>
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ParticipantList({
  smartReceipt,
  disabled,
}: {
  smartReceipt: SmartReceiptWithItemsUsers;
  disabled: boolean;
}) {
  const removeUser = useRemoveUser(smartReceipt.id);
  const removeGuest = useRemoveGuest(smartReceipt.id);

  const confirmRemove = (onConfirm: () => void) =>
    NativeAlert.alert(
      "Are you sure you want to remove this user?",
      "Removing this user will also remove all their payments from this smart receipt. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: onConfirm },
      ],
    );

  return (
    <View className="gap-2">
      {smartReceipt.users.map((user) => {
        const isReceiptOwner = user.id === smartReceipt.receipt.userId;
        const isRemoving = removeUser.isPending && removeUser.variables === user.id;
        return (
          <ParticipantRow
            key={user.id}
            name={user.email}
            label={isReceiptOwner ? "(Owner)" : undefined}
            avatar={<Avatar src={user.avatarUrl} email={user.email} />}
            isRemoving={isRemoving}
            // The owner can't be removed
            canRemove={!disabled && !isReceiptOwner}
            onRemove={() => confirmRemove(() => removeUser.mutate(user.id))}
          />
        );
      })}
      {smartReceipt.guests.map((guest) => (
        <ParticipantRow
          key={guest.id}
          name={guest.name}
          label="(Guest)"
          avatar={<Avatar email={guest.name} />}
          isRemoving={removeGuest.isPending && removeGuest.variables === guest.id}
          canRemove={!disabled}
          onRemove={() => confirmRemove(() => removeGuest.mutate(guest.id))}
        />
      ))}
    </View>
  );
}

function ParticipantRow({
  name,
  label,
  avatar,
  isRemoving,
  canRemove,
  onRemove,
}: {
  name: string;
  label?: string;
  avatar: React.ReactNode;
  isRemoving: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2 p-1">
      {avatar}
      <Text className="flex-1 text-sm" numberOfLines={1}>
        {name}
        {label && <Text className="text-sm text-muted-foreground"> {label}</Text>}
      </Text>
      <Button
        variant="destructive"
        size="icon"
        className="h-8 w-8"
        icon={X}
        accessibilityLabel={`Remove ${name}`}
        isLoading={isRemoving}
        disabled={!canRemove}
        onPress={onRemove}
      />
    </View>
  );
}
