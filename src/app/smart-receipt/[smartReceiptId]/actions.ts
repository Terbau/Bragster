"use server";

import type {
  ReceiptItem,
  SmartReceipt,
  SmartReceiptPayment,
  User,
} from "@/lib/generated/prisma";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/prisma";
import { CalculateSumSchema, UpdateCurrencySchema } from "@/types/action";
import { redirect } from "next/navigation";

export interface CurrencyConversionResult {
  result: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

export const getCurrencyConversions = async (formData: FormData) => {
  const { currencyToConvertFrom, currencyToConvertTo, amount } =
    CalculateSumSchema.parse(Object.fromEntries(formData));

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw new Error("No API key for exchange rate API");
  }
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currencyToConvertFrom}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch currency conversions");
  }
  const data = (await res.json()) as CurrencyConversionResult;

  return {
    currencyCode: currencyToConvertFrom,
    amount: amount * data.conversion_rates[currencyToConvertTo],
  };
};

export const resetSmartReceiptTotalPrice = async (
  smartReceiptId: string,
): Promise<SmartReceipt> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== data.user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      updatedTotalPrice: null,
    },
  });

  return updatedSmartReceipt;
};

export const updateSmartReceiptCurrencyProperties = async (
  formData: FormData,
): Promise<SmartReceipt> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const { smartReceiptId, totalPrice, currencyCode } =
    UpdateCurrencySchema.parse(Object.fromEntries(formData));

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== data.user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      updatedTotalPrice: totalPrice,
      updatedCurrencyCode:
        currencyCode === smartReceipt.receipt.currencyCode
          ? null
          : currencyCode,
    },
  });

  return updatedSmartReceipt;
};

export const updateSmartReceiptPayments = async (
  smartReceiptId: SmartReceipt["id"],
  receiptItemId: ReceiptItem["id"],
  userIds: User["id"][],
): Promise<SmartReceiptPayment[]> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (!smartReceipt.users.find((u) => u.id === data.user.id)) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  await prisma.smartReceiptPayment.deleteMany({
    where: {
      smartReceiptId,
      receiptItemId,
    },
  });

  // If left empty, then stop here
  if (userIds.length === 0) {
    return [];
  }

  await prisma.smartReceiptPayment.createMany({
    data: userIds.map((userId) => ({
      smartReceiptId,
      receiptItemId,
      userId,
    })),
  });

  const payments = await prisma.smartReceiptPayment.findMany({
    where: {
      smartReceiptId,
      receiptItemId,
    },
  });

  return payments;
};

export const addUserToSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  userIdToAdd: User["id"],
): Promise<SmartReceipt> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== data.user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  if (userIdToAdd === data.user.id) {
    throw new Error("You cannot add yourself to the smart receipt");
  }

  const userToAdd = await prisma.user.findUnique({
    where: { id: userIdToAdd },
  });

  if (!userToAdd) {
    throw new Error("User to add not found");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      users: {
        connect: { id: userIdToAdd },
      },
    },
    include: { users: true, receipt: true },
  });

  return updatedSmartReceipt;
};

export const removeUserFromSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  userIdToRemove: User["id"],
): Promise<SmartReceipt> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return redirect("/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== data.user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  if (userIdToRemove === data.user.id) {
    throw new Error("You cannot remove yourself from the smart receipt");
  }

  const userToRemove = await prisma.user.findUnique({
    where: { id: userIdToRemove },
  });

  if (!userToRemove) {
    throw new Error("User to remove not found");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      users: {
        disconnect: { id: userIdToRemove },
      },
    },
    include: { users: true, receipt: true },
  });

  return updatedSmartReceipt;
};
