"use server";

import {
  translateReceiptItemGroups,
  translateReceiptItemSupplements,
} from "@/app/receipt/actions";
import { getSession } from "@/lib/auth";
import type { ReceiptItemGroup } from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import {
  EditReceiptSchema,
  type UpdateSmartReceiptItemGroupSchema,
} from "@/types/action";
import { receiptInclude, type ReceiptWithItems } from "@/types/receipt";
import { redirect } from "next/navigation";
import { after } from "next/server";
import type { z } from "zod";

export const updateReceiptItemGroup = async (
  receiptId: string,
  itemGroupId: string,
  properties: z.infer<typeof UpdateSmartReceiptItemGroupSchema>,
): Promise<ReceiptItemGroup> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const userId = user.id;

  // First we need to check that the receipt is made by the same user
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
  });

  if (!receipt) {
    throw new Error("Receipt not found");
  }

  if (receipt.userId !== userId) {
    throw new Error(
      "You are not allowed to create a smart receipt for this receipt",
    );
  }

  const itemGroup = await prisma.receiptItemGroup.findUnique({
    where: { id: itemGroupId },
  });

  if (!itemGroup || itemGroup.receiptId !== receiptId) {
    throw new Error("Receipt item group not found");
  }

  const price = properties.price ?? itemGroup?.price ?? 0;
  const quantity = properties.quantity ?? itemGroup?.quantity ?? 1;
  const description = properties.description ?? itemGroup?.description ?? "";

  const updatedItemGroup = await prisma.receiptItemGroup.update({
    where: { id: itemGroupId },
    data: { price, quantity, description },
  });
  await prisma.receiptItem.updateMany({
    where: { itemGroupId: itemGroupId },
    data: { price },
  });

  // The change in price also needs to be reflected in the total price of the receipt.
  // EDIT: No we dont this messes up things
  // const priceDifference = price - (itemGroup?.price || 0);
  // await prisma.receipt.update({
  //   where: { id: receiptId },
  //   data: { totalPrice: receipt.totalPrice + priceDifference },
  // });

  return updatedItemGroup;
};

type SupplementInput = { description: string; price: number };

const sameSupplements = (
  current: SupplementInput[],
  next: SupplementInput[],
) =>
  current.length === next.length &&
  current.every(
    (supplement, index) =>
      supplement.description === next[index].description &&
      supplement.price === next[index].price,
  );

/**
 * Saves a fully edited receipt at once, so the values stay consistent:
 * - a whole quantity becomes that many assignable units, each costing
 *   price / quantity (a fractional quantity, e.g. 0.452 kg, is one unit)
 * - item groups that are left out are removed, together with their
 *   assignments in smart receipts
 * - renamed and new items are translated again
 */
export const editReceipt = async (
  receiptId: string,
  input: z.input<typeof EditReceiptSchema>,
): Promise<ReceiptWithItems> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const edit = EditReceiptSchema.parse(input);

  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      itemGroups: {
        include: {
          items: {
            include: {
              supplements: { orderBy: { createdAt: "asc" } },
              _count: {
                select: { smartPayments: true, guestSmartPayments: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!receipt) {
    throw new Error("Receipt not found");
  }

  if (receipt.userId !== user.id) {
    throw new Error("You are not allowed to edit this receipt");
  }

  const existingGroups = new Map(
    receipt.itemGroups.map((group) => [group.id, group]),
  );
  for (const group of edit.itemGroups) {
    if (group.id && !existingGroups.has(group.id)) {
      throw new Error("Receipt item group not found");
    }
  }

  const groupsToTranslate: string[] = [];
  const supplementsToTranslate: string[] = [];

  await prisma.$transaction(
    async (tx) => {
      await tx.receipt.update({
        where: { id: receiptId },
        data: {
          merchantName: edit.merchantName,
          receiptDate: edit.receiptDate,
          totalPrice: edit.totalPrice,
          currencyCode: edit.currencyCode,
        },
      });

      const keptGroupIds = edit.itemGroups.flatMap((group) =>
        group.id ? [group.id] : [],
      );
      await tx.receiptItemGroup.deleteMany({
        where: { receiptId, id: { notIn: keptGroupIds } },
      });

      for (const group of edit.itemGroups) {
        const unitCount = Number.isInteger(group.quantity) ? group.quantity : 1;
        const unitPrice = group.price / unitCount;
        const groupData = {
          description: group.description,
          price: group.price,
          quantity: group.quantity,
          quantityUnit: group.quantityUnit || null,
          unitPrice: group.price / group.quantity,
        };

        if (!group.id) {
          const created = await tx.receiptItemGroup.create({
            data: {
              ...groupData,
              receiptId,
              items: {
                create: Array.from({ length: unitCount }, () => ({
                  price: unitPrice,
                  supplements: { create: group.supplements },
                })),
              },
            },
            include: { items: { include: { supplements: true } } },
          });
          groupsToTranslate.push(created.id);
          supplementsToTranslate.push(
            ...created.items.flatMap((item) => item.supplements.map((s) => s.id)),
          );
          continue;
        }

        const existing = existingGroups.get(group.id);
        if (!existing) continue;

        await tx.receiptItemGroup.update({
          where: { id: group.id },
          data: groupData,
        });

        if (existing.description !== group.description) {
          await tx.receiptItemGroupTranslation.deleteMany({
            where: { itemGroupId: group.id },
          });
          groupsToTranslate.push(group.id);
        }

        // Keep units that are assigned to someone when lowering the quantity
        const units = [...existing.items].sort(
          (a, b) =>
            b._count.smartPayments +
            b._count.guestSmartPayments -
            (a._count.smartPayments + a._count.guestSmartPayments),
        );
        const keptUnits = units.slice(0, unitCount);
        const removedUnits = units.slice(unitCount);

        if (removedUnits.length > 0) {
          await tx.receiptItem.deleteMany({
            where: { id: { in: removedUnits.map((unit) => unit.id) } },
          });
        }

        await tx.receiptItem.updateMany({
          where: { id: { in: keptUnits.map((unit) => unit.id) } },
          data: { price: unitPrice },
        });

        const currentSupplements = (keptUnits[0]?.supplements ?? []).map(
          ({ description, price }) => ({ description, price }),
        );
        if (!sameSupplements(currentSupplements, group.supplements)) {
          await tx.receiptItemSupplement.deleteMany({
            where: { itemId: { in: keptUnits.map((unit) => unit.id) } },
          });
          const createdSupplements =
            await tx.receiptItemSupplement.createManyAndReturn({
              data: keptUnits.flatMap((unit) =>
                group.supplements.map((supplement) => ({
                  ...supplement,
                  itemId: unit.id,
                })),
              ),
            });
          supplementsToTranslate.push(...createdSupplements.map((s) => s.id));
        }

        for (let i = keptUnits.length; i < unitCount; i++) {
          const created = await tx.receiptItem.create({
            data: {
              itemGroupId: group.id,
              price: unitPrice,
              supplements: { create: group.supplements },
            },
            include: { supplements: true },
          });
          supplementsToTranslate.push(...created.supplements.map((s) => s.id));
        }
      }
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  if (groupsToTranslate.length > 0 || supplementsToTranslate.length > 0) {
    after(async () => {
      try {
        await Promise.all([
          groupsToTranslate.length > 0 &&
            translateReceiptItemGroups(groupsToTranslate),
          supplementsToTranslate.length > 0 &&
            translateReceiptItemSupplements(supplementsToTranslate),
        ]);
      } catch {
        // Translation failure is non-critical; the original text is shown
      }
    });
  }

  return prisma.receipt.findUniqueOrThrow({
    where: { id: receiptId },
    include: receiptInclude,
  });
};
