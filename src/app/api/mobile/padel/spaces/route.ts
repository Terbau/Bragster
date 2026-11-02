import { createPadelSpace, getPadelSpaces } from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../_lib/handler";

/** The spaces the user owns, hosts or plays in */
export const GET = withMobileUser(async () => getPadelSpaces());

/** Body: `{ name }` */
export const POST = withMobileUser(async (request) =>
  // biome-ignore lint/suspicious/noExplicitAny: validated by createPadelSpace
  createPadelSpace((await readJson(request)) as any),
);
