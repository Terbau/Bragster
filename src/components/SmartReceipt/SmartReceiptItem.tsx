"use client";

import { useState, type ComponentProps } from "react";
import type { ReceiptItem } from "../Receipt/ReceiptItem";
import { EmptyAvatar } from "../Avatar/EmptyAvatar";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { fixedDecimal } from "@/utils/number";
import { SmartReceiptItemUserModal } from "./SmartReceiptItemUserModal";
import type { User } from "@/lib/generated/prisma";
import { cn } from "@/utils/utils";
import { AvatarGroup } from "../AvatarGroup/AvatarGroup";

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
  payments?: SmartReceiptWithItemsUsers["payments"];
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
  payments,
  ...props
}: SmartReceiptItemProps) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const hasPayment = payments && payments.length > 0;

  if (isSpecialQuantity && (!quantity || !quantityUnit)) {
    console.warn(
      "SmartReceiptItem: isSpecialQuantity is true but quantity or quantityUnit is not provided.",
    );
  }

  return (
    <>
      <SmartReceiptItemUserModal
        users={users}
        payments={payments}
        smartReceiptId={smartReceiptId}
        receiptItemId={item.id}
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
      />
      <div {...props}>
        <button
          type="button"
          className={cn(
            "text-muted-foreground text-xs ml-2",
            "p-2 rounded",
            "flex flex-row items-center gap-2 w-full",
            hasPayment
              ? "border-2 border-green-600"
              : "border border-dashed border-foreground/15",
          )}
          onClick={() => setAssignModalOpen(true)}
        >
          {hasPayment ? (
            <AvatarGroup users={payments.map((payment) => payment.user)} />
          ) : (
            <EmptyAvatar />
          )}
          <div className="grow">
            <div className="flex flex-row justify-between gap-10">
              <span className="flex flex-row items-center gap-1">
                {description}
                {isSpecialQuantity && (
                  <span className="text-xs text-muted-foreground">
                    {`(${quantity} ${quantityUnit ? quantityUnit : "unit"})`}
                  </span>
                )}
              </span>
              <span>
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
                    <span>
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
        </button>
      </div>
    </>
  );
};
