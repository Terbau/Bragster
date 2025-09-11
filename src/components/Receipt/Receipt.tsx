import type { ReceiptWithItems } from "@/types/receipt";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";
import { ReceiptItem } from "./ReceiptItem";
import type { ComponentProps } from "react";
import { cn } from "@/utils/utils";
import { fixedDecimal } from "@/utils/number";

export interface ReceiptProps extends ComponentProps<typeof Card> {
  receipt: ReceiptWithItems;
}

export const Receipt = ({ receipt, className, ...props }: ReceiptProps) => {
  return (
    <Card className={cn("sm:min-w-[30rem] w-fit", className)} {...props}>
      <CardHeader>
        <CardTitle>{receipt.merchantName}</CardTitle>
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
              <ReceiptItem
                item={itemGroup}
                currencyCode={receipt.currencyCode}
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-row justify-between items-center font-bold w-full border-b border-t border-foreground/15 border-dashed py-4 mt-4 ">
          <span>Total</span>
          <span>
            {fixedDecimal(receipt.totalPrice, 2)} {receipt.currencyCode}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Receipt ID: {receipt.id}
        </p>
      </CardFooter>
    </Card>
  );
};
