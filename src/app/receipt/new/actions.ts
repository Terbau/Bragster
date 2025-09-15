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
  ReceiptItemSupplement,
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
    items: (ReceiptItem & { supplements: ReceiptItemSupplement[] })[];
  })[];
};

export const receiptScanAction = async (
  formData: FormData,
): Promise<ReceiptScanReturnType> => {
  const session = await getSession();
  const user = session?.user;

  console.log(user);

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

  const receipt = await prisma.receipt.create({
    data: {
      merchantName: azureReceipt.fields.MerchantName.content,
      receiptType: azureReceipt.fields.ReceiptType?.content,
      receiptDate,
      totalPrice: totalAmount,
      currencyCode,
      createdBy: { connect: { id: user.id } },
    },
  });

  const items = azureReceipt.fields.Items;
  if (items.kind !== "array") {
    throw new Error("Items field is not an array");
  }

  const itemsGroupsWithItems: (ReceiptItemGroup & {
    items: (ReceiptItem & { supplements: ReceiptItemSupplement[] })[];
  })[] = [];

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
      // Get last item group and add to those items
      if (itemsGroupsWithItems.length === 0) {
        throw new Error("No item groups found to add supplement to");
      }

      const lastItemGroup =
        itemsGroupsWithItems[itemsGroupsWithItems.length - 1];

      // There should be the same amount of supplements as items in the last item group
      if (lastItemGroup.items.length !== quantity) {
        throw new Error(
          "Number of supplements does not match number of items in last item group",
        );
      }

      const supplementsToCreate: Omit<
        ReceiptItemSupplement,
        "id" | "createdAt" | "updatedAt"
      >[] = lastItemGroup.items.map((item) => ({
        itemId: item.id,
        price: price ?? totalPrice,
        description,
      }));

      const supplements =
        await prisma.receiptItemSupplement.createManyAndReturn({
          data: supplementsToCreate,
        });

      for (const supplement of supplements) {
        lastItemGroup.items
          .find((item) => item.id === supplement.itemId)
          ?.supplements.push(supplement);
      }

      continue; // Skip creating a new item group for supplements
    }

    const itemGroup = await prisma.receiptItemGroup.create({
      data: {
        receiptId: receipt.id,
        price: totalPrice,
        description,
        quantity,
        quantityUnit,
        unitPrice: unitPrice ?? totalPrice / quantity, // should never choose the fallback but whatever
      },
    });

    // If the quantity is not a whole number, just set it to 1 when creating items
    // for simplicity
    const quantityToCreate = quantity % 1 === 0 ? quantity : 1;

    // Create array of n items
    const itemsToCreate: Omit<ReceiptItem, "id" | "createdAt" | "updatedAt">[] =
      Array.from({ length: Math.max(quantityToCreate) }).map(() => ({
        itemGroupId: itemGroup.id,
        price:
          quantityToCreate !== quantity ? totalPrice : (price ?? totalPrice), // If quantity is not a whole number, just set the price to totalPrice
      }));

    const items = await prisma.receiptItem.createManyAndReturn({
      data: itemsToCreate,
    });

    itemsGroupsWithItems.push({
      ...itemGroup,
      items: items.map((item) => ({
        ...item,
        supplements: [],
      })),
    });
  }

  return {
    ...receipt,
    itemGroups: itemsGroupsWithItems,
  };
};
