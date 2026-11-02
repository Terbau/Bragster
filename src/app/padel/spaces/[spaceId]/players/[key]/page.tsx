import { PadelPlayerProfileView } from "@/app/padel/_components/PadelPlayerProfileView";
import {
  decodeKey,
  padelPlayersPath,
} from "@/app/padel/_components/padelFormat";
import { getPadelPlayerProfile } from "@/app/padel/actions";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import type { PadelPlayerProfile } from "@/utils/padelStats";

interface Params {
  params: Promise<{ spaceId: string; key: string }>;
}

export default async function PadelPlayerPage({ params }: Params) {
  const { spaceId, key } = await params;
  const basePath = padelPlayersPath(spaceId);
  let profile: PadelPlayerProfile;
  try {
    profile = await getPadelPlayerProfile(spaceId, decodeKey(key));
  } catch {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href={basePath} label="All players" />
        <p className="text-muted-foreground">Player not found.</p>
      </div>
    );
  }
  return <PadelPlayerProfileView profile={profile} basePath={basePath} />;
}
