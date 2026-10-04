import { deletePadelGame, getPadelGame } from "@/app/padel/actions";
import { withMobileUser } from "../../../_lib/handler";

export const GET = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => getPadelGame(params.gameId),
);

export const DELETE = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => {
    await deletePadelGame(params.gameId);
    return { success: true };
  },
);
