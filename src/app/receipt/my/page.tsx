import { ReceiptCard } from "@/components/ReceiptCard/ReceiptCard";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/prisma";
import { receiptIncludeItemCount } from "@/types/receipt";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyReceiptsPage() {
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
    orderBy: {
      receiptDate: "desc",
    },
    include: receiptIncludeItemCount,
  });

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {receipts.map((receipt) => (
          <li key={receipt.id}>
            <Link href={`/receipt/${receipt.id}`}>
              <ReceiptCard receipt={receipt} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
