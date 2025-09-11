import { AvatarGroup } from "@/components/AvatarGroup/AvatarGroup";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import { SmartReceipt } from "@/components/SmartReceipt/SmartReceipt";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma";
import { smartReceiptInclude } from "@/types/receipt";
import { CircleDollarSign, Pencil, Settings, User } from "lucide-react";
import { CurrencyForm } from "./CurrencyForm";
import { unstable_cache } from "next/cache";
import fs from "node:fs/promises";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { SmartReceiptUserSearchModal } from "@/components/SmartReceiptUserSearchModal/SmartReceiptUserSearchModal";

interface Params {
  params: {
    smartReceiptId: string;
  };
}

interface CurrencyProperties {
  name: string;
  demonym: string;
  majorSingle: string;
  majorPlural: string;
  ISOnum: number;
  symbol: string;
  symbolNative: string;
  minorSingle: string;
  minorPlural: string;
  ISOdigits: number;
  decimals: number;
  numToBasic: number;
}

export const getCurrencies = unstable_cache(
  async () => {
    // read json file from /src/data/currencies.json
    const raw = await fs.readFile(
      `${process.cwd()}/src/data/currencies.json`,
      "utf8",
    );
    const data = JSON.parse(raw) as Record<string, CurrencyProperties>;
    return data;
  },
  [],
  { revalidate: 86400 }, // revalidate once a day
);

export default async function SmartReceiptPage({ params }: Params) {
  const { smartReceiptId } = await params;
  const currencies = await getCurrencies();

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: {
      id: smartReceiptId,
    },
    include: smartReceiptInclude,
  });

  if (!smartReceipt) {
    return <p>Receipt not found</p>;
  }

  console.log("Smart receipt:", smartReceipt);

  const sidebar = (
    <>
      <h2 className="font-medium text-xl">Smart Receipt Details</h2>
      <p className="text-sm text-muted-foreground">
        Below you will find all details related to this smart receipt. Please
        note that if you would like to change receipt specific properties, you
        must do it on the original receipt page.
      </p>

      <Accordion type="multiple">
        <AccordionItem className="flex flex-col" value="users">
          <AccordionTrigger className="flex flex-row gap-2 items-start justify-start text-left">
            <User className="h-6 w-6 shrink-0" />
            {/* <span className="text-sm font-medium">Users</span> */}
            <div className="text-sm font-medium flex flex-col gap-0.5">
              <span>Users</span>
              <span className="text-xs text-muted-foreground font-normal">
                Manage users associated with this smart receipt.
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1">
            <div className="flex flex-row items-center gap-1 w-full">
              <AvatarGroup users={smartReceipt.users} className="scale-90" />
              <div className="flex flex-row gap-1 ml-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="iconSm" variant="outline">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage users</DialogTitle>
                      <DialogDescription>
                        Here you can manage users associated with this smart
                        receipt.
                      </DialogDescription>
                    </DialogHeader>
                    <SmartReceiptUserSearchModal
                      smartReceiptId={smartReceipt.id}
                      selectedUsers={smartReceipt.users}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="flex flex-col border-b-0" value="currency">
          <AccordionTrigger className="flex flex-row gap-2 items-start justify-start text-left">
            <CircleDollarSign className="h-6 w-6 shrink-0" />
            <div className="text-sm font-medium flex flex-col gap-0.5">
              <span>Currency</span>
              <span className="text-xs text-muted-foreground font-normal">
                Currency related properties for this smart receipt.
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-1">
            <CurrencyForm
              currentCurrencyCode={
                smartReceipt.receipt.currencyCode ?? undefined
              }
              smartReceiptId={smartReceipt.id}
              currencies={Object.entries(currencies).map(
                ([currencyCode, properties]) => ({
                  label: `${currencyCode} - ${properties.name}`,
                  value: currencyCode,
                  keywords: [properties.name],
                }),
              )}
              receiptTotalPrice={smartReceipt.receipt.totalPrice}
              originalTotalSum={
                smartReceipt.updatedTotalPrice ??
                smartReceipt.receipt.totalPrice
              }
              updatedTotalSum={smartReceipt.updatedTotalPrice ?? undefined}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );

  return (
    <div>
      <div className="flex flex-row items-center justify-between gap-2">
        <BackArrow
          label="Back to receipt"
          href={`/receipt/${smartReceipt.receiptId}`}
        />
        <Dialog>
          <DialogTrigger asChild className="sm:hidden">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Properties
            </Button>
          </DialogTrigger>
          <DialogContent>{sidebar}</DialogContent>
        </Dialog>
      </div>
      <div className="flex-row gap-4 mt-3 flex">
        <SmartReceipt smartReceipt={smartReceipt} />
        <div className="w-64 h-fit rounded-lg px-4 pt-4 border border-foreground/10 hidden sm:flex flex-col">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
