import { createSmartReceiptInviteLink } from "@/app/smart-receipt/[smartReceiptId]/actions";
import { CreateSmartReceiptInviteLinkSchema } from "@/types/action";
import { readJson, toFormData, withMobileUser } from "../../../_lib/handler";

const CreateInviteLinkBodySchema = CreateSmartReceiptInviteLinkSchema.pick({
  expirationTime: true,
});

export const POST = withMobileUser<{ smartReceiptId: string }>(
  async (request, { params }) => {
    const body = CreateInviteLinkBodySchema.parse(await readJson(request));
    const token = await createSmartReceiptInviteLink(
      toFormData({ smartReceiptId: params.smartReceiptId, ...body }),
    );

    const url = new URL(
      `/smart-receipt/${params.smartReceiptId}`,
      request.nextUrl.origin,
    );
    url.searchParams.set("inviteToken", token);

    return { token, url: url.toString() };
  },
);
