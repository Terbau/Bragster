import { markPadelRecordingUploaded } from "@/app/padel/videoActions";
import { withMobileUser } from "../../../../../../_lib/handler";

/** Called when the upload has finished */
export const POST = withMobileUser<{ gameId: string; recordingId: string }>(
  async (_request, { params }) =>
    markPadelRecordingUploaded(params.gameId, params.recordingId),
);
