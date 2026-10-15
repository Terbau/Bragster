import { updatePadelRally } from "@/app/padel/videoActions";
import { readJson, withMobileUser } from "../../../../../../../_lib/handler";

/** Body: any of `{ winner: { matchId, team } | null, isIgnored }` */
export const PATCH = withMobileUser<{
  gameId: string;
  recordingId: string;
  rallyId: string;
}>(async (request, { params }) =>
  updatePadelRally(
    params.gameId,
    params.recordingId,
    params.rallyId,
    // biome-ignore lint/suspicious/noExplicitAny: validated by updatePadelRally
    (await readJson(request)) as any,
  ),
);
