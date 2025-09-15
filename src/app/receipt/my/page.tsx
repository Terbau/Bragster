import { ReceiptCard } from "@/components/ReceiptCard/ReceiptCard";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { receiptIncludeItemCount } from "@/types/receipt";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyReceiptsPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect("/auth/sign-in");
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
