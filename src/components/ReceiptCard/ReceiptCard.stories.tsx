import type { Meta, StoryObj } from "@storybook/react";
import { ReceiptCard } from "./ReceiptCard";
import type { ReceiptWithItemCount } from "@/types/receipt";

const meta = {
  component: ReceiptCard,
} satisfies Meta<typeof ReceiptCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const RECEIPT_DATA: ReceiptWithItemCount = {
  id: "ce297d34-40cf-48f8-8563-1825d5f1aae8",
  userId: "86bc981b-974e-4b83-8553-7a7e463853d8",
  createdAt: new Date("2025-07-31T10:14:50.507Z"),
  updatedAt: new Date("2025-07-31T10:14:50.507Z"),
  merchantName: "COOP ØST SA",
  receiptType: null,
  receiptDate: new Date("2025-07-28T14:04:00.000Z"),
  totalPrice: 845.7,
  currencyCode: "NOK",
  itemGroups: [
    {
      _count: { items: 3 },
    },
    {
      _count: { items: 2 },
    },
  ],
};

export const Primary: Story = {
  args: {
    receipt: RECEIPT_DATA,
  },
};
