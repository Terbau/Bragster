import { updateSmartReceiptPermissions } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { UpdateSmartReceiptPermissionsSchema } from "@/types/action";
import { readJson, toFormData, withMobileUser } from "../../../_lib/handler";

const UpdatePermissionsBodySchema = UpdateSmartReceiptPermissionsSchema.pick({
  allowedPaymentEditors: true,
});

export const PUT = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const body = UpdatePermissionsBodySchema.parse(await readJson(request));

    return updateSmartReceiptPermissions(
      toFormData({ smartReceiptId: params.smartReceiptId, ...body }),
    );
  },
);
