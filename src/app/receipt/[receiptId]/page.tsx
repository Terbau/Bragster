import { createSmartReceipt } from "@/app/smart-receipt/new/actions";
import { Receipt } from "@/components/Receipt/Receipt";
import { SmartReceiptListRow } from "@/components/SmartReceiptRow/SmartReceiptRow";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/prisma";
import { smartReceiptWithUsersInclude } from "@/types/receipt";
import Link from "next/link";
import { redirect } from "next/navigation";

interface Params {
  params: {
    receiptId: string;
  };
}

export default async function ReceiptPage({ params }: Params) {
  const { receiptId } = await params;

  const receipt = await prisma.receipt.findUnique({
    where: {
      id: receiptId,
    },
    include: {
      itemGroups: {
        include: {
          items: {
            include: {
              supplements: true,
            },
          },
        },
      },
      smartReceipts: {
        include: smartReceiptWithUsersInclude,
      },
    },
  });

  const handleCreateSmartReceipt = async () => {
    "use server";

    if (!receipt) {
      throw new Error("Cannot create smart receipt when receipt is null");
    }

    const smartReceipt = await createSmartReceipt(receipt.id);

    return redirect(`/smart-receipt/${smartReceipt.id}`);
  };

  if (!receipt) {
    return <p>Receipt not found</p>;
  }

  return (
    <div className="flex flex-row gap-4">
      <Receipt receipt={receipt} className="mx-auto" />
      <div className="w-64 h-fit rounded-lg p-4 border border-foreground/10 flex flex-col">
        <h2 className="font-medium text-xl">Smart Receipts</h2>
        <p className="text-sm text-muted-foreground">
          Below you will find all smart receipts associated with this receipt.
        </p>
        <div className="flex flex-row gap-2 mt-2 mb-4 [&>*]:flex-1">
          <Button variant="outline" onClick={handleCreateSmartReceipt}>
            Create new
          </Button>
          {/* <Button variant="outline">Delete</Button> */}
        </div>
        <Separator orientation="horizontal" />
        {receipt.smartReceipts.length > 0 ? (
          <ul className="flex flex-col gap-2 mt-4">
            {receipt.smartReceipts.map((smartReceipt) => (
              <Link
                key={smartReceipt.id}
                href={`/smart-receipt/${smartReceipt.id}`}
              >
                <SmartReceiptListRow
                  key={smartReceipt.id}
                  smartReceipt={smartReceipt}
                  className="hover:bg-accent"
                />
              </Link>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No smart receipts found.
          </p>
        )}
      </div>
    </div>
  );
}
