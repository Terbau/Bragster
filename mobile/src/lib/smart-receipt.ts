import type {
  AllowedPaymentEditor,
  InviteLinkExpiration,
  ReceiptItemGroup,
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "./types";

// Totals, shares and labels, calculated the same way as on the website.

export const PERMISSION_OPTIONS: { value: AllowedPaymentEditor; label: string }[] = [
  { value: "OWNER", label: "Only the owner" },
  { value: "AUTHENTICATED_USERS", label: "Any authenticated user" },
  { value: "GUESTS", label: "Any guest" },
  { value: "ANYONE", label: "Anyone with the link" },
];

export const EXPIRATION_OPTIONS: { value: InviteLinkExpiration; label: string }[] = [
  { value: "ONE_HOUR", label: "1 hour" },
  { value: "ONE_DAY", label: "1 day" },
  { value: "SEVEN_DAYS", label: "1 week" },
  { value: "THIRTY_DAYS", label: "30 days" },
  { value: "NEVER", label: "Never" },
];

/** Sum of all items and their supplements, before any currency adjustment */
export const getTotalFromItems = (receipt: ReceiptWithItems, factor = 1) =>
  receipt.itemGroups.reduce(
    (groupSum, itemGroup) =>
      groupSum +
      itemGroup.items.reduce(
        (itemSum, item) =>
          itemSum +
          item.price * factor +
          item.supplements.reduce(
            (supplementSum, supplement) => supplementSum + supplement.price * factor,
            0,
          ),
        0,
      ),
    0,
  );

// Need a threshold due to rounding errors
export const isSumCorrect = (computed: number, total: number) =>
  Math.abs(computed - total) < 0.05;

export const getItemGroupTotal = (itemGroup: ReceiptItemGroup, factor = 1) => {
  const supplementsSum = itemGroup.items.reduce(
    (sum, item) =>
      sum +
      item.supplements.reduce((supplementSum, s) => supplementSum + s.price, 0),
    0,
  );
  return (itemGroup.price + supplementsSum) * factor;
};

/** Items with a fractional quantity, e.g. 0.452 kg */
export const isSpecialQuantity = (itemGroup: ReceiptItemGroup) =>
  itemGroup.quantity % 1 !== 0;

export function getSmartReceiptSummary(smartReceipt: SmartReceiptWithItemsUsers) {
  const receipt = smartReceipt.receipt;
  // All item prices are scaled when the total has been changed, e.g. to the
  // amount charged in another currency
  const priceFactor = smartReceipt.updatedTotalPrice
    ? smartReceipt.updatedTotalPrice / receipt.totalPrice
    : 1;
  const totalPrice = smartReceipt.updatedTotalPrice ?? receipt.totalPrice;
  const currencyCode =
    smartReceipt.updatedCurrencyCode ?? receipt.currencyCode ?? "";

  const amountItems = receipt.itemGroups.reduce(
    (total, itemGroup) => total + itemGroup.items.length,
    0,
  );
  const amountItemsPaid = new Set([
    ...smartReceipt.payments.map((payment) => payment.receiptItemId),
    ...smartReceipt.guestPayments.map((payment) => payment.receiptItemId),
  ]).size;
  const totalPriceFromItems = getTotalFromItems(receipt, priceFactor);

  return {
    priceFactor,
    totalPrice,
    currencyCode,
    amountItems,
    amountItemsPaid,
    allPaid: amountItems === amountItemsPaid,
    totalPriceFromItems,
    isCorrectSum: isSumCorrect(totalPriceFromItems, totalPrice),
  };
}

/** How much each user and guest should pay, split evenly per item */
export function calculatePayments(
  smartReceipt: SmartReceiptWithItemsUsers,
  priceFactor: number,
) {
  const itemPrices = new Map<string, number>();
  for (const group of smartReceipt.receipt.itemGroups) {
    for (const item of group.items) {
      itemPrices.set(item.id, item.price);
    }
  }

  const payersPerItem = new Map<string, number>();
  for (const payment of [...smartReceipt.payments, ...smartReceipt.guestPayments]) {
    payersPerItem.set(
      payment.receiptItemId,
      (payersPerItem.get(payment.receiptItemId) ?? 0) + 1,
    );
  }

  const shareOf = (receiptItemId: string) =>
    ((itemPrices.get(receiptItemId) ?? 0) * priceFactor) /
    (payersPerItem.get(receiptItemId) ?? 1);

  const users: Record<string, number> = {};
  for (const payment of smartReceipt.payments) {
    users[payment.userId] = (users[payment.userId] ?? 0) + shareOf(payment.receiptItemId);
  }

  const guests: Record<string, number> = {};
  for (const payment of smartReceipt.guestPayments) {
    guests[payment.guestId] =
      (guests[payment.guestId] ?? 0) + shareOf(payment.receiptItemId);
  }

  const assignedSum =
    Object.values(users).reduce((sum, value) => sum + value, 0) +
    Object.values(guests).reduce((sum, value) => sum + value, 0);

  return { users, guests, assignedSum };
}
