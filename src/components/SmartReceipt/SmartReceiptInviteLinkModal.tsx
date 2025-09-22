"use client";

import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { useState, type ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { TextInput } from "../Form/Fields/TextInput";
import { StandardForm } from "../Form";
import { CreateSmartReceiptInviteLinkSchema } from "@/types/action";
import { createSelectInput } from "../Form/Fields";
import { createSmartReceiptInviteLink } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { Separator } from "../ui/separator";
import { CircleCheck } from "lucide-react";
import { CopyButton } from "../CopyButton/CopyButton";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SmartReceiptInviteLinkModalProps
  extends ComponentProps<typeof Dialog> {
  smartReceipt: SmartReceiptWithItemsUsers;
  formDisabled?: boolean;
}

type ExpirationValue =
  (typeof CreateSmartReceiptInviteLinkSchema.shape.expirationTime.options)[number];

const getExpirationLabel = (value: ExpirationValue) => {
  switch (value) {
    case "ONE_HOUR":
      return "1 hour";
    case "ONE_DAY":
      return "1 day";
    case "SEVEN_DAYS":
      return "1 week";
    case "THIRTY_DAYS":
      return "30 days";
    case "NEVER":
      return "Never";
    default:
      return value;
  }
};

export const SmartReceiptInviteLinkModal = ({
  smartReceipt,
  formDisabled,
  ...props
}: SmartReceiptInviteLinkModalProps) => {
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const currentUrl = `${protocol}//${host}`;

  const [token, setToken] = useState<string | null>(null);
  const [copyPopoverOpen, setCopyPopoverOpen] = useState(false);

  const inviteLink = `${currentUrl}/smart-receipt/${smartReceipt.id}?inviteToken=${token}`;

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogTitle>Invite Users to Smart Receipt</DialogTitle>
        <DialogDescription>
          Create an invite link to share with others!
        </DialogDescription>

        {!token && (
          <StandardForm
            schema={CreateSmartReceiptInviteLinkSchema}
            defaultValues={{
              smartReceiptId: smartReceipt.id,
              expirationTime: "NEVER",
            }}
            fields={{
              expirationTime: createSelectInput({
                label: "Link expires after",
                items:
                  CreateSmartReceiptInviteLinkSchema.shape.expirationTime.options.map(
                    (option) => ({
                      label: getExpirationLabel(option),
                      value: option,
                    }),
                  ),
              }),
            }}
            formDisabled={formDisabled}
            disableSubmitWhenClean={false}
            submitLabel="Create Invite Link"
            action={createSmartReceiptInviteLink}
            onActionResult={(result) => {
              if (result) {
                setToken(result);
              }
            }}
          />
        )}

        {token && (
          <>
            <Separator />
            <span className="flex flex-row gap-1 items-center">
              <CircleCheck className="h-6 w-6 text-green-400" />
              <span className="text-sm text-foreground">
                Link created successfully!
              </span>
            </span>
            <div className="flex flex-row items-center gap-1 w-full [&>div]:w-full">
              <TextInput
                value={inviteLink}
                className="[&>input]:w-full"
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <Popover open={copyPopoverOpen} onOpenChange={setCopyPopoverOpen}>
                <PopoverTrigger asChild>
                  <CopyButton textToCopy={inviteLink} />
                </PopoverTrigger>
                <PopoverContent align="center" side="top" className="w-fit">
                  <span className="text-sm text-foreground">
                    Link copied to clipboard!
                  </span>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
