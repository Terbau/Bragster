import { getPadelRecordingUpload } from "@/app/padel/videoActions";
import { withMobileUser } from "../../../../../../_lib/handler";

/** A new upload link, when the first one has expired */
export const POST = withMobileUser<{ gameId: string; recordingId: string }>(
  async (_request, { params }) =>
    getPadelRecordingUpload(params.gameId, params.recordingId),
);
