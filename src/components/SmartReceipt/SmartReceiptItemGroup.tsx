import type { ComponentProps } from "react";
import type { ReceiptItem } from "../Receipt/ReceiptItem";
import { Badge } from "../ui/badge";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { SmartReceiptItem } from "./SmartReceiptItem";
import { fixedDecimal } from "@/utils/number";
import type { User } from "@/lib/generated/prisma";

interface SmartReceiptItemGroupProps
  extends Omit<ComponentProps<typeof ReceiptItem>, "item"> {
  smartReceiptId: string;
  itemGroup: ReceiptWithItems["itemGroups"][number];
  differencePercentageSum: number;
  users: User[];
  payments: SmartReceiptWithItemsUsers["payments"];
}

export const SmartReceiptItemGroup = ({
  smartReceiptId,
  itemGroup,
  currencyCode,
  differencePercentageSum,
  users,
  payments,
  ...props
}: SmartReceiptItemGroupProps) => {
  const itemsHandled = 0;

  const supplementsSum =
    itemGroup.items.reduce(
      (sum, innerItem) =>
        sum +
        innerItem.supplements.reduce(
          (supplementSum, supplement) => supplementSum + supplement.price,
          0,
        ),
      0,
    ) * differencePercentageSum;
  const totalPrice = itemGroup.price * differencePercentageSum + supplementsSum;
  const isSpecialQuantity = itemGroup.quantity % 1 !== 0;

  return (
    <div {...props}>
      <div className="flex flex-row justify-between items-center text-sm gap-12">
        <p className="font-medium flex flex-row items-center gap-1">
          <span className="whitespace-nowrap text-ellipsis">{itemGroup.description}</span>
          {isSpecialQuantity && (
            <span className="text-xs text-muted-foreground">
              {`(per ${itemGroup.quantityUnit ? itemGroup.quantityUnit : "unit"}: `}
              {fixedDecimal(itemGroup.unitPrice * differencePercentageSum, 2)}{" "}
              {currencyCode}
              {")"}
            </span>
          )}

          <span className="border border-dashed border-foreground/15 px-0.5 rounded text-muted-foreground text-xs">
            {itemsHandled}/
            {!isSpecialQuantity ? itemGroup.quantity : itemGroup.items.length}
          </span>
        </p>
        <span className="font-medium flex flex-row items-center gap-2 whitespace-nowrap">
          {itemGroup.quantity > 1 && (
            <Badge variant="outline" className="text-xs">
              Qty: {itemGroup.quantity}
            </Badge>
          )}
          {fixedDecimal(totalPrice, 2)} {currencyCode}
        </span>
      </div>
      <ul className="flex flex-col gap-2 mt-2">
        {itemGroup.items.map((innerItem) => (
          <li key={innerItem.id}>
            <SmartReceiptItem
              smartReceiptId={smartReceiptId}
              description={itemGroup.description}
              currencyCode={currencyCode}
              item={innerItem}
              isSpecialQuantity={isSpecialQuantity}
              quantity={itemGroup.quantity}
              quantityUnit={itemGroup.quantityUnit}
              differencePercentageSum={differencePercentageSum}
              users={users}
              payments={payments.filter(
                (p) => p.receiptItemId === innerItem.id,
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
