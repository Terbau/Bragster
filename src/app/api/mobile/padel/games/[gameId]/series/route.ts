import { addPadelSeries, removePadelSeries } from "@/app/padel/actions";
import { withMobileUser } from "../../../../_lib/handler";

/** Starts a new series with the same players once every match is played */
export const POST = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => addPadelSeries(params.gameId),
);

/** Removes the series being played, when none of it has been played */
export const DELETE = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => removePadelSeries(params.gameId),
);
