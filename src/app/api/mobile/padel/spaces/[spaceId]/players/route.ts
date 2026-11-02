import { getPreviousPadelPlayers } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** Everyone who has played in the space, the most recent first */
export const GET = withMobileUser<{ spaceId: string }>(
  async (_request, { params }) => getPreviousPadelPlayers(params.spaceId),
);
