import {
  deletePadelGame,
  getPadelGame,
  updatePadelGame,
} from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../_lib/handler";

export const GET = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => getPadelGame(params.gameId),
);

/** Body: any of `{ name, players: [{ id, name }], courtNames, plannedRounds }` */
export const PATCH = withMobileUser<{ gameId: string }>(
  async (request, { params }) =>
    updatePadelGame(
      params.gameId,
      // biome-ignore lint/suspicious/noExplicitAny: validated by updatePadelGame
      (await readJson(request)) as any,
    ),
);

export const DELETE = withMobileUser<{ gameId: string }>(
  async (_request, { params }) => {
    await deletePadelGame(params.gameId);
    return { success: true };
  },
);
