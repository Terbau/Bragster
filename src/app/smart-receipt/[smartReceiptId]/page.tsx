import { BackArrow } from "@/components/BackArrow/BackArrow";
import { SmartReceipt } from "@/components/SmartReceipt/SmartReceipt";
import { TranslationPoller } from "@/components/SmartReceipt/TranslationPoller";
import { Button } from "@/components/ui/button";
import { prisma } from "@/prisma";
import { smartReceiptInclude } from "@/types/receipt";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SmartReceiptSidebar } from "./SmartReceiptSidebar";
import { getSession } from "@/lib/auth";
import { canUserEditSmartReceiptPayments } from "@/utils/smartReceipt";
import { JoinSmartReceiptModal } from "./JoinSmartReceiptModal";
import { checkInviteLinkValidity } from "./actions";
import { cookies } from "next/headers";
import { QuickSetupWizard } from "./QuickSetupWizard";

interface Params {
  params: Promise<{
    smartReceiptId: string;
  }>;
  searchParams: Promise<{
    inviteToken?: string;
    setup?: string;
  }>;
}

export default async function SmartReceiptPage({
  params,
  searchParams,
}: Params) {
  const { smartReceiptId } = await params;
  const { inviteToken, setup } = await searchParams;
  const cookieStore = await cookies();

  const session = await getSession();
  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: {
      id: smartReceiptId,
    },
    include: smartReceiptInclude,
  });

  if (!smartReceipt) {
    return <p>Receipt not found</p>;
  }

  const guestId = cookieStore.get(`guest-${smartReceipt.id}`)?.value;
  const guest = smartReceipt.guests.find((g) => g.id === guestId);
  const currentUserIsGuestParticipant = !!guest;

  const currentUserCanCreatePayments = canUserEditSmartReceiptPayments(
    smartReceipt,
    session?.user,
    guest,
  );
  const currentUserIsOwner = smartReceipt.receipt.userId === session?.user?.id;
  const isTranslating =
    smartReceipt.receipt.itemGroups.length > 0 &&
    smartReceipt.receipt.itemGroups.some((g) => g.translations.length === 0);
  const currentUserIsParticipant = smartReceipt.users.some(
    (user) => user.id === session?.user?.id,
  );

  let linkInvalidReason: string | null = null;
  let inviteLinkValidity: boolean | null = null;
  if (!currentUserIsParticipant && inviteToken) {
    const inviteLinkValidityCheck = await checkInviteLinkValidity(inviteToken);
    linkInvalidReason = inviteLinkValidityCheck.reason || null;
    inviteLinkValidity = inviteLinkValidityCheck.valid;
  }

  const sidebar = (
    <SmartReceiptSidebar
      smartReceipt={smartReceipt}
      formsDisabled={!currentUserIsOwner}
      currentUserIsOwner={currentUserIsOwner}
      currentUser={session?.user}
    />
  );

  return (
    <>
      {inviteToken &&
        !(currentUserIsParticipant || currentUserIsGuestParticipant) && (
          <JoinSmartReceiptModal
            reason={linkInvalidReason}
            valid={inviteLinkValidity}
            token={inviteToken}
            smartReceipt={smartReceipt}
            user={session?.user}
          />
        )}
      {currentUserIsOwner && setup === "true" && session?.user && (
        <QuickSetupWizard
          smartReceipt={smartReceipt}
          currentUser={session.user}
        />
      )}
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
            <DialogContent>
              <DialogTitle className="sr-only">
                Smart receipt properties
              </DialogTitle>
              {sidebar}
            </DialogContent>
          </Dialog>
        </div>
        <TranslationPoller isTranslating={isTranslating} receiptId={smartReceipt.receiptId} />
        <div className="flex-row gap-4 mt-3 flex">
          <SmartReceipt
            smartReceipt={smartReceipt}
            currentUserCanCreatePayments={currentUserCanCreatePayments}
            currentUser={currentUserIsParticipant ? session?.user : null}
            currentGuest={currentUserIsGuestParticipant ? guest : null}
          />
          <div className="w-64 h-fit rounded-lg px-4 pt-4 border border-foreground/10 hidden sm:flex flex-col">
            {sidebar}
          </div>
        </div>
      </div>
    </>
  );
}
