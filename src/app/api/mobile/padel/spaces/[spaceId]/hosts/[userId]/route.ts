import { removePadelSpaceHost } from "@/app/padel/actions";
import { withMobileUser } from "../../../../../_lib/handler";

/** Stops the user from hosting games. Owner only. */
export const DELETE = withMobileUser<{ spaceId: string; userId: string }>(
  async (_request, { params }) =>
    removePadelSpaceHost(params.spaceId, params.userId),
);
