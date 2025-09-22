"use server";

import { getSession } from "@/lib/auth";
import type {
  SmartReceiptGuestPayment,
  ReceiptItem,
  SmartReceipt,
  SmartReceiptGuest,
  SmartReceiptPayment,
  User,
} from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import {
  CalculateSumSchema,
  CreateSmartReceiptInviteLinkSchema,
  UpdateCurrencySchema,
  UpdateSmartReceiptPermissionsSchema,
} from "@/types/action";
import {
  smartReceiptWithPaymentsInclude,
  type SmartReceiptWithUsers,
  smartReceiptWithUsersInclude,
} from "@/types/receipt";
import { performPermissionLevelCheck } from "@/utils/smartReceipt";
import { formatName } from "@/utils/utils";
import { cookies } from "next/headers";
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
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

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
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== user.id) {
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
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
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

  if (smartReceipt.receipt.userId !== user.id) {
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
  guestIds: SmartReceiptGuest["id"][],
): Promise<(SmartReceiptPayment | SmartReceiptGuestPayment)[]> => {
  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true, guests: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  await performPermissionLevelCheck(smartReceipt);

  await Promise.all([
    prisma.smartReceiptPayment.deleteMany({
      where: {
        smartReceiptId,
        receiptItemId,
      },
    }),
    prisma.smartReceiptGuestPayment.deleteMany({
      where: {
        smartReceiptId,
        receiptItemId,
      },
    }),
  ]);

  // If left empty, then stop here
  if (userIds.length === 0 && guestIds.length === 0) {
    return [];
  }

  await Promise.all([
    prisma.smartReceiptPayment.createMany({
      data: userIds.map((userId) => ({
        smartReceiptId,
        receiptItemId,
        userId,
      })),
    }),
    prisma.smartReceiptGuestPayment.createMany({
      data: guestIds.map((guestId) => ({
        smartReceiptId,
        receiptItemId,
        guestId,
      })),
    }),
  ]);

  const smartReceiptWithNewPayments =
    await prisma.smartReceipt.findUniqueOrThrow({
      where: { id: smartReceiptId },
      include: smartReceiptWithPaymentsInclude,
    });

  return [
    ...smartReceiptWithNewPayments.payments,
    ...smartReceiptWithNewPayments.guestPayments,
  ];
};

export const addUserToSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  userIdToAdd: User["id"],
): Promise<SmartReceipt> => {
  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true, guests: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  const { user } = await performPermissionLevelCheck(smartReceipt);

  if (user && userIdToAdd === user.id) {
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

export const addGuestToSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  guestName: string,
): Promise<SmartReceipt> => {
  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true, guests: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  const { user } = await performPermissionLevelCheck(smartReceipt);

  if (user && smartReceipt.receipt.userId !== user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const formattedGuestName = formatName(guestName);

  if (formattedGuestName.length <= 1) {
    throw new Error("Guest name is too short");
  }

  if (
    smartReceipt.guests.find((g) => formatName(g.name) === formattedGuestName)
  ) {
    throw new Error("A guest with this name has already joined");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      guests: {
        create: { name: formattedGuestName },
      },
    },
    include: { guests: true, receipt: true },
  });

  return updatedSmartReceipt;
};

export const removeUserFromSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  userIdToRemove: User["id"],
): Promise<SmartReceipt> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  if (userIdToRemove === user.id) {
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

export const removeGuestFromSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  guestIdToRemove: SmartReceiptGuest["id"],
): Promise<void> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, guests: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const guestToRemove = await prisma.smartReceiptGuest.findUnique({
    where: { id: guestIdToRemove },
  });

  if (!guestToRemove) {
    throw new Error("Guest to remove not found");
  }

  await prisma.smartReceiptGuest.delete({
    where: { id: guestIdToRemove },
  });
};

// TODO: Alert when removing user. And alert if any payments will be deleted.
// Check if guests are guests in all requests when permissions allow for it.

export const updateSmartReceiptPermissions = async (
  formData: FormData,
): Promise<SmartReceipt> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const { smartReceiptId, allowedPaymentEditors } =
    UpdateSmartReceiptPermissionsSchema.parse(Object.fromEntries(formData));

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      allowedPaymentEditors,
    },
  });

  return updatedSmartReceipt;
};

export const createSmartReceiptInviteLink = async (
  formData: FormData,
): Promise<string> => {
  const { smartReceiptId, expirationTime } =
    CreateSmartReceiptInviteLinkSchema.parse(Object.fromEntries(formData));

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { receipt: true, users: true, guests: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  const { user } = await performPermissionLevelCheck(smartReceipt);

  if (!user || !smartReceipt.users.some((u) => u.id === user.id)) {
    throw new Error("Only signed in users can create invite links");
  }

  let expiresAt: Date | null = new Date();
  switch (expirationTime) {
    case "ONE_HOUR":
      expiresAt.setHours(expiresAt.getHours() + 1);
      break;
    case "ONE_DAY":
      expiresAt.setDate(expiresAt.getDate() + 1);
      break;
    case "SEVEN_DAYS":
      expiresAt.setDate(expiresAt.getDate() + 7);
      break;
    case "THIRTY_DAYS":
      expiresAt.setDate(expiresAt.getDate() + 30);
      break;
    case "NEVER":
      expiresAt = null;
  }

  const inviteLink = await prisma.smartReceiptInviteLink.create({
    data: {
      smartReceiptId,
      createdById: user.id,
      expiresAt,
    },
  });

  return inviteLink.id;
};

export const checkInviteLinkValidity = async (token: string) => {
  const inviteLink = await prisma.smartReceiptInviteLink.findUnique({
    where: { id: token },
  });

  if (!inviteLink) {
    return { valid: false, reason: "Invite link not found" };
  }

  if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
    return { valid: false, reason: "Invite link has expired" };
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: inviteLink.smartReceiptId },
  });

  if (!smartReceipt) {
    return { valid: false, reason: "Smart receipt not found" };
  }

  return { valid: true, smartReceiptId: smartReceipt.id };
};

export const joinSmartReceiptUsingInviteToken = async (
  token: string,
): Promise<SmartReceipt> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const inviteLinkValidity = await checkInviteLinkValidity(token);

  if (!inviteLinkValidity.valid) {
    throw new Error(inviteLinkValidity.reason || "Invalid invite link");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: inviteLinkValidity.smartReceiptId },
    include: { users: true, receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.users.find((u) => u.id === user.id)) {
    throw new Error("You are already a participant in this smart receipt");
  }

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceipt.id },
    data: {
      users: {
        connect: { id: user.id },
      },
    },
    include: { users: true, receipt: true },
  });

  return updatedSmartReceipt;
};

export const joinSmartReceiptAsGuestUsingInviteToken = async (
  token: string,
  guestName: string,
): Promise<SmartReceipt> => {
  const inviteLinkValidity = await checkInviteLinkValidity(token);

  if (!inviteLinkValidity.valid) {
    throw new Error(inviteLinkValidity.reason || "Invalid invite link");
  }

  let smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: inviteLinkValidity.smartReceiptId },
    include: { guests: true, users: true, receipt: true },
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  const formattedGuestName = formatName(guestName);

  if (formattedGuestName.length <= 1) {
    throw new Error("Guest name is too short");
  }

  let guest = smartReceipt.guests.find(
    (g) => formatName(g.name) === formattedGuestName,
  );

  if (!guest) {
    smartReceipt = await prisma.smartReceipt.update({
      where: { id: smartReceipt.id },
      data: {
        guests: {
          create: { name: formattedGuestName },
        },
      },
      include: { guests: true, users: true, receipt: true },
    });
    guest = smartReceipt.guests.find(
      (g) => formatName(g.name) === formattedGuestName,
    );

    if (!guest) {
      throw new Error("Guest not found after creation");
    }
  }

  (await cookies()).set(`guest-${smartReceipt.id}`, guest.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });

  return smartReceipt;
};

export const checkGuestNameValidity = async (
  smartReceiptId: string,
  guestName: string,
): Promise<{ valid: boolean; existing: boolean; reason?: string }> => {
  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: { guests: true },
  });

  if (!smartReceipt) {
    return { valid: false, existing: false, reason: "Smart receipt not found" };
  }

  const existingGuest = smartReceipt.guests.find(
    (g) => formatName(g.name) === formatName(guestName),
  );

  if (existingGuest) {
    return {
      valid: false,
      existing: true,
      reason: "A guest with this name has already joined",
    };
  }

  return { valid: true, existing: false };
};

export const getSmartReceiptsForUser = async (
  userId: User["id"],
): Promise<SmartReceiptWithUsers[]> => {
  const smartReceipts = await prisma.smartReceipt.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: smartReceiptWithUsersInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return smartReceipts;
};

export const addUsersAndGuestsToSmartReceipt = async (
  smartReceiptId: SmartReceipt["id"],
  userIds: string[],
  guestNames: string[],
): Promise<SmartReceiptWithUsers> => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: smartReceiptId },
    include: smartReceiptWithUsersInclude,
  });

  if (!smartReceipt) {
    throw new Error("Smart receipt not found");
  }

  if (smartReceipt.receipt.userId !== user.id) {
    throw new Error("You are not allowed to update this smart receipt");
  }

  const filteredUserIdsToAdd = userIds.filter(
    (id) => !smartReceipt.users.some((u) => u.id === id),
  );
  const filteredGuestNamesToAdd = guestNames.filter(
    (name) =>
      !smartReceipt.guests.some((g) => formatName(g.name) === formatName(name)),
  );

  const updatedSmartReceipt = await prisma.smartReceipt.update({
    where: { id: smartReceiptId },
    data: {
      users: {
        connect: filteredUserIdsToAdd.map((id) => ({ id })),
      },
      guests: {
        create: filteredGuestNamesToAdd.map((name) => ({
          name: formatName(name),
        })),
      },
    },
    include: { users: true, guests: true, receipt: true },
  });

  return updatedSmartReceipt;
};
