import { getPreviousPadelPlayers } from "@/app/padel/actions";
import { withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser(async () => getPreviousPadelPlayers());
