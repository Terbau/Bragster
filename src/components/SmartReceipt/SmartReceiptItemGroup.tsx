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
import { TranslatedText } from "../TranslatedText/TranslatedText";
import { useTheme } from "next-themes";
import { cn } from "@/utils/utils";

interface SmartReceiptItemGroupProps
  extends Omit<ComponentProps<typeof ReceiptItem>, "item"> {
  smartReceiptId: string;
  itemGroup: ReceiptWithItems["itemGroups"][number];
  differencePercentageSum: number;
  users: User[];
  payments: SmartReceiptWithItemsUsers["payments"];
  quickAssignUserIds?: string[];
}

export const SmartReceiptItemGroup = ({
  smartReceiptId,
  itemGroup,
  currencyCode,
  differencePercentageSum,
  users,
  payments,
  quickAssignUserIds,
  className,
  ...props
}: SmartReceiptItemGroupProps) => {
  const { resolvedTheme } = useTheme();

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
  const translation = itemGroup.translations.at(-1);

  return (
    <div
      className={cn("max-w-[22rem] sm:max-w-screen-2xl", className)}
      {...props}
    >
      <div className="flex flex-row items-center text-sm gap-2">
        <span className="font-medium flex flex-row items-center gap-1 grow-0 min-w-0">
          {translation ? (
            <TranslatedText
              language={translation.language}
              originalText={itemGroup.description}
              className="min-w-0 truncate"
            >
              {translation.description}
            </TranslatedText>
          ) : (
            <span className="min-w-0 truncate">{itemGroup.description}</span>
          )}
          {isSpecialQuantity && (
            <span className="text-xs text-muted-foreground">
              {`(per ${itemGroup.quantityUnit ? itemGroup.quantityUnit : "unit"}: `}
              {fixedDecimal(itemGroup.unitPrice * differencePercentageSum, 2)}{" "}
              {currencyCode}
              {")"}
            </span>
          )}
        </span>

        <span className="flex flex-row items-center gap-4 justify-between grow">
          {translation && (
            <Badge
              variant="outline"
              className="text-xs bg-transparent"
              style={{
                backgroundColor:
                  resolvedTheme === "dark"
                    ? translation.darkModeLabelHexColor
                    : translation.lightModeLabelHexColor,
              }}
            >
              {translation.label}
            </Badge>
          )}

          <span className="font-medium flex flex-row items-center gap-2 whitespace-nowrap ml-auto">
            {fixedDecimal(totalPrice, 2)} {currencyCode}
          </span>
        </span>
      </div>
      <ul className="flex flex-col gap-2 mt-2">
        {itemGroup.items.map((innerItem) => (
          <li key={innerItem.id}>
            <SmartReceiptItem
              smartReceiptId={smartReceiptId}
              description={translation?.description ?? itemGroup.description}
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
              quickAssignUserIds={quickAssignUserIds}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
