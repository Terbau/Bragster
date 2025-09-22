import { redirect } from "next/navigation";
import { checkInviteLinkValidity } from "./actions";
import { prisma } from "@/prisma";
import { smartReceiptWithUsersInclude } from "@/types/receipt";

interface Params {
  params: Promise<{
    token: string;
  }>;
}

export default async function RedeemInviteLinkPage({ params }: Params) {
  const { token } = await params;

  const inviteLinkValidity = await checkInviteLinkValidity(token);

  if (!inviteLinkValidity.valid) {
    return <p>{inviteLinkValidity.reason}</p>;
  }

  const smartReceipt = await prisma.smartReceipt.findUnique({
    where: { id: inviteLinkValidity.smartReceiptId },
    include: smartReceiptWithUsersInclude,
  });

  if (!smartReceipt) {
    return <p>Smart receipt not found</p>;
  }

  return redirect(`/smart-receipt/${smartReceipt.id}?inviteToken=${token}`);
}
