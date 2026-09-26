import { updateSmartReceiptCurrencyProperties } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, toFormData, withMobileUser } from "../../../_lib/handler";

const UpdateCurrencyBodySchema = z.object({
  currencyCode: z.string(),
  totalPrice: z.number().optional(),
});

export const PUT = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const body = UpdateCurrencyBodySchema.parse(await readJson(request));

    return updateSmartReceiptCurrencyProperties(
      toFormData({ smartReceiptId: params.smartReceiptId, ...body }),
    );
  },
);
