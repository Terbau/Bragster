import { endPadelSeries } from "@/app/padel/actions";
import { withMobileUser } from "../../../../../_lib/handler";

/** Ends the series being played (a Mexicano: the game) early */
export const POST = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => endPadelSeries(params.gameId),
);
