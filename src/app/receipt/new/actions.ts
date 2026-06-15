"use server";

import { getSession } from "@/lib/auth";
import { createAzureCredentials } from "@/lib/azure/credentials";
import {
  analyzeDocument,
  createDocumentAnalysisClient,
  AzureFormServicesModel,
} from "@/lib/azure/formRecognizer";
import type {
  Receipt,
  ReceiptItem,
  ReceiptItemGroup,
  ReceiptItemGroupTranslation,
  ReceiptItemSupplement,
  ReceiptItemSupplementTranslation,
} from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import {
  AzureReceiptSchema,
  type FieldValue,
  ReceiptUploadSchema,
} from "@/types/smart-receipt";
import { addTimeToDateIfExists, findCurrencyCode } from "@/utils/utils";
import { redirect } from "next/navigation";

const SUPPLEMENTS = ["PANT"];

type ReceiptScanReturnType = Receipt & {
  itemGroups: (ReceiptItemGroup & {
    items: (ReceiptItem & {
      supplements: (ReceiptItemSupplement & {
        translations: ReceiptItemSupplementTranslation[];
      })[];
    })[];
    translations: ReceiptItemGroupTranslation[];
  })[];
};

interface PrecomputedItemGroupValues {
  description: string;
  price?: number;
  totalPrice: number;
  originalTotalPrice?: number;
  quantity: number;
  quantityUnit: string | null;
  unitPrice?: number;
  supplements: { description: string; price: number }[];
}

const getPrecomputedKey = (
  description: string,
  totalPrice: number,
  quantityUnit: string | null,
  unitPrice?: number,
) => `${description}-${totalPrice}-${quantityUnit}-${unitPrice}`;

export const receiptScanAction = async (
  formData: FormData,
): Promise<ReceiptScanReturnType> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const validated = ReceiptUploadSchema.parse(
    Object.fromEntries(formData.entries()),
  );

  const file = validated.file as File;

  const documentAnalysisClient = createDocumentAnalysisClient(
    createAzureCredentials(),
  );
  const result = await analyzeDocument(
    documentAnalysisClient,
    AzureFormServicesModel.PREBUILT_RECEIPT,
    file,
  );

  if (result === null) {
    throw new Error("No result from Azure Form Recognizer");
  }

  const document = result.documents?.at(0);

  if (!document) {
    throw new Error("No document found in Azure Form Recognizer result");
  }

  const azureReceipt = AzureReceiptSchema.parse(document);

  let receiptDate = undefined;
  const receiptDateField = azureReceipt.fields.TransactionDate;
  if (receiptDateField.kind === "date") {
    receiptDate = receiptDateField.value;
  }

  let receiptTime = undefined;
  const receiptTimeField = azureReceipt.fields.TransactionTime;
  if (receiptTimeField.kind === "time") {
    receiptTime = receiptTimeField.value;
  }

  // Try to add time to the date
  if (receiptDate) {
    receiptDate = addTimeToDateIfExists(receiptDate, receiptTime);
  }

  let totalAmount = undefined;
  let currencyCode = undefined;
  const totalAmountField = azureReceipt.fields.Total;

  switch (totalAmountField.kind) {
    case "currency":
      totalAmount = totalAmountField.value.amount;
      currencyCode = totalAmountField.value.currencyCode;
      break;
    case "number":
      totalAmount = totalAmountField.value;
      break;
    case "string": {
      const parsed = Number.parseFloat(totalAmountField.value);
      if (Number.isNaN(parsed)) {
        throw new Error("Parsed amount is NaN");
      }
      totalAmount = parsed;
      break;
    }
    default:
      throw new Error("Total amount field is not a currency or number");
  }

  // If currencyCode is undefined down here, then try to find it somewhere else recursively
  if (currencyCode === undefined) {
    for (const field of Object.values(azureReceipt.fields)) {
      currencyCode = findCurrencyCode(field as unknown as FieldValue);

      if (currencyCode) {
        break;
      }
    }
  }

  const items = azureReceipt.fields.Items;
  if (items.kind !== "array") {
    throw new Error("Items field is not an array");
  }

  const precomputedItemGroupsMap = new Map<
    string,
    PrecomputedItemGroupValues
  >();
  let lastPrecomputedKey: string | null = null;
  // We need to precompute some stuff in order to group duplicate item groups. This is
  // not always needed, but for some receipt types all items have a single item group,
  // which tends to lead to a lot of duplicate item groups.
  for (const item of items.values) {
    const description = item.properties.Description?.content ?? "Unknown";
    let price = undefined;
    let totalPrice = undefined;
    let originalTotalPrice = undefined;
    let quantity = 1;
    let quantityUnit = null;
    let unitPrice = undefined;

    if (item.properties.Price !== undefined) {
      if (item.properties.Price?.kind === "currency") {
        price = item.properties.Price.value.amount;
        unitPrice = item.properties.Price.value.amount;
      } else if (item.properties.Price?.kind === "number") {
        price = item.properties.Price.value;
        unitPrice = item.properties.Price.value;
      } else {
        throw new Error("Price field is not a currency or number");
      }
    }

    if (item.properties.Quantity?.kind === "number") {
      quantity = item.properties.Quantity.value;
    }

    if (item.properties.TotalPrice?.kind === "currency") {
      totalPrice = item.properties.TotalPrice.value.amount;
      originalTotalPrice = item.properties.TotalPrice.value.amount;
    } else if (item.properties.TotalPrice?.kind === "number") {
      totalPrice = item.properties.TotalPrice.value;
      originalTotalPrice = item.properties.TotalPrice.value;
    } else {
      if (price !== undefined) {
        totalPrice = price * quantity;
      } else {
        throw new Error(
          "Total price field is not a currency or number, and price is not defined",
        );
      }
    }

    if (item.properties.QuantityUnit?.kind === "string") {
      quantityUnit = item.properties.QuantityUnit.value;
    }

    // If unitPrice is still undefined, try to calculate it from totalPrice and quantity
    if (unitPrice === undefined && originalTotalPrice !== undefined) {
      unitPrice = originalTotalPrice / quantity;
    }

    if (SUPPLEMENTS.includes(description)) {
      if (!lastPrecomputedKey) {
        throw new Error("No previous items for the supplement to be added to.");
      }

      const lastItemGroup = precomputedItemGroupsMap.get(lastPrecomputedKey);

      if (!lastItemGroup) {
        throw new Error(
          "Last item group not found when trying to add supplement.",
        );
      }

      lastItemGroup.supplements = [
        ...lastItemGroup.supplements,
        {
          description,
          price: price ?? totalPrice,
        },
      ];

      continue;
    }

    const precomputedKey = getPrecomputedKey(
      description,
      totalPrice,
      quantityUnit,
      unitPrice,
    );
    lastPrecomputedKey = precomputedKey;

    const existingItemGroup = precomputedItemGroupsMap.get(precomputedKey);

    // If another item group exists for this item, add it to that instead of creating a
    // new item group.
    if (existingItemGroup) {
      const newTotalPrice = existingItemGroup.totalPrice + totalPrice;
      const newQuantity = existingItemGroup.quantity + quantity;
      precomputedItemGroupsMap.set(precomputedKey, {
        ...existingItemGroup,
        totalPrice: newTotalPrice,
        quantity: newQuantity,
      });

      continue;
    }

    precomputedItemGroupsMap.set(precomputedKey, {
      description,
      price,
      totalPrice,
      originalTotalPrice,
      quantity,
      quantityUnit,
      unitPrice,
      supplements: [],
    });
  }

  // Build nested create data for all item groups, items, and supplements
  const itemGroupsData = Array.from(precomputedItemGroupsMap.values()).map(
    (group) => {
      const { totalPrice, quantity, supplements } = group;
      const quantityToCreate = quantity % 1 === 0 ? quantity : 1;
      const computedPrice =
        quantityToCreate !== quantity
          ? totalPrice
          : quantityToCreate > 1
            ? totalPrice / quantityToCreate
            : totalPrice;

      if (supplements.length > 0 && supplements.length !== quantityToCreate) {
        throw new Error(
          "Amount of supplements doesn't match the amount of items.",
        );
      }

      return {
        price: group.totalPrice,
        description: group.description,
        quantity: group.quantity,
        quantityUnit: group.quantityUnit,
        unitPrice: group.unitPrice ?? group.totalPrice / group.quantity,
        items: {
          create: Array.from({ length: Math.max(quantityToCreate) }).map(
            (_, index) => ({
              price: computedPrice,
              ...(supplements.length > 0
                ? {
                    supplements: {
                      create: [
                        {
                          price: supplements[index].price,
                          description: supplements[index].description,
                        },
                      ],
                    },
                  }
                : {}),
            }),
          ),
        },
      };
    },
  );

  // Single DB call: creates receipt + all item groups + items + supplements
  const receipt = await prisma.receipt.create({
    data: {
      merchantName: azureReceipt.fields.MerchantName.content,
      receiptType: azureReceipt.fields.ReceiptType?.content,
      receiptDate,
      totalPrice: totalAmount,
      currencyCode,
      createdBy: { connect: { id: user.id } },
      itemGroups: { create: itemGroupsData },
    },
    include: {
      itemGroups: {
        include: {
          items: {
            include: {
              supplements: { include: { translations: true } },
            },
          },
          translations: true,
        },
      },
    },
  });

  return receipt;
};
