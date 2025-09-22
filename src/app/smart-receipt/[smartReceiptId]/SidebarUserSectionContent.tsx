"use client";

import { SmartReceiptInviteLinkModal } from "@/components/SmartReceipt/SmartReceiptInviteLinkModal";
import { SmartReceiptUserSearchModal } from "@/components/SmartReceiptUserSearchModal/SmartReceiptUserSearchModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@/lib/generated/prisma";
import type { SmartReceiptWithItemsUsers } from "@/types/receipt";
import { Pencil, Share } from "lucide-react";
import { useState } from "react";

interface SidebarUserSectionContentProps {
  smartReceipt: SmartReceiptWithItemsUsers;
  formDisabled?: boolean;
  currentUserIsOwner?: boolean;
  currentUser?: User;
}

export const SidebarUserSectionContent = ({
  smartReceipt,
  formDisabled = false,
  currentUserIsOwner = false,
  currentUser,
}: SidebarUserSectionContentProps) => {
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);

  return (
    <>
      <SmartReceiptInviteLinkModal
        smartReceipt={smartReceipt}
        open={inviteLinkModalOpen}
        onOpenChange={setInviteLinkModalOpen}
        formDisabled={formDisabled}
      />
      <div className="w-full flex flex-col gap-2">
        {/* <AvatarGroup users={smartReceipt.users} className="scale-90" /> */}
        <Dialog>
          <DialogTrigger asChild>
            {/* <Button size="iconSm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button> */}
            <Button variant="outline">
              <Pencil className="h-5 w-5 mr-1" />
              Manage Users
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ScrollArea className="max-h-[85vh] -mr-4 pr-4">
              <DialogHeader className="mb-4">
                <DialogTitle>Manage users</DialogTitle>
                <DialogDescription>
                  Here you can manage users associated with this smart receipt.
                </DialogDescription>
              </DialogHeader>
              <SmartReceiptUserSearchModal
                formDisabled={formDisabled}
                smartReceiptId={smartReceipt.id}
                users={smartReceipt.users}
                guests={smartReceipt.guests}
                currentUserIsOwner={currentUserIsOwner}
                currentUser={currentUser}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          className="flex flex-row gap-1 mb-2 sm:mb-0"
          onClick={() => setInviteLinkModalOpen(true)}
        >
          <Share className="h-5 w-5 mr-1" />
          <span className="font-regular">Invite Users</span>
        </Button>
      </div>
    </>
  );
};
