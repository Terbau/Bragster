import { removeGuestFromSmartReceipt } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { withMobileUser } from "../../../../_lib/handler";

export const DELETE = withMobileUser<{
  smartReceiptId: string;
  guestId: string;
}>(async (_request, { params }) =>
  removeGuestFromSmartReceipt(params.smartReceiptId, params.guestId),
);
