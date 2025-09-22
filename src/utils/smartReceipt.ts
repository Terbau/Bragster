import { getSession } from "@/lib/auth";
import {
  SmartReceiptAllowedPaymentEditor,
  type SmartReceiptGuest,
  type User,
} from "@/lib/generated/prisma";
import type {
  SmartReceiptWithItemsUsers,
  SmartReceiptWithUsers,
} from "@/types/receipt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const calculateSmartReceiptAllowedPaymentEditor = (
  smartReceipt: SmartReceiptWithItemsUsers,
  user?: User | null,
  guest?: SmartReceiptGuest | null,
): SmartReceiptAllowedPaymentEditor => {
  if (!user && !guest) {
    return SmartReceiptAllowedPaymentEditor.ANYONE;
  }

  if (smartReceipt.receipt.userId === user?.id) {
    return SmartReceiptAllowedPaymentEditor.OWNER;
  }

  if (smartReceipt.guests.some((g) => g.id === guest?.id)) {
    return SmartReceiptAllowedPaymentEditor.GUESTS;
  }

  return SmartReceiptAllowedPaymentEditor.AUTHENTICATED_USERS;
};

export const canUserEditSmartReceiptPayments = (
  smartReceipt: SmartReceiptWithItemsUsers,
  user?: User | null,
  guest?: SmartReceiptGuest | null,
): boolean => {
  const currentUserLevel = calculateSmartReceiptAllowedPaymentEditor(
    smartReceipt,
    user,
    guest,
  );

  // Owner = 0, Authenticated = 1, Anyone = 2
  const levelList = Object.values(SmartReceiptAllowedPaymentEditor);
  const currentUserLevelIndex = levelList.indexOf(currentUserLevel);
  const allowedEditorLevelIndex = levelList.indexOf(
    smartReceipt.allowedPaymentEditors,
  );

  return currentUserLevelIndex <= allowedEditorLevelIndex;
};

export const performPermissionLevelCheck = async (
  smartReceipt: SmartReceiptWithUsers,
  user?: User | null,
  guest?: SmartReceiptGuest | null,
) => {
  "use server";

  const permissionLevel = smartReceipt.allowedPaymentEditors;

  let userToUse = user;
  let guestToUse = guest;

  if (permissionLevel === SmartReceiptAllowedPaymentEditor.OWNER) {
    if (!userToUse) {
      const session = await getSession();
      userToUse = session?.user;

      if (!userToUse) {
        return redirect("/auth/sign-in");
      }
    }

    if (!userToUse || smartReceipt.receipt.userId !== userToUse.id) {
      throw new Error("You are not allowed to update this smart receipt");
    }
  } else if (
    permissionLevel === SmartReceiptAllowedPaymentEditor.AUTHENTICATED_USERS
  ) {
    if (!userToUse) {
      const session = await getSession();
      userToUse = session?.user;

      if (!userToUse) {
        return redirect("/auth/sign-in");
      }
    }

    if (!userToUse || !smartReceipt.users.some((u) => u.id === userToUse?.id)) {
      throw new Error("You are not allowed to update this smart receipt");
    }
  } else if (permissionLevel === SmartReceiptAllowedPaymentEditor.GUESTS) {
    if (!guestToUse) {
      const cookieStore = await cookies();
      const guestId = cookieStore.get(`guest-${smartReceipt.id}`)?.value;
      guestToUse = smartReceipt.guests.find((g) => g.id === guestId);
    }
    if (!guestToUse) {
      throw new Error("You are not allowed to update this smart receipt");
    }
  }

  return { user: userToUse, guest: guestToUse };
};
