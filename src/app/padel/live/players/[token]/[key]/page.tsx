import { BackArrow } from "@/components/BackArrow/BackArrow";
import type { Metadata } from "next";
import { LiveRefresh } from "../../../../_components/LiveRefresh";
import { PadelPlayerProfileView } from "../../../../_components/PadelPlayerProfileView";
import {
  decodeKey,
  padelPlayersLivePath,
} from "../../../../_components/padelFormat";
import {
  findPadelPlayersOwner,
  loadPadelPlayerProfile,
} from "../../../../_lib/players";
import { NotShared } from "../NotShared";

interface Params {
  params: Promise<{ token: string; key: string }>;
}

export const metadata: Metadata = {
  title: "Padel player",
  robots: { index: false, follow: false },
};

/** A player's rating and stats, for anyone with the link */
export default async function PadelPlayerLivePage({ params }: Params) {
  const { token, key } = await params;
  const userId = await findPadelPlayersOwner(token);
  if (!userId) return <NotShared />;
  const basePath = padelPlayersLivePath(token);
  const profile = await loadPadelPlayerProfile(userId, decodeKey(key));

  if (!profile) {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href={basePath} label="All players" />
        <p className="text-muted-foreground">Player not found.</p>
      </div>
    );
  }
  return (
    <>
      <LiveRefresh />
      <PadelPlayerProfileView profile={profile} basePath={basePath} isPublic />
    </>
  );
}
