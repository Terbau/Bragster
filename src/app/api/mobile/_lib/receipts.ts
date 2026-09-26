/** The owner and everyone taking part in one of its smart receipts can view a receipt */
export const canViewReceipt = (
  receipt: {
    userId: string;
    smartReceipts: { users: { id: string }[] }[];
  },
  userId: string,
) =>
  receipt.userId === userId ||
  receipt.smartReceipts.some((smartReceipt) =>
    smartReceipt.users.some((user) => user.id === userId),
  );
