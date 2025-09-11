"use server";

import type { ReceiptItemGroup } from "@/lib/generated/prisma";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/prisma";
import type { UpdateSmartReceiptItemGroupSchema } from "@/types/action";
import { redirect } from "next/navigation";
import type { z } from "zod";

export const updateReceiptItemGroup = async (
  receiptId: string,
  itemGroupId: string,
  properties: z.infer<typeof UpdateSmartReceiptItemGroupSchema>,
): Promise<ReceiptItemGroup> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const userId = data.user.id;

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

  // The change in price also needs to be reflected in the total price of the receipt
  const priceDifference = price - (itemGroup?.price || 0);
  await prisma.receipt.update({
    where: { id: receiptId },
    data: { totalPrice: receipt.totalPrice + priceDifference },
  });

  return updatedItemGroup;
};
