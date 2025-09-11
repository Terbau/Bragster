import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";
import type { ReceiptWithItemCount } from "@/types/receipt";

interface ReceiptCardProps {
  receipt: ReceiptWithItemCount;
}

export const ReceiptCard = ({ receipt }: ReceiptCardProps) => {
  const amountItems = receipt.itemGroups.reduce(
    (total, itemGroup) => total + itemGroup._count.items,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{receipt.merchantName}</CardTitle>
        <CardDescription className="flex flex-row items-center gap-2">
          <span className="flex flex-row items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(receipt.receiptDate)}</span>
          </span>
          {/* Dot between */}
          <span className="h-1 w-1 bg-muted-foreground rounded-full" />
          <span>
            {receipt.totalPrice} {receipt.currencyCode}
          </span>
          <span className="h-1 w-1 bg-muted-foreground rounded-full" />
          <span>{amountItems} items</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
