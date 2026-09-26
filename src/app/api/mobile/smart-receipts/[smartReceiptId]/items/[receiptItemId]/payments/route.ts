import { updateSmartReceiptPayments } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, withMobileUser } from "../../../../../_lib/handler";

const UpdatePaymentsSchema = z.object({
  userIds: z.array(z.string()),
  guestIds: z.array(z.string()),
});

export const PUT = withMobileUser<{
  smartReceiptId: string;
  receiptItemId: string;
}>(async (request, { params }) => {
  const { userIds, guestIds } = UpdatePaymentsSchema.parse(
    await readJson(request),
  );

  return updateSmartReceiptPayments(
    params.smartReceiptId,
    params.receiptItemId,
    userIds,
    guestIds,
  );
});
