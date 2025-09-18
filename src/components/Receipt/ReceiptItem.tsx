"use client";

import type { ReceiptWithItems } from "@/types/receipt";
import { useRef, useTransition, type ComponentProps } from "react";
import {
  ReplaceableText,
  type ReplaceableTextHandle,
} from "../Form/ReplaceableText";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateReceiptItemGroup } from "@/app/receipt/[receiptId]/actions";
import type { UpdateSmartReceiptItemGroupSchema } from "@/types/action";
import type { z } from "zod";

interface ReceiptItemProps extends ComponentProps<"div"> {
  item: ReceiptWithItems["itemGroups"][0];
  currencyCode?: ReceiptWithItems["currencyCode"];
}

export const ReceiptItem = ({
  item,
  currencyCode,
  ...props
}: ReceiptItemProps) => {
  const [priceTransitionIsPending, startPriceTransition] = useTransition();
  const [descriptionTransitionIsPending, startDescriptionTransition] =
    useTransition();
  const router = useRouter();

  const replaceableTextDescriptionRef = useRef<ReplaceableTextHandle>(null);
  const replaceableTextPriceRef = useRef<ReplaceableTextHandle>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      properties: z.infer<typeof UpdateSmartReceiptItemGroupSchema>,
    ) => {
      await updateReceiptItemGroup(item.receiptId, item.id, properties);
    },
    onSuccess: () => {
      startPriceTransition(() => {
        router.refresh();
        replaceableTextPriceRef.current?.closeInput();
        replaceableTextDescriptionRef.current?.closeInput();
      });
    },
  });

  const supplementsSum = item.items.reduce(
    (sum, innerItem) =>
      sum +
      innerItem.supplements.reduce(
        (supplementSum, supplement) => supplementSum + supplement.price,
        0,
      ),
    0,
  );
  const totalPrice = item.price + supplementsSum;

  const isSpecialQuantity = item.quantity % 1 !== 0;

  const handlePriceSubmit = (newPrice: string) => {
    const parsedPrice = Number.parseFloat(newPrice);

    if (Number.isNaN(parsedPrice)) {
      console.log("Parsed price is NaN, not updating");
      return;
    }

    mutate({
      price: parsedPrice,
    });
  };

  const handleDescriptionSubmit = (newDescription: string) => {
    if (newDescription.trim() === "") {
      console.log("Description is empty, not updating");
      return;
    }

    mutate({
      description: newDescription,
    });
  };

  return (
    <div {...props}>
      <div className="flex flex-row justify-between items-center text-sm gap-12">
        <div className="font-medium flex flex-row items-center gap-1">
          <ReplaceableText
            ref={replaceableTextDescriptionRef}
            text={item.description}
            inputType="text"
            onSubmit={handleDescriptionSubmit}
            isLoading={descriptionTransitionIsPending || isPending}
          />
          {isSpecialQuantity && (
            <span className="text-xs text-muted-foreground">
              {`(per ${item.quantityUnit ? item.quantityUnit : "unit"}: `}
              {item.unitPrice} {currencyCode}
              {")"}
            </span>
          )}
        </div>
        <span className="font-medium flex flex-row items-center gap-2">
          <ReplaceableText
            ref={replaceableTextPriceRef}
            text={`${totalPrice} ${currencyCode}`}
            defaultInputValue={`${totalPrice}`}
            inputType="number"
            iconPlacement="start"
            onSubmit={handlePriceSubmit}
            isLoading={priceTransitionIsPending || isPending}
            className="whitespace-nowrap"
          />
        </span>
      </div>
      <ul className="flex flex-col gap-2 mt-2">
        {item.items.map((innerItem) => (
          <li key={innerItem.id} className="text-muted-foreground text-xs ml-3">
            <div className="flex flex-row justify-between gap-10">
              <span className="flex flex-row items-center gap-1">
                {item.description}
                {isSpecialQuantity && (
                  <span className="text-xs text-muted-foreground">
                    {`(${item.quantity} ${item.quantityUnit ? item.quantityUnit : "unit"})`}
                  </span>
                )}
              </span>
              <span>
                {innerItem.price} {currencyCode}
              </span>
            </div>
            {innerItem.supplements.length > 0 && (
              <ul className="flex flex-col gap-2 mt-2">
                {innerItem.supplements.map((supplement) => (
                  <li
                    key={supplement.id}
                    className="text-muted-foreground text-xs ml-3 flex flex-row justify-between gap-8"
                  >
                    <span>+ {supplement.description}</span>
                    <span className="whitespace-nowrap">
                      {supplement.price} {currencyCode}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
