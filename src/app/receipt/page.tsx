import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { receiptInclude, smartReceiptInclude } from "@/types/receipt";
import { ReceiptView } from "./ReceiptView";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) {
    return redirect("/sign-in");
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
