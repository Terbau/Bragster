import { getPadelMatchRatings } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** The ratings in every played match, by match id */
export const GET = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => getPadelMatchRatings(params.gameId),
);
