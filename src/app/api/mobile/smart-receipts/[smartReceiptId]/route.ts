import { SmartReceiptAllowedPaymentEditor } from "@/lib/generated/prisma";
import { prisma } from "@/prisma";
import { smartReceiptInclude } from "@/types/receipt";
import { canUserEditSmartReceiptPayments } from "@/utils/smartReceipt";
import { ApiError, withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser<{ smartReceiptId: string }>(
  async (_request, { user, params }) => {
    const smartReceipt = await prisma.smartReceipt.findUnique({
      where: { id: params.smartReceiptId },
      include: smartReceiptInclude,
    });

    if (!smartReceipt) {
      throw new ApiError(404, "Smart receipt not found");
    }

    const isOwner = smartReceipt.receipt.userId === user.id;
    const isParticipant = smartReceipt.users.some((u) => u.id === user.id);
    const canEditPayments =
      (isParticipant ||
        smartReceipt.allowedPaymentEditors ===
          SmartReceiptAllowedPaymentEditor.ANYONE) &&
      canUserEditSmartReceiptPayments(smartReceipt, user, null);

    return {
      smartReceipt,
      viewer: { isOwner, isParticipant, canEditPayments },
      isTranslating:
        smartReceipt.receipt.itemGroups.length > 0 &&
        smartReceipt.receipt.itemGroups.some(
          (group) => group.translations.length === 0,
        ),
    };
  },
);
