import {
  getPadelPlayersSharing,
  setPadelPlayersSharing,
} from "@/app/padel/actions";
import { ApiError, readJson, withMobileUser } from "../../../../_lib/handler";

type Params = { spaceId: string };

/** `{ shareToken }` of the live link to the players, null when it's off */
export const GET = withMobileUser<Params>(async (_request, { params }) =>
  getPadelPlayersSharing(params.spaceId),
);

/** Body: `{ isShared }`, turns the live link to the players on or off */
export const PUT = withMobileUser<Params>(async (request, { params }) => {
  const body = (await readJson(request)) as { isShared?: unknown };
  if (typeof body?.isShared !== "boolean") {
    throw new ApiError(400, "Invalid input");
  }
  return setPadelPlayersSharing(params.spaceId, body.isShared);
});
