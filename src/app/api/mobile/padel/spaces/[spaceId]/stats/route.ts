import { getPadelPlayerSummaries } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** Everyone who has played in the space, highest rating first */
export const GET = withMobileUser<{ spaceId: string }>(
  async (_request, { params }) => getPadelPlayerSummaries(params.spaceId),
);
