import type { User as UserType } from "@/lib/generated/prisma";
import type { SmartReceiptWithUsers } from "@/types/receipt";
import { useState, useTransition, type ComponentProps } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar } from "../Avatar/Avatar";
import { formatDate } from "@/utils/date";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { useMutation } from "@tanstack/react-query";
import { addUsersAndGuestsToSmartReceipt } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SmartReceiptUserSearchModalExistingListItemProps
  extends Omit<ComponentProps<typeof AccordionItem>, "value"> {
  currentSmartReceiptId: string;
  smartReceipt: SmartReceiptWithUsers;
  formDisabled?: boolean;
  currentUserIsOwner?: boolean;
  currentUser: UserType;
}

export const SmartReceiptUserSearchModalExistingListItem = ({
  currentSmartReceiptId,
  smartReceipt,
  formDisabled = false,
  currentUserIsOwner = false,
  currentUser,
  ...props
}: SmartReceiptUserSearchModalExistingListItemProps) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [transitionIsPending, startTransition] = useTransition();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      userIds,
      guestNames,
    }: { userIds: string[]; guestNames: string[] }) =>
      await addUsersAndGuestsToSmartReceipt(
        currentSmartReceiptId,
        userIds,
        guestNames,
      ),
    onSuccess: () => {
      setConfirmModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
      toast.success("Users and guests added successfully");
    },
  });

  const handleConfirm = () => {
    mutate({
      userIds: smartReceipt.users.map((user) => user.id),
      guestNames: smartReceipt.guests.map((guest) => guest.name),
    });
  };

  return (
    <>
      <ConfirmModal
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        isLoading={isPending || transitionIsPending}
        description="Are you sure you want to add all users and guests from this smart receipt?"
      />
      <AccordionItem {...props} value={smartReceipt.id}>
        <AccordionTrigger className="text-sm hover:no-underline group">
          <span className="flex flex-row gap-1 items-center">
            <span className="group-hover:underline">
              {smartReceipt.receipt.merchantName}
            </span>
            <span className="text-muted-foreground">
              ({formatDate(smartReceipt.receipt.createdAt)})
            </span>

            <span className="mx-2">{"•"}</span>

            <span className="flex flex-row gap-0.5 items-center">
              <User className="h-4 w-4" />
              <span>
                {smartReceipt.users.length + smartReceipt.guests.length}
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setConfirmModalOpen(true)}
            className="w-full"
          >
            Add all
          </Button>
          <ul className="flex flex-col gap-2">
            {smartReceipt.users.map((user) => (
              <li key={user.id} className="flex flex-row gap-2 items-center">
                <Avatar email={user.email} className="scale-75" />
                <span>{user.email}</span>
              </li>
            ))}
            {smartReceipt.guests.map((guest) => (
              <li key={guest.id} className="flex flex-row gap-2 items-center">
                <Avatar email={guest.name} className="scale-75" />
                <span>
                  {guest.name}
                  <span className="text-muted-foreground"> (Guest)</span>
                </span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </>
  );
};
