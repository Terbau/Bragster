"use server";

import { prisma } from "@/prisma";

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
