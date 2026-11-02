import { getPadelPlayerProfile } from "@/app/padel/actions";
import { withMobileUser } from "../../../../../_lib/handler";

/** `key` is the player's name */
export const GET = withMobileUser<{ spaceId: string; key: string }>(
  async (_request, { params }) =>
    getPadelPlayerProfile(params.spaceId, params.key),
);
