import { removeUserFromSmartReceipt } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { withMobileUser } from "../../../../_lib/handler";

export const DELETE = withMobileUser<{ smartReceiptId: string; userId: string }>(
  async (_request, { params }) =>
    removeUserFromSmartReceipt(params.smartReceiptId, params.userId),
);
