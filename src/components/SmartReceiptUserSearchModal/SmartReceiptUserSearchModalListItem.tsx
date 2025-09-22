import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import { useState, useTransition, type ComponentProps } from "react";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import {
  removeGuestFromSmartReceipt,
  removeUserFromSmartReceipt,
} from "@/app/smart-receipt/[smartReceiptId]/actions";
import { Spinner } from "../Spinner";
import { X } from "lucide-react";
import { toast } from "sonner";

interface SmartReceiptUserSearchModalListItemProps
  extends ComponentProps<"li"> {
  user?: User;
  guest?: SmartReceiptGuest;
  smartReceiptId: string;
  currentUserIsOwner?: boolean;
  formDisabled?: boolean;
}

export const SmartReceiptUserSearchModalListItem = ({
  user,
  guest,
  smartReceiptId,
  formDisabled = false,
  currentUserIsOwner = false,
  className,
  ...props
}: SmartReceiptUserSearchModalListItemProps) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [_, startTransition] = useTransition();

  const router = useRouter();

  const rerender = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const { mutate: mutateRemoveUser, isPending: removeUserIsPending } =
    useMutation({
      mutationFn: async (userId: User["id"]) =>
        await removeUserFromSmartReceipt(smartReceiptId, userId),

      onSuccess: () => {
        setConfirmModalOpen(false);
        rerender();
        toast.success("User removed");
      },
    });

  const { mutate: mutateRemoveGuest, isPending: removeGuestIsPending } =
    useMutation({
      mutationFn: async (id: string) =>
        await removeGuestFromSmartReceipt(smartReceiptId, id),
      onSuccess: () => {
        setConfirmModalOpen(false);
        rerender();
        toast.success("Guest removed");
      },
    });

  const handleConfirm = () => {
    if (user) {
      mutateRemoveUser(user.id);
    } else if (guest) {
      mutateRemoveGuest(guest.id);
    }
  };

  if (!user && !guest) {
    throw new Error("Either user or guest must be provided");
  }

  return (
    <li
      className={cn("text-sm flex flex-row gap-2 items-center p-1", className)}
      {...props}
    >
      <ConfirmModal
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        isLoading={removeUserIsPending || removeGuestIsPending}
        title="Are you sure you want to remove this user?"
        description="Removing this user will also remove all their payments from this smart receipt. This action cannot be undone."
      />
      <Avatar src={user?.avatarUrl} email={user?.email ?? guest?.name} />
      <span className="font-regular">
        {user?.email}
        {guest?.name}

        {guest && (
          <span className="text-muted-foreground text-sm"> (Guest)</span>
        )}
      </span>
      {user && (
        <Button
          variant="destructive"
          size="iconSm"
          className="ml-auto"
          onClick={() => setConfirmModalOpen(true)}
          disabled={removeUserIsPending || formDisabled || currentUserIsOwner}
        >
          {removeUserIsPending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      )}
      {guest && (
        <Button
          variant="destructive"
          size="iconSm"
          className="ml-auto"
          onClick={() => setConfirmModalOpen(true)}
          disabled={removeGuestIsPending || formDisabled}
        >
          {removeGuestIsPending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      )}
    </li>
  );
};
