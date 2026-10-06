import { addPadelSeries } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** Starts a new series with the same players once every match is played */
export const POST = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => addPadelSeries(params.gameId),
);
