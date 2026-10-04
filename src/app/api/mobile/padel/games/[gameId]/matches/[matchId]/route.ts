import { updatePadelMatchScore } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../../../_lib/handler";

/** Body: `{ team1Score, team2Score }`, both `null` to clear the score */
export const PUT = withMobileUser<{ gameId: string; matchId: string }>(
  async (request, { params }) =>
    updatePadelMatchScore(
      params.gameId,
      params.matchId,
      // biome-ignore lint/suspicious/noExplicitAny: validated by updatePadelMatchScore
      (await readJson(request)) as any,
    ),
);
