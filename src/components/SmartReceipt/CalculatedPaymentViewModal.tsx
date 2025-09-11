import { useMemo, type ComponentProps } from "react";
import {
  DialogContent,
  DialogHeader,
  Dialog,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import type { ReceiptItem, User } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { Avatar } from "../Avatar/Avatar";
import { fixedDecimal } from "@/utils/number";
import { Separator } from "../ui/separator";

interface CalculatedPaymentViewModalProps
  extends ComponentProps<typeof Dialog> {
  users: User[];
  payments: SmartReceiptWithItemsUsers["payments"];
  receiptItems: ReceiptItem[];
  totalPrice: number;
  originalTotalPrice: number;
  currencyCode: string;
  differencePercentageSum: number;
}

export const CalculatedPaymentViewModal = ({
  users,
  payments,
  receiptItems,
  totalPrice,
  originalTotalPrice,
  currencyCode,
  differencePercentageSum,
  ...props
}: CalculatedPaymentViewModalProps) => {
  const groupedPayments = useMemo(
    () =>
      payments.reduce(
        (acc, payment) => {
          if (!acc[payment.receiptItemId]) {
            acc[payment.receiptItemId] = [];
          }
          acc[payment.receiptItemId].push(payment);
          return acc;
        },
        {} as Record<string, typeof payments>,
      ),
    [payments],
  );

  const userPayments = useMemo(() => {
    const paymentMap: Record<string, number> = {};
    for (const payment of payments) {
      if (!paymentMap[payment.userId]) {
        paymentMap[payment.userId] = 0;
      }

      const receiptItem = receiptItems.find(
        (item) => item.id === payment.receiptItemId,
      );
      if (!receiptItem) throw new Error("Receipt item not found for payment");

      const amountPaymentsForThisReceiptItem =
        groupedPayments[payment.receiptItemId].length;

      paymentMap[payment.userId] +=
        (receiptItem.price * differencePercentageSum) /
        amountPaymentsForThisReceiptItem;
    }
    return paymentMap;
  }, [payments, receiptItems, groupedPayments, differencePercentageSum]);

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculated Payments</DialogTitle>
          <DialogDescription>
            This is how much each user should pay based on the items assigned to
            them.
          </DialogDescription>
        </DialogHeader>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="flex flex-row items-center gap-2">
              <Avatar email={user.email} />
              <span className="font-regular">{user.email}</span>
              <span className="ml-auto">
                {fixedDecimal(userPayments[user.id], 2)} {currencyCode}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex flex-row font-bold">
          <span>Total</span>
          <span className="ml-auto">
            {fixedDecimal(totalPrice, 2)} {currencyCode}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
