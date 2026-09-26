import { getSmartReceiptsForUser } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { withMobileUser } from "../_lib/handler";

export const GET = withMobileUser(async (_request, { user }) =>
  getSmartReceiptsForUser(user.id),
);
