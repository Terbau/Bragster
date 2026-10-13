import { getPadelPlayerSummaries } from "@/app/padel/actions";
import { withMobileUser } from "../../_lib/handler";

export const GET = withMobileUser(async () => getPadelPlayerSummaries());
