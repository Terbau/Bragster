import { prisma } from "@/prisma";
import { smartReceiptWithUsersInclude } from "@/types/receipt";
import { ApiError, withMobileUser } from "../../../_lib/handler";
import { canViewReceipt } from "../../../_lib/receipts";

/** The scanned image of a receipt */
export const GET = withMobileUser<{ receiptId: string }>(
  async (_request, { user, params }) => {
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.receiptId },
      include: {
        smartReceipts: { include: smartReceiptWithUsersInclude },
        image: true,
      },
    });

    if (!receipt?.image || !canViewReceipt(receipt, user.id)) {
      throw new ApiError(404, "Image not found");
    }

    return new Response(receipt.image.data, {
      headers: {
        "Content-Type": receipt.image.mimeType,
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  },
);
