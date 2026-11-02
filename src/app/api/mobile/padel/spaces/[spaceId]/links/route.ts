import { linkPadelPlayer } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../../_lib/handler";

/** Body: `{ name, userId }`, links a player's name to a user. Owner only. */
export const POST = withMobileUser<{ spaceId: string }>(
  async (request, { params }) =>
    // biome-ignore lint/suspicious/noExplicitAny: validated by linkPadelPlayer
    linkPadelPlayer(params.spaceId, (await readJson(request)) as any),
);
