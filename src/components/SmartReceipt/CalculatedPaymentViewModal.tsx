import { useId, useMemo, useState, type ComponentProps } from "react";
import {
  DialogContent,
  DialogHeader,
  Dialog,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import type {
  ReceiptItem,
  SmartReceiptGuest,
  User,
} from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { Avatar } from "../Avatar/Avatar";
import { fixedDecimal } from "@/utils/number";
import { Separator } from "../ui/separator";
import { Info, TriangleAlert } from "lucide-react";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "@/utils/utils";
import { UniversalTooltip } from "../Tooltip/UniversalTooltip";

interface CalculatedPaymentViewModalProps
  extends ComponentProps<typeof Dialog> {
  users: User[];
  guests: SmartReceiptGuest[];
  payments: SmartReceiptWithItemsUsers["payments"];
  guestPayments: SmartReceiptWithItemsUsers["guestPayments"];
  receiptItems: ReceiptItem[];
  totalPrice: number;
  originalTotalPrice: number;
  currencyCode: string;
  differencePercentageSum: number;
  allPaid?: boolean;
}

export const CalculatedPaymentViewModal = ({
  users,
  guests,
  payments,
  guestPayments,
  receiptItems,
  totalPrice,
  originalTotalPrice,
  currencyCode,
  differencePercentageSum,
  allPaid = false,
  ...props
}: CalculatedPaymentViewModalProps) => {
  const switchId = useId();
  const [rowsReversed, setRowsReversed] = useState(false);

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

  const groupedGuestPayments = useMemo(
    () =>
      guestPayments.reduce(
        (acc, payment) => {
          if (!acc[payment.receiptItemId]) {
            acc[payment.receiptItemId] = [];
          }
          acc[payment.receiptItemId].push(payment);
          return acc;
        },
        {} as Record<string, typeof guestPayments>,
      ),
    [guestPayments],
  );

  const userPaymentsMap = useMemo(() => {
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
        (groupedPayments[payment.receiptItemId]?.length || 0) +
        (groupedGuestPayments[payment.receiptItemId]?.length || 0);

      paymentMap[payment.userId] +=
        (receiptItem.price * differencePercentageSum) /
        amountPaymentsForThisReceiptItem;
    }

    return paymentMap;
  }, [
    payments,
    receiptItems,
    groupedPayments,
    groupedGuestPayments,
    differencePercentageSum,
  ]);

  const guestPaymentsMap = useMemo(() => {
    const paymentMap: Record<string, number> = {};

    for (const payment of guestPayments) {
      if (!paymentMap[payment.guestId]) {
        paymentMap[payment.guestId] = 0;
      }

      const receiptItem = receiptItems.find(
        (item) => item.id === payment.receiptItemId,
      );
      if (!receiptItem) throw new Error("Receipt item not found for payment");

      const amountPaymentsForThisReceiptItem =
        (groupedGuestPayments[payment.receiptItemId]?.length || 0) +
        (groupedPayments[payment.receiptItemId]?.length || 0);

      paymentMap[payment.guestId] +=
        (receiptItem.price * differencePercentageSum) /
        amountPaymentsForThisReceiptItem;
    }

    return paymentMap;
  }, [
    guestPayments,
    receiptItems,
    groupedGuestPayments,
    groupedPayments,
    differencePercentageSum,
  ]);

  const warningBadge = (
    <Badge
      variant="outline"
      className="whitespace-nowrap py-1 text-muted-foreground"
    >
      <TriangleAlert className="text-orange-400 h-5 w-5 mr-1" />
      Not all items have been assigned
    </Badge>
  );

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculated Payments</DialogTitle>
          <DialogDescription>
            This is how much each user should pay based on the items assigned to
            them.
            <span className="flex flex-col my-3 gap-1 border-l-2 border-blue-500 pl-4 py-2 text-left">
              <span className="flex flex-row gap-1">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                <strong>Tip</strong>
              </span>
              If you were charged in your local currency, go into the currency
              field in the Smart Receipt Properties, then under "Currency" you
              can select your currency type and then enter the sum in your local
              currency that was charged from your bank account. This will then
              recalculate the item sums by the correct conversion.
            </span>
          </DialogDescription>
        </DialogHeader>
        <span className="flex flex-row items-center gap-2">
          <Switch
            id={switchId}
            checked={rowsReversed}
            onCheckedChange={setRowsReversed}
          />
          <Label htmlFor={switchId}>Reverse rows</Label>
          <UniversalTooltip text='This is useful in case you need to see the amounts on iPhone while being in the "close apps" view.'>
            <Info />
          </UniversalTooltip>
        </span>
        <ul className="flex flex-col gap-3">
          {users.map((user) => (
            <li
              key={user.id}
              className={cn(
                "flex items-center gap-2",
                !rowsReversed ? "flex-row" : "flex-row-reverse",
              )}
            >
              <Avatar src={user.avatarUrl} email={user.email} />
              <span
                className={cn(
                  "font-regular text-sm sm:text-base max-w-52 sm:max-w-full",
                  { "ml-auto": rowsReversed },
                )}
              >
                {user.email}
              </span>
              <span
                className={cn("whitespace-nowrap text-sm sm:text-base", {
                  "ml-auto": !rowsReversed,
                })}
              >
                {fixedDecimal(userPaymentsMap[user.id], 2)} {currencyCode}
              </span>
            </li>
          ))}
          {guests.map((guest) => (
            <li
              key={guest.id}
              className={cn(
                "flex items-center gap-2",
                !rowsReversed ? "flex-row" : "flex-row-reverse",
              )}
            >
              <Avatar email={guest.name} />
              <span
                className={cn(
                  "font-regular text-sm sm:text-base max-w-52 sm:max-w-full",
                  { "ml-auto": rowsReversed },
                )}
              >
                {guest.name}
              </span>
              <span
                className={cn("whitespace-nowrap text-sm sm:text-base", {
                  "ml-auto": !rowsReversed,
                })}
              >
                {fixedDecimal(guestPaymentsMap[guest.id], 2)} {currencyCode}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        {!allPaid && <span className="block sm:hidden">{warningBadge}</span>}
        <div className="flex flex-row font-bold mt-1 items-center gap-2">
          <span>Total</span>
          {!allPaid && <span className="hidden sm:block">{warningBadge}</span>}
          <span className="ml-auto whitespace-nowrap">
            {fixedDecimal(totalPrice, 2)} {currencyCode}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
