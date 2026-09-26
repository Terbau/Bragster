import { resetSmartReceiptTotalPrice } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { withMobileUser } from "../../../_lib/handler";

// Resets the total price back to the one on the original receipt
export const DELETE = withMobileUser<{ smartReceiptId: string }>(
  async (_request, { params }) =>
    resetSmartReceiptTotalPrice(params.smartReceiptId),
);
