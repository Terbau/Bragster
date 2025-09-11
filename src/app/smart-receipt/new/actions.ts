"use server";

import { receiptScanAction } from "@/app/receipt/new/actions";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/prisma";
import {
  type SmartReceiptWithUsers,
  smartReceiptWithUsersInclude,
  type SmartReceiptWithItemsUsers,
} from "@/types/receipt";
import { redirect } from "next/navigation";

export const createSmartReceipt = async (
  receiptId: string,
): Promise<SmartReceiptWithUsers> => {
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

  const smartReceipt = await prisma.smartReceipt.create({
    data: {
      receiptId,
      users: {
        connect: { id: userId },
      },
    },
    include: smartReceiptWithUsersInclude,
  });

  return smartReceipt;
};

export const receiptScanAndCreateSmartReceiptAction = async (
  formData: FormData,
): Promise<SmartReceiptWithItemsUsers> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const receipt = await receiptScanAction(formData);

  const smartReceipt = await createSmartReceipt(receipt.id);

  return {
    ...smartReceipt,
    receipt,
    payments: [],
  };
};
