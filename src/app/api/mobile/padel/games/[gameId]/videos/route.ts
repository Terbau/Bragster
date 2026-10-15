import {
  createPadelRecording,
  getPadelGameVideos,
} from "@/app/padel/videoActions";
import { readJson, withMobileUser } from "../../../../_lib/handler";

export const GET = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => getPadelGameVideos(params.gameId),
);

/**
 * Body: `{ matchId, recordedAt, duration?, sizeBytes?, nearTeam? }`. Returns
 * the recording and `upload: { url, method, headers }` to upload the video to.
 */
export const POST = withMobileUser<{ gameId: string }>(
  async (request, { params }) =>
    createPadelRecording(
      params.gameId,
      // biome-ignore lint/suspicious/noExplicitAny: validated by createPadelRecording
      (await readJson(request)) as any,
    ),
);
