import { withMobileUser } from "../_lib/handler";

export const GET = withMobileUser(async (_request, { user }) => user);
