import { getCurrencyConversions } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, toFormData, withMobileUser } from "../../_lib/handler";

const ConvertSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number().min(0),
});

/** Converts `amount` in the `from` currency to the `to` currency */
export const POST = withMobileUser(async (request) => {
  const { from, to, amount } = ConvertSchema.parse(await readJson(request));

  return getCurrencyConversions(
    toFormData({
      currencyToConvertFrom: from,
      currencyToConvertTo: to,
      amount,
    }),
  );
});
