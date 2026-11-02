import { unlinkPadelPlayer } from "@/app/padel/actions";
import { withMobileUser } from "../../../../../_lib/handler";

/** `key` is the player's name. Owner only. */
export const DELETE = withMobileUser<{ spaceId: string; key: string }>(
  async (_request, { params }) => unlinkPadelPlayer(params.spaceId, params.key),
);
