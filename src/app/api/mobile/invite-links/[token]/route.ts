import {
  checkInviteLinkValidity,
  joinSmartReceiptUsingInviteToken,
} from "@/app/smart-receipt/[smartReceiptId]/actions";
import { withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser<{ token: string }>(
  async (_request, { params }) => checkInviteLinkValidity(params.token),
);

/** Joins the smart receipt the invite link belongs to */
export const POST = withMobileUser<{ token: string }>(
  async (_request, { params }) =>
    joinSmartReceiptUsingInviteToken(params.token),
);
