import { prisma } from "@/prisma";
import { receiptInclude, smartReceiptInclude } from "@/types/receipt";
import { withMobileUser } from "../_lib/handler";

export const GET = withMobileUser(async (_request, { user }) => {
  const [receipts, smartReceipts] = await Promise.all([
    prisma.receipt.findMany({
      where: { userId: user.id },
      include: receiptInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.smartReceipt.findMany({
      where: { users: { some: { id: user.id } } },
      include: smartReceiptInclude,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { receipts, smartReceipts };
});
