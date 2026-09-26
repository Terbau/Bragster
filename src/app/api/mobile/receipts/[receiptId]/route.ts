import { editReceipt } from "@/app/receipt/[receiptId]/actions";
import { prisma } from "@/prisma";
import { receiptInclude, smartReceiptWithUsersInclude } from "@/types/receipt";
import { ApiError, readJson, withMobileUser } from "../../_lib/handler";
import { canViewReceipt } from "../../_lib/receipts";

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
        image: { select: { id: true } },
      },
    });

    if (!receipt || !canViewReceipt(receipt, user.id)) {
      throw new ApiError(404, "Receipt not found");
    }

    const { image, ...rest } = receipt;
    return {
      receipt: rest,
      isOwner: receipt.userId === user.id,
      hasImage: image !== null,
    };
  },
);

/** Saves the complete edited receipt, see `editReceipt` */
export const PUT = withMobileUser<{ receiptId: string }>(
  async (request, { params }) =>
    // biome-ignore lint/suspicious/noExplicitAny: validated by editReceipt
    editReceipt(params.receiptId, (await readJson(request)) as any),
);
