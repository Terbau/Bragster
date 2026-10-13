import { setPadelGameSharing } from "@/app/padel/actions";
import { ApiError, readJson, withMobileUser } from "../../../../_lib/handler";

/** Body: `{ isShared }`, turns the live link on or off */
export const PUT = withMobileUser<{ gameId: string }>(
  async (request, { params }) => {
    const body = (await readJson(request)) as { isShared?: unknown };
    if (typeof body?.isShared !== "boolean") {
      throw new ApiError(400, "Invalid input");
    }
    return setPadelGameSharing(params.gameId, body.isShared);
  },
);
