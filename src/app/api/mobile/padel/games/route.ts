import { createPadelGame, getPadelGames } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser(async () => getPadelGames());

export const POST = withMobileUser(async (request) =>
  // biome-ignore lint/suspicious/noExplicitAny: validated by createPadelGame
  createPadelGame((await readJson(request)) as any),
);
