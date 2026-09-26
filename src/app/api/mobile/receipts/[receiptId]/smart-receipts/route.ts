import { createSmartReceipt } from "@/app/smart-receipt/new/actions";
import { withMobileUser } from "../../../_lib/handler";

export const POST = withMobileUser<{ receiptId: string }>(
  async (_request, { params }) => createSmartReceipt(params.receiptId),
);
