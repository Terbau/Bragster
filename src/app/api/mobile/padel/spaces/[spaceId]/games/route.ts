import { createPadelGame, getPadelSpaceGames } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../../_lib/handler";

type Params = { spaceId: string };

export const GET = withMobileUser<Params>(async (_request, { params }) =>
  getPadelSpaceGames(params.spaceId),
);

export const POST = withMobileUser<Params>(async (request, { params }) =>
  // biome-ignore lint/suspicious/noExplicitAny: validated by createPadelGame
  createPadelGame(params.spaceId, (await readJson(request)) as any),
);
