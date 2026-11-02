import { addPadelSpaceHost } from "@/app/padel/actions";
import { ApiError, readJson, withMobileUser } from "../../../../_lib/handler";

/** Body: `{ userId }`, lets the user host games. Owner only. */
export const POST = withMobileUser<{ spaceId: string }>(
  async (request, { params }) => {
    const body = (await readJson(request)) as { userId?: unknown };
    if (typeof body?.userId !== "string") {
      throw new ApiError(400, "Invalid input");
    }
    return addPadelSpaceHost(params.spaceId, body.userId);
  },
);
