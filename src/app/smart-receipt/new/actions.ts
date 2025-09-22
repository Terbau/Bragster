"use server";

import { receiptScanAction } from "@/app/receipt/new/actions";
import { getSession } from "@/lib/auth";
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
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const receipt = await receiptScanAction(formData);

  const smartReceipt = await createSmartReceipt(receipt.id);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    ...smartReceipt,
    receipt: {
      ...receipt,
      createdBy: user,
    },
    payments: [],
    guestPayments: [],
  };
};
