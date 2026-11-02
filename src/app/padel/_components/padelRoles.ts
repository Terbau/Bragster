import type { PadelSpaceRole } from "../_lib/server";

export const padelRoleLabel = (role: PadelSpaceRole) =>
  role === "OWNER" ? "Owner" : role === "HOST" ? "Host" : "Player";

/** What the user can do in the space, in a sentence */
export const padelRoleDescription = (
  role: PadelSpaceRole,
  ownerEmail: string,
) =>
  role === "OWNER"
    ? "You own this space."
    : role === "HOST"
      ? `You can host games here. Owned by ${ownerEmail}.`
      : `Your name is linked to your account, so you can follow the games here. Owned by ${ownerEmail}.`;
