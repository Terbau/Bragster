import { searchUsers } from "@/app/actions";
import { withMobileUser } from "../../_lib/handler";

/** Searches users by email, `?q=` */
export const GET = withMobileUser(async (request) =>
  searchUsers(request.nextUrl.searchParams.get("q") ?? ""),
);
