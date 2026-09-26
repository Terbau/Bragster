import { addUsersAndGuestsToSmartReceipt } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, withMobileUser } from "../../../_lib/handler";

const AddParticipantsSchema = z.object({
  userIds: z.array(z.string()),
  guestNames: z.array(z.string()),
});

/** Adds several users and guests at once, e.g. from another smart receipt */
export const POST = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const { userIds, guestNames } = AddParticipantsSchema.parse(
      await readJson(request),
    );
    return addUsersAndGuestsToSmartReceipt(
      params.smartReceiptId,
      userIds,
      guestNames,
    );
  },
);
