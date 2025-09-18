import type { ReceiptWithItems } from "@/types/receipt";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AlertCircleIcon, Calendar } from "lucide-react";
import { formatDate } from "@/utils/date";
import { ReceiptItem } from "./ReceiptItem";
import type { ComponentProps } from "react";
import { cn } from "@/utils/utils";
import { fixedDecimal } from "@/utils/number";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Link from "next/link";
import { Badge } from "../ui/badge";

export interface ReceiptProps extends ComponentProps<typeof Card> {
  receipt: ReceiptWithItems;
}

export const Receipt = ({ receipt, className, ...props }: ReceiptProps) => {
  const totalPriceFromItems = receipt.itemGroups.reduce(
    (groupSum, itemGroup) =>
      groupSum +
      itemGroup.items.reduce(
        (itemSum, item) =>
          itemSum +
          item.price +
          item.supplements.reduce(
            (supplementSum, supplement) => supplementSum + supplement.price,
            0,
          ),
        0,
      ),
    0,
  );

  // Need a threshold due to rounding erros
  const isCorrectSum =
    Math.abs(totalPriceFromItems - receipt.totalPrice) < 0.005;

  return (
    <Card className={cn("sm:min-w-[30rem] w-fit", className)} {...props}>
      <CardHeader>
        {!isCorrectSum && (
          <Alert
            variant="destructive"
            className="mb-4"
            id="incorrect-sum-alert"
          >
            <AlertCircleIcon />
            <AlertTitle>
              Total sum doesn't match the sum computed from the items
            </AlertTitle>
            <AlertDescription>
              <p>
                One or more receipt items were most likely incorrectly
                interpreted. You can manually change item sums by hovering over
                the sums and clicking the edit button.
              </p>
            </AlertDescription>
          </Alert>
        )}
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
          <span className="flex flex-row items-center gap-1">
            Total
            {!isCorrectSum && (
              <Link
                href="#incorrect-sum-alert"
                className="text-sm font-normal flex flex-row items-center text-muted-foreground gap-1"
              >
                <AlertCircleIcon className="h-5 w-5 text-red-400 " />
              </Link>
            )}
          </span>
          <span className="flex flex-row gap-2 items-end sm:items-center">
            {!isCorrectSum && (
              <Badge variant="outline">
                Computed sum: {fixedDecimal(totalPriceFromItems, 2)}
              </Badge>
            )}
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
