import { leavePadelSpace } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** Stops hosting and unlinks the user's own name */
export const POST = withMobileUser<{ spaceId: string }>(
  async (_request, { params }) => {
    await leavePadelSpace(params.spaceId);
    return { success: true };
  },
);
