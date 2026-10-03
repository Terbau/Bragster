"use server";

import { getSession } from "@/lib/auth";
import { createAzureCredentials } from "@/lib/azure/credentials";
import {
  analyzeDocument,
  createDocumentAnalysisClient,
  AzureFormServicesModel,
} from "@/lib/azure/formRecognizer";
import type {
  Prisma,
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
import {
  type ItemGroupRegion,
  type ReceiptRegions,
  toRegionRect,
} from "@/utils/receiptRegions";
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
  regions: ItemGroupRegion[];
}

interface ScannedLine {
  description?: string;
  price?: number;
  totalPrice?: number;
  originalTotalPrice?: number;
  quantity: number;
  quantityUnit: string | null;
  region: Omit<ItemGroupRegion, "kind">;
}

const toAmount = (field: FieldValue | undefined): number | undefined => {
  if (field?.kind === "currency") return field.value.amount;
  if (field?.kind === "number") return field.value;
  return undefined;
};

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

  // Positions of the fields on the image. Read from the raw result, since the
  // zod schema strips them.
  const page = result.pages?.[0];
  const pageSize =
    page?.width && page?.height
      ? { width: page.width, height: page.height }
      : undefined;
  const rawFields = document.fields as Record<string, unknown>;
  const rawItems =
    (rawFields.Items as { values?: { properties?: Record<string, unknown> }[] })
      ?.values ?? [];
  const receiptRegions: ReceiptRegions = {
    merchantName: toRegionRect(rawFields.MerchantName, pageSize),
    date: toRegionRect(rawFields.TransactionDate, pageSize),
    total: toRegionRect(rawFields.Total, pageSize),
  };

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

  // Read every line first, then stitch together lines Azure split in two:
  // sometimes the amount comes as an item without a description, and the
  // description as a separate item without an amount.
  const lines: ScannedLine[] = [];
  let pendingDescription: ScannedLine | null = null;
  for (let itemIndex = 0; itemIndex < items.values.length; itemIndex++) {
    const item = items.values[itemIndex];
    const rawItem = rawItems[itemIndex];
    const price = toAmount(item.properties.Price);
    const quantityValue = toAmount(item.properties.Quantity);
    const quantity =
      quantityValue !== undefined && quantityValue > 0 ? quantityValue : 1;
    const originalTotalPrice = toAmount(item.properties.TotalPrice);
    const line: ScannedLine = {
      description: item.properties.Description?.content,
      price,
      totalPrice:
        originalTotalPrice ?? (price !== undefined ? price * quantity : undefined),
      originalTotalPrice,
      quantity,
      quantityUnit:
        item.properties.QuantityUnit?.kind === "string"
          ? item.properties.QuantityUnit.value
          : null,
      region: {
        line: toRegionRect(rawItem, pageSize),
        description: toRegionRect(rawItem?.properties?.Description, pageSize),
        price: toRegionRect(
          rawItem?.properties?.TotalPrice ?? rawItem?.properties?.Price,
          pageSize,
        ),
      },
    };
    const previous = lines[lines.length - 1];

    if (line.totalPrice === undefined) {
      // Without an amount the line is only useful as a missing description
      if (line.description !== undefined) {
        if (previous && previous.description === undefined) {
          previous.description = line.description;
          previous.region.description = line.region.description;
        } else {
          pendingDescription = line;
        }
      }
      continue;
    }

    if (line.description === undefined && pendingDescription) {
      line.description = pendingDescription.description;
      line.region.description = pendingDescription.region.description;
    }
    pendingDescription = null;
    lines.push(line);
  }

  const precomputedItemGroupsMap = new Map<
    string,
    PrecomputedItemGroupValues
  >();
  let lastPrecomputedKey: string | null = null;
  // We need to precompute some stuff in order to group duplicate item groups. This is
  // not always needed, but for some receipt types all items have a single item group,
  // which tends to lead to a lot of duplicate item groups.
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const description = line.description ?? "Unknown";
    const { price, originalTotalPrice, quantity, quantityUnit } = line;
    const totalPrice = line.totalPrice as number;
    // If the unit price isn't printed, calculate it from totalPrice and quantity
    const unitPrice =
      price ??
      (originalTotalPrice !== undefined
        ? originalTotalPrice / quantity
        : undefined);

    const lastItemGroup = lastPrecomputedKey
      ? precomputedItemGroupsMap.get(lastPrecomputedKey)
      : undefined;

    // A supplement before any item is kept as an item of its own
    if (SUPPLEMENTS.includes(description) && lastItemGroup) {
      lastItemGroup.regions.push({ kind: "supplement", ...line.region });
      // The whole line, since one line can cover several items ("Antall: 6 stk")
      lastItemGroup.supplements = [
        ...lastItemGroup.supplements,
        { description, price: totalPrice },
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
        regions: [
          ...existingItemGroup.regions,
          { kind: "item", ...line.region },
        ],
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
      regions: [{ kind: "item", ...line.region }],
    });
  }

  // Build nested create data for all item groups, items, and supplements
  const itemGroupsData = Array.from(precomputedItemGroupsMap.values()).map(
    (group) => {
      const { totalPrice, quantity } = group;
      const quantityToCreate = quantity % 1 === 0 ? quantity : 1;
      const computedPrice =
        quantityToCreate !== quantity
          ? totalPrice
          : quantityToCreate > 1
            ? totalPrice / quantityToCreate
            : totalPrice;

      // Supplement lines don't always match the items one to one: a multipack
      // has deposit for every bottle, and one line can cover several items.
      // Spread each kind of supplement evenly over the items instead.
      const supplementTotals: Record<string, number> = {};
      for (const supplement of group.supplements) {
        supplementTotals[supplement.description] =
          (supplementTotals[supplement.description] ?? 0) + supplement.price;
      }
      const supplements = Object.keys(supplementTotals).map((description) => ({
        description,
        price: supplementTotals[description] / quantityToCreate,
      }));

      return {
        price: group.totalPrice,
        description: group.description,
        quantity: group.quantity,
        quantityUnit: group.quantityUnit,
        unitPrice: group.unitPrice ?? group.totalPrice / group.quantity,
        regions: group.regions as unknown as Prisma.InputJsonValue,
        items: {
          create: Array.from({ length: quantityToCreate }).map(() => ({
            price: computedPrice,
            ...(supplements.length > 0
              ? { supplements: { create: supplements } }
              : {}),
          })),
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
      regions: receiptRegions as Prisma.InputJsonValue,
      image: {
        create: {
          data: Buffer.from(await file.arrayBuffer()),
          mimeType: file.type || "image/jpeg",
        },
      },
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
