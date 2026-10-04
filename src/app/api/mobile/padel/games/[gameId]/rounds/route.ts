import { reorderPadelRounds } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../../_lib/handler";

/** Body: `{ roundIds }` in the new play order */
export const PUT = withMobileUser<{ gameId: string }>(
  async (request, { params }) =>
    // biome-ignore lint/suspicious/noExplicitAny: validated by reorderPadelRounds
    reorderPadelRounds(params.gameId, (await readJson(request)) as any),
);
