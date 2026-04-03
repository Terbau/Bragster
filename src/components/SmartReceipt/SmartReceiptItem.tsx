"use client";

import { useEffect, useState, useTransition, type ComponentProps } from "react";
import type { ReceiptItem } from "../Receipt/ReceiptItem";
import { EmptyAvatar } from "../Avatar/EmptyAvatar";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { fixedDecimal } from "@/utils/number";
import { SmartReceiptItemUserModal } from "./SmartReceiptItemUserModal";
import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import { AvatarGroup } from "../AvatarGroup/AvatarGroup";
import { useMutation } from "@tanstack/react-query";
import { updateSmartReceiptPayments } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SmartReceiptItemProps
  extends Omit<ComponentProps<typeof ReceiptItem>, "item"> {
  description: string;
  smartReceiptId: string;
  item: ReceiptWithItems["itemGroups"][number]["items"][number];
  isSpecialQuantity?: boolean;
  quantity?: number;
  quantityUnit?: string | null;
  differencePercentageSum: number;
  users: User[];
  guests: SmartReceiptGuest[];
  payments?: SmartReceiptWithItemsUsers["payments"];
  guestPayments?: SmartReceiptWithItemsUsers["guestPayments"];
  quickAssignUserIds?: string[];
  quickAssignGuestIds?: string[];
  currentUserCanCreatePayments: boolean;
}

export const SmartReceiptItem = ({
  description,
  smartReceiptId,
  item,
  currencyCode,
  isSpecialQuantity = false,
  quantity,
  quantityUnit,
  differencePercentageSum,
  users,
  guests,
  payments,
  guestPayments,
  quickAssignUserIds,
  quickAssignGuestIds,
  currentUserCanCreatePayments,
  ...props
}: SmartReceiptItemProps) => {
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [optimisticUserIds, setOptimisticUserIds] = useState<string[] | null>(null);
  const [optimisticGuestIds, setOptimisticGuestIds] = useState<string[] | null>(null);

  if (isSpecialQuantity && (!quantity || !quantityUnit)) {
    console.warn(
      "SmartReceiptItem: isSpecialQuantity is true but quantity or quantityUnit is not provided.",
    );
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      userIds,
      guestIds,
    }: {
      userIds: string[];
      guestIds: string[];
    }) =>
      await updateSmartReceiptPayments(
        smartReceiptId,
        item.id,
        userIds,
        guestIds,
      ),
    onMutate: ({ userIds, guestIds }) => {
      setOptimisticUserIds(userIds);
      setOptimisticGuestIds(guestIds);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
    },
    onError: () => {
      setOptimisticUserIds(null);
      setOptimisticGuestIds(null);
      toast.error("Failed to update payment");
    },
  });

  useEffect(() => {
    if (!isPending && !isTransitionPending) {
      setOptimisticUserIds(null);
      setOptimisticGuestIds(null);
    }
  }, [isPending, isTransitionPending]);

  const showOptimistic = optimisticUserIds !== null;
  const displayedUsers = showOptimistic
    ? users.filter((u) => optimisticUserIds.includes(u.id))
    : (payments?.map((p) => p.user) ?? []);
  const displayedGuests = showOptimistic
    ? guests.filter((g) => (optimisticGuestIds ?? []).includes(g.id))
    : (guestPayments?.map((p) => p.guest) ?? []);
  const hasPayment = displayedUsers.length > 0 || displayedGuests.length > 0;

  const handleItemClick = () => {
    if (quickAssignUserIds === undefined || quickAssignGuestIds === undefined) {
      setAssignModalOpen(true);
      return;
    }

    mutate({
      userIds: quickAssignUserIds,
      guestIds: quickAssignGuestIds,
    });
  };

  const ButtonOrDiv = currentUserCanCreatePayments ? "button" : "div";

  return (
    <>
      <SmartReceiptItemUserModal
        users={users}
        guests={guests}
        initialUserIds={displayedUsers.map((u) => u.id)}
        initialGuestIds={displayedGuests.map((g) => g.id)}
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        onSave={(userIds, guestIds) => mutate({ userIds, guestIds })}
        isSaving={isPending || isTransitionPending}
      />
      <div {...props}>
        <ButtonOrDiv
          type={currentUserCanCreatePayments ? "button" : undefined}
          className={cn(
            "text-muted-foreground text-xs ml-1",
            "p-2 rounded",
            "flex flex-row items-center gap-2 w-full",
            hasPayment
              ? "border-2 border-green-600 bg-green-600/30 dark:bg-green-100 dark:bg-green-900/50"
              : "border border-foreground/15",
            { "border-dashed": !hasPayment && currentUserCanCreatePayments },
            { "animate-pulse": isPending },
          )}
          onClick={currentUserCanCreatePayments ? handleItemClick : undefined}
        >
          {hasPayment ? (
            <div className="flex flex-col items-center shrink-0 gap-0.5">
              <AvatarGroup
                users={displayedUsers}
                guests={displayedGuests}
                size="sm"
              />
              <span className="text-[10px] leading-none text-muted-foreground max-w-[80px] truncate text-center">
                {[
                  ...displayedUsers.map((u) => u.email.split("@")[0]),
                  ...displayedGuests.map((g) => g.name),
                ].join(", ")}
              </span>
            </div>
          ) : (
            <EmptyAvatar className="shrink-0" />
          )}
          <div className="grow">
            <div className="flex flex-row justify-between items-center gap-3 sm:gap-6">
              <span className="flex flex-row items-center gap-1">
                <span className="whitespace-normal text-left">
                  {description}
                </span>
                {isSpecialQuantity && (
                  <span className="text-xs text-muted-foreground">
                    {`(${quantity} ${quantityUnit ? quantityUnit : "unit"})`}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">
                {fixedDecimal(item.price * differencePercentageSum, 2)}{" "}
                {currencyCode}
              </span>
            </div>
            {item.supplements.length > 0 && (
              <ul className="flex flex-col gap-2">
                {item.supplements.map((supplement) => (
                  <li
                    key={supplement.id}
                    className="text-muted-foreground text-xs ml-3 flex flex-row justify-between gap-8"
                  >
                    <span>+ {supplement.description}</span>
                    <span className="whitespace-nowrap">
                      {fixedDecimal(
                        supplement.price * differencePercentageSum,
                        2,
                      )}{" "}
                      {currencyCode}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ButtonOrDiv>
      </div>
    </>
  );
};
