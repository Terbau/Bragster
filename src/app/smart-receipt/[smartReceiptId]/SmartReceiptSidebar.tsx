import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { CircleDollarSign, type LucideProps, Pencil, User } from "lucide-react";
import { CurrencyForm } from "./CurrencyForm";
import { CURRENCIES } from "@/lib/currencies";
import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";
import { PermissionsForm } from "./PermissionsForm";
import { SidebarUserSectionContent } from "./SidebarUserSectionContent";
import type { User as UserType } from "@/lib/generated/prisma";

interface SmartReceiptSidebarProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  formsDisabled?: boolean;
  currentUserIsOwner?: boolean;
  currentUser?: UserType;
}

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;
interface SidebarItem {
  label: string;
  description: string;
  icon: LucideIcon;
  content: ReactNode;
}

export const SmartReceiptSidebar = ({
  smartReceipt,
  formsDisabled = false,
  currentUserIsOwner = false,
  currentUser,
}: SmartReceiptSidebarProps) => {
  const sidebarItems: SidebarItem[] = [
    {
      label: "Users",
      description: "Manage users associated with this smart receipt.",
      icon: User,
      content: (
        <SidebarUserSectionContent
          smartReceipt={smartReceipt}
          formDisabled={formsDisabled}
          currentUserIsOwner={currentUserIsOwner}
          currentUser={currentUser}
        />
      ),
    },
    {
      label: "Currency",
      description: "Currency related properties for this smart receipt.",
      icon: CircleDollarSign,
      content: (
        <CurrencyForm
          formDisabled={formsDisabled}
          currentCurrencyCode={
            smartReceipt.updatedCurrencyCode ??
            smartReceipt.receipt.currencyCode ??
            undefined
          }
          smartReceiptId={smartReceipt.id}
          currencies={Object.entries(CURRENCIES).map(
            ([currencyCode, properties]) => ({
              label: `${currencyCode} - ${properties.name}`,
              value: currencyCode,
              keywords: [properties.name],
            }),
          )}
          receiptTotalPrice={smartReceipt.receipt.totalPrice}
          originalTotalSum={
            smartReceipt.updatedTotalPrice ?? smartReceipt.receipt.totalPrice
          }
          updatedTotalSum={smartReceipt.updatedTotalPrice ?? undefined}
        />
      ),
    },
    {
      label: "Permissions",
      description: "Manage permissions for this smart receipt.",
      icon: Pencil,
      content: (
        <PermissionsForm
          smartReceipt={smartReceipt}
          formDisabled={formsDisabled}
        />
      ),
    },
  ];

  return (
    <>
      <h2 className="font-medium text-xl">Smart Receipt Properties</h2>
      <p className="text-sm text-muted-foreground">
        Below you will find all details related to this smart receipt. Please
        note that if you would like to change receipt specific properties, you
        must do it on the original receipt page.
      </p>

      <Accordion type="multiple">
        {sidebarItems.map(({ icon: LucideIcon, ...item }) => (
          <AccordionItem
            className="flex flex-col"
            value={item.label.toLowerCase()}
            key={item.label}
          >
            <AccordionTrigger className="flex flex-row gap-2 items-start justify-start text-left">
              <LucideIcon className="h-6 w-6 shrink-0" />
              <div className="text-sm font-medium flex flex-col gap-0.5">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {item.description}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1">{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};
