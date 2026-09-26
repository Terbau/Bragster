import { receiptScanAndCreateSmartReceiptAction } from "@/app/smart-receipt/new/actions";
import { ZodError } from "zod";
import { ApiError, withMobileUser } from "../../_lib/handler";

// Analyzing a receipt with Azure usually takes 5-15 seconds
export const maxDuration = 60;

export const POST = withMobileUser(async (request) => {
  const formData = await request.formData().catch(() => null);
  if (!(formData?.get("file") instanceof File)) {
    throw new ApiError(400, "No receipt image was uploaded");
  }

  try {
    return await receiptScanAndCreateSmartReceiptAction(formData);
  } catch (error) {
    // Azure's result is validated with zod, e.g. a receipt without a date fails
    if (error instanceof ZodError) {
      throw new ApiError(
        422,
        "Could not read the receipt. Make sure the whole receipt, including the date and total, is visible and try again.",
      );
    }
    throw error;
  }
});
