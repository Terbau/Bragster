import { endPadelRound } from "@/app/padel/actions";
import { withMobileUser } from "../../../../../../_lib/handler";

/** Ends the round being played. Matches without a score aren't played. */
export const POST = withMobileUser<{ gameId: string; roundId: string }>(
  async (_request, { params }) => endPadelRound(params.gameId, params.roundId),
);
