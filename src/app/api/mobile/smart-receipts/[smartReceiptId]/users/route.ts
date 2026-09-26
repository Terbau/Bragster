import { addUserToSmartReceipt } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, withMobileUser } from "../../../_lib/handler";

const AddUserSchema = z.object({ userId: z.string() });

export const POST = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const { userId } = AddUserSchema.parse(await readJson(request));
    return addUserToSmartReceipt(params.smartReceiptId, userId);
  },
);
