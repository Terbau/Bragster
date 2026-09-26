import {
  addGuestToSmartReceipt,
  checkGuestNameValidity,
} from "@/app/smart-receipt/[smartReceiptId]/actions";
import { z } from "zod";
import { readJson, withMobileUser } from "../../../_lib/handler";

const AddGuestSchema = z.object({ name: z.string() });

/** Checks whether a guest name is available, `?name=` */
export const GET = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) =>
    checkGuestNameValidity(
      params.smartReceiptId,
      request.nextUrl.searchParams.get("name") ?? "",
    ),
);

export const POST = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const { name } = AddGuestSchema.parse(await readJson(request));
    return addGuestToSmartReceipt(params.smartReceiptId, name);
  },
);
