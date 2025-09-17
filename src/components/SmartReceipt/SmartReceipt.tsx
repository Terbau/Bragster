"use client";

import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calculator, Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useState, type ComponentProps } from "react";
import { cn } from "@/utils/utils";
import { SmartReceiptItemGroup } from "./SmartReceiptItemGroup";
import { CalculatedPaymentViewModal } from "./CalculatedPaymentViewModal";
import { Button } from "../ui/button";
import { FixedUserSelectBar } from "../FixedUserSelectBar/FixedUserSelectBar";

export interface SmartReceiptProps extends ComponentProps<typeof Card> {
  smartReceipt: SmartReceiptWithItemsUsers;
}

export const SmartReceipt = ({
  smartReceipt,
  className,
  ...props
}: SmartReceiptProps) => {
  const [isPaymentViewModalOpen, setIsPaymentViewModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [fixedUserSelectBarActive, setFixedUserSelectBarActive] =
    useState(false);

  const receipt = smartReceipt.receipt;
  const differencePercentageTotalPrice = smartReceipt.updatedTotalPrice
    ? (smartReceipt.updatedTotalPrice ?? 0) / receipt.totalPrice
    : 1;

  const amountItems = receipt.itemGroups.reduce(
    (total, itemGroup) => total + itemGroup.items.length,
    0,
  );
  const amountItemsPaid = new Set(
    smartReceipt.payments.map((payment) => payment.receiptItemId),
  ).size;

  const totalPriceFromItems = receipt.itemGroups.reduce(
    (groupSum, itemGroup) =>
      groupSum +
      itemGroup.items.reduce(
        (itemSum, item) =>
          itemSum +
          item.price * differencePercentageTotalPrice +
          item.supplements.reduce(
            (supplementSum, supplement) =>
              supplementSum + supplement.price * differencePercentageTotalPrice,
            0,
          ),
        0,
      ),
    0,
  );
  console.log("Totalprice from items:", totalPriceFromItems);

  if (!receipt) {
    return <div>No receipt data available.</div>;
  }

  return (
    <>
      <FixedUserSelectBar
        users={smartReceipt.users}
        onSelectedUserIdsChange={setSelectedUserIds}
        onActiveChange={setFixedUserSelectBarActive}
      />
      <CalculatedPaymentViewModal
        users={smartReceipt.users}
        payments={smartReceipt.payments}
        receiptItems={receipt.itemGroups.flatMap((group) => group.items)}
        originalTotalPrice={receipt.totalPrice}
        totalPrice={smartReceipt.updatedTotalPrice ?? receipt.totalPrice}
        currencyCode={
          smartReceipt.updatedCurrencyCode ?? receipt.currencyCode ?? ""
        }
        differencePercentageSum={differencePercentageTotalPrice}
        open={isPaymentViewModalOpen}
        onOpenChange={setIsPaymentViewModalOpen}
      />
      <Card className={cn("sm:min-w-[30rem] w-fit", className)} {...props}>
        <CardHeader>
          <CardTitle className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 text-xl sm:text-2xl">
            <span>{receipt.merchantName}</span>
            <Button
              variant="outline"
              onClick={() => setIsPaymentViewModalOpen(true)}
              className="sm:ml-auto flex flex-row gap-1 mb-2 sm:mb-0"
            >
              <Calculator />
              <span className="font-regular">Calculate Payments</span>
            </Button>
          </CardTitle>
          <CardDescription>
            <span className="flex flex-row items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(receipt.receiptDate)}</span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {receipt.itemGroups.map((itemGroup) => (
              <li key={itemGroup.id}>
                <SmartReceiptItemGroup
                  smartReceiptId={smartReceipt.id}
                  itemGroup={itemGroup}
                  currencyCode={
                    smartReceipt.updatedCurrencyCode ?? receipt.currencyCode
                  }
                  differencePercentageSum={differencePercentageTotalPrice}
                  users={smartReceipt.users}
                  payments={smartReceipt.payments}
                  quickAssignUserIds={
                    fixedUserSelectBarActive ? selectedUserIds : undefined
                  }
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col w-full border-b border-t border-foreground/15 border-dashed py-4 mt-4 ">
            <div className="flex flex-row items-center justify-between gap-2 font-bold">
              <span>Total</span>
              <span>
                {smartReceipt.updatedTotalPrice ?? receipt.totalPrice}{" "}
                {smartReceipt.updatedCurrencyCode ?? receipt.currencyCode}
              </span>
            </div>
            <div className="flex flex-row items-center justify-between gap-2 text-xs">
              <span>Items</span>
              <span>
                {amountItemsPaid} / {amountItems}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Receipt ID: {receipt.id}
          </p>
        </CardFooter>
      </Card>
    </>
  );
};
