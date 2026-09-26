import { prisma } from "@/prisma";
import { receiptInclude, smartReceiptWithUsersInclude } from "@/types/receipt";
import { ApiError, withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser<{ receiptId: string }>(
  async (_request, { user, params }) => {
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.receiptId },
      include: {
        ...receiptInclude,
        smartReceipts: {
          include: smartReceiptWithUsersInclude,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const canView =
      receipt &&
      (receipt.userId === user.id ||
        receipt.smartReceipts.some((smartReceipt) =>
          smartReceipt.users.some((u) => u.id === user.id),
        ));

    if (!receipt || !canView) {
      throw new ApiError(404, "Receipt not found");
    }

    return { receipt, isOwner: receipt.userId === user.id };
  },
);
