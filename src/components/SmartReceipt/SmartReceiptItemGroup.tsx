"use client";

import type { ComponentProps } from "react";
import type { ReceiptItem } from "../Receipt/ReceiptItem";
import { Badge } from "../ui/badge";
import type {
  ReceiptWithItems,
  SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { SmartReceiptItem } from "./SmartReceiptItem";
import { fixedDecimal } from "@/utils/number";
import type { SmartReceiptGuest, User } from "@/lib/generated/prisma";
import { TranslatedText } from "../TranslatedText/TranslatedText";
import { useTheme } from "next-themes";
import { cn } from "@/utils/utils";

interface SmartReceiptItemGroupProps
  extends Omit<ComponentProps<typeof ReceiptItem>, "item"> {
  smartReceiptId: string;
  itemGroup: ReceiptWithItems["itemGroups"][number];
  differencePercentageSum: number;
  users: User[];
  guests: SmartReceiptGuest[];
  payments: SmartReceiptWithItemsUsers["payments"];
  guestPayments: SmartReceiptWithItemsUsers["guestPayments"];
  quickAssignUserIds?: string[];
  quickAssignGuestIds?: string[];
  currentUserCanCreatePayments: boolean;
}

export const SmartReceiptItemGroup = ({
  smartReceiptId,
  itemGroup,
  currencyCode,
  differencePercentageSum,
  users,
  guests,
  payments,
  guestPayments,
  quickAssignUserIds,
  quickAssignGuestIds,
  currentUserCanCreatePayments,
  className,
  ...props
}: SmartReceiptItemGroupProps) => {
  const { theme = "system" } = useTheme();

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

  const translationBadge = translation ? (
    <Badge
      variant="outline"
      className="text-xs bg-transparent whitespace-nowrap"
      style={{
        backgroundColor:
          theme === "light"
            ? translation.lightModeLabelHexColor
            : translation.darkModeLabelHexColor,
      }}
    >
      {translation.label}
    </Badge>
  ) : null;

  return (
    <div className={cn("sm:max-w-screen-2xl", className)} {...props}>
      <div className="flex flex-row items-end sm:items-center text-sm gap-2">
        <div className="space-y-1">
          {translationBadge !== null && (
            <span className="sm:hidden">
              {translationBadge !== null && translationBadge}
            </span>
          )}
          <span className="font-medium flex flex-row items-center gap-1">
            {translation ? (
              <TranslatedText
                language={translation.language}
                originalText={itemGroup.description}
              >
                {translation.description}
              </TranslatedText>
            ) : (
              <span>{itemGroup.description}</span>
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
        </div>

        <span className="flex flex-row items-center gap-4 justify-between grow">
          {translationBadge !== null && (
            <span className="hidden sm:block">{translationBadge}</span>
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
              guests={guests}
              payments={payments.filter(
                (p) => p.receiptItemId === innerItem.id,
              )}
              guestPayments={guestPayments.filter(
                (p) => p.receiptItemId === innerItem.id,
              )}
              quickAssignUserIds={quickAssignUserIds}
              quickAssignGuestIds={quickAssignGuestIds}
              currentUserCanCreatePayments={currentUserCanCreatePayments}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
