"use client";

import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { UserAssignListItem } from "./UserAssignListItem";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LoadingButton } from "../LoadingButton/LoadingButton";

interface SmartReceiptItemUserModalProps extends ComponentProps<typeof Dialog> {
  users: User[];
  guests: SmartReceiptGuest[];
  payments?: SmartReceiptWithItemsUsers["payments"];
  guestPayments?: SmartReceiptWithItemsUsers["guestPayments"];
  onSave: (userIds: string[], guestIds: string[]) => void;
  isSaving: boolean;
}

export const SmartReceiptItemUserModal = ({
  users,
  guests,
  payments,
  guestPayments,
  onSave,
  isSaving,
  ...props
}: SmartReceiptItemUserModalProps) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [assignedGuestIds, setAssignedGuestIds] = useState<string[]>([]);

  const selectAllId = useId();

  const handleOnCheckedChangeUser = (userId: string, checked: boolean) => {
    if (checked) {
      setAssignedUserIds((prev) => [...prev, userId]);
    } else {
      setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleOnCheckedChangeGuest = (guestId: string, checked: boolean) => {
    if (checked) {
      setAssignedGuestIds((prev) => [...prev, guestId]);
    } else {
      setAssignedGuestIds((prev) => prev.filter((id) => id !== guestId));
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked) {
      setAssignedUserIds(users.map((user) => user.id));
      setAssignedGuestIds(guests.map((guest) => guest.id));
    } else {
      setAssignedUserIds([]);
      setAssignedGuestIds([]);
    }
  };

  useEffect(() => {
    if (
      assignedUserIds.length === users.length &&
      assignedGuestIds.length === guests.length
    ) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }
  }, [assignedUserIds, assignedGuestIds, users.length, guests.length]);

  useEffect(() => {
    if (payments) {
      setAssignedUserIds(payments.map((payment) => payment.userId));
    }
  }, [payments]);

  useEffect(() => {
    if (guestPayments) {
      setAssignedGuestIds(guestPayments.map((payment) => payment.guestId));
    }
  }, [guestPayments]);

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
          <DialogDescription>
            Select users from the list below to assign them to this item.
          </DialogDescription>
        </DialogHeader>
        {/* <span className="flex flex-row items-center gap-2">
          <Switch
            id={advancedModeId}
            checked={isAdvancedMode}
            onCheckedChange={setIsAdvancedMode}
          />
          <Label htmlFor={advancedModeId}>Advanced Mode</Label>
        </span> */}

        {/* <Separator />  */}

        <span className="flex flex-row items-center gap-2 ml-auto">
          <Label htmlFor={selectAllId}>Select All</Label>
          <Switch
            id={selectAllId}
            checked={selectAllChecked}
            onCheckedChange={handleSelectAllChange}
          />
        </span>
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <UserAssignListItem
              key={user.id}
              user={user}
              isAdvancedMode={isAdvancedMode}
              checked={assignedUserIds.includes(user.id)}
              onCheckedChange={(checked) =>
                handleOnCheckedChangeUser(user.id, checked)
              }
            />
          ))}
          {guests.map((guest) => (
            <UserAssignListItem
              key={guest.id}
              guest={guest}
              isAdvancedMode={isAdvancedMode}
              checked={assignedGuestIds.includes(guest.id)}
              onCheckedChange={(checked) =>
                handleOnCheckedChangeGuest(guest.id, checked)
              }
            />
          ))}
        </ul>

        <Separator />

        <div className="ml-auto flex flex-row gap-1 items-center">
          <LoadingButton
            onClick={() => {
              onSave(assignedUserIds, assignedGuestIds);
              props.onOpenChange?.(false);
            }}
            isLoading={isSaving}
            className="w-fit"
          >
            Save
          </LoadingButton>
          <DialogClose asChild>
            <Button variant="outline" className="w-fit">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
