import {
  deletePadelRecording,
  updatePadelRecording,
} from "@/app/padel/videoActions";
import { readJson, withMobileUser } from "../../../../../_lib/handler";

type Params = { gameId: string; recordingId: string };

/** Body: any of `{ matchId, matchCount, nearTeam: { matchId, team } }` */
export const PATCH = withMobileUser<Params>(async (request, { params }) =>
  updatePadelRecording(
    params.gameId,
    params.recordingId,
    // biome-ignore lint/suspicious/noExplicitAny: validated by updatePadelRecording
    (await readJson(request)) as any,
  ),
);

export const DELETE = withMobileUser<Params>(async (_request, { params }) => {
  await deletePadelRecording(params.gameId, params.recordingId);
  return { success: true };
});
