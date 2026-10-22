import {
  getPadelPlayersSharing,
  setPadelPlayersSharing,
} from "@/app/padel/actions";
import { ApiError, readJson, withMobileUser } from "../../../_lib/handler";

/** `{ shareToken }` of the live link to the players, null when it's off */
export const GET = withMobileUser(async () => getPadelPlayersSharing());

/** Body: `{ isShared }`, turns the live link to the players on or off */
export const PUT = withMobileUser(async (request) => {
  const body = (await readJson(request)) as { isShared?: unknown };
  if (typeof body?.isShared !== "boolean") {
    throw new ApiError(400, "Invalid input");
  }
  return setPadelPlayersSharing(body.isShared);
});
