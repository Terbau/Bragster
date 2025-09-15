import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { receiptInclude, smartReceiptInclude } from "@/types/receipt";
import { ReceiptView } from "./ReceiptView";
import { getSession } from "@/lib/auth";

export default async function ReceiptsPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect("/auth/sign-in");
  }

  const receipts = await prisma.receipt.findMany({
    where: {
      userId: user.id,
    },
    include: receiptInclude,
  });
  const smartReceipts = await prisma.smartReceipt.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
    include: smartReceiptInclude,
  });

  return (
    <ReceiptView
      currentUser={user}
      receipts={receipts}
      smartReceipts={smartReceipts}
    />
  );
}
