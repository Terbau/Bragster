import { analyzePadelRecording } from "@/app/padel/videoActions";
import { withMobileUser } from "../../../../../../_lib/handler";

/** Finds the rallies of the video again */
export const POST = withMobileUser<{ gameId: string; recordingId: string }>(
  async (_request, { params }) =>
    analyzePadelRecording(params.gameId, params.recordingId),
);
