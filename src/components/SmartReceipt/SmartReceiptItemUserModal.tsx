"use client";

import {
  useEffect,
  useId,
  useState,
  useTransition,
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
import type { User } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { UserAssignListItem } from "./UserAssignListItem";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { LoadingButton } from "../LoadingButton/LoadingButton";
import { useMutation } from "@tanstack/react-query";
import { updateSmartReceiptPayments } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { useRouter } from "next/navigation";

interface SmartReceiptItemUserModalProps extends ComponentProps<typeof Dialog> {
  smartReceiptId: string;
  receiptItemId: string;
  users: User[];
  payments?: SmartReceiptWithItemsUsers["payments"];
}

export const SmartReceiptItemUserModal = ({
  smartReceiptId,
  receiptItemId,
  users,
  payments,
  ...props
}: SmartReceiptItemUserModalProps) => {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  const advancedModeId = useId();
  const selectAllId = useId();

  const { mutate, isPending } = useMutation({
    mutationFn: async (userIds: string[]) =>
      await updateSmartReceiptPayments(smartReceiptId, receiptItemId, userIds),
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        props.onOpenChange?.(false);
      });
    },
  });

  const handleOnCheckedChange = (userId: string, checked: boolean) => {
    if (checked) {
      setAssignedUserIds((prev) => [...prev, userId]);
    } else {
      setAssignedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked) {
      setAssignedUserIds(users.map((user) => user.id));
    } else {
      setAssignedUserIds([]);
    }
  };

  useEffect(() => {
    if (assignedUserIds.length === users.length) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }
  }, [assignedUserIds, users.length]);

  useEffect(() => {
    if (payments) {
      setAssignedUserIds(payments.map((payment) => payment.userId));
    }
  }, [payments]);

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
        <ul>
          {users.map((user) => (
            <UserAssignListItem
              key={user.id}
              user={user}
              isAdvancedMode={isAdvancedMode}
              checked={assignedUserIds.includes(user.id)}
              onCheckedChange={(checked) =>
                handleOnCheckedChange(user.id, checked)
              }
            />
          ))}
        </ul>

        <Separator />

        <div className="ml-auto flex flex-row gap-1 items-center">
          <LoadingButton
            onClick={() => mutate(assignedUserIds)}
            isLoading={isTransitionPending || isPending}
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
