import { updateReceiptItemGroup } from "@/app/receipt/[receiptId]/actions";
import { UpdateSmartReceiptItemGroupSchema } from "@/types/action";
import { readJson, withMobileUser } from "../../../../_lib/handler";

export const PATCH = withMobileUser<{ receiptId: string; itemGroupId: string }>(
  async (request, { params }) => {
    const properties = UpdateSmartReceiptItemGroupSchema.parse(
      await readJson(request),
    );

    return updateReceiptItemGroup(
      params.receiptId,
      params.itemGroupId,
      properties,
    );
  },
);
