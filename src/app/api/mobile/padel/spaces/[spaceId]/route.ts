import {
  deletePadelSpace,
  getPadelSpace,
  renamePadelSpace,
} from "@/app/padel/actions";
import { readJson, withMobileUser } from "../../../_lib/handler";

type Params = { spaceId: string };

export const GET = withMobileUser<Params>(async (_request, { params }) =>
  getPadelSpace(params.spaceId),
);

/** Body: `{ name }`, owner only */
export const PATCH = withMobileUser<Params>(async (request, { params }) =>
  // biome-ignore lint/suspicious/noExplicitAny: validated by renamePadelSpace
  renamePadelSpace(params.spaceId, (await readJson(request)) as any),
);

/** Deletes the space with all its games, owner only */
export const DELETE = withMobileUser<Params>(async (_request, { params }) => {
  await deletePadelSpace(params.spaceId);
  return { success: true };
});
