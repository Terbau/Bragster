import { BackArrow } from "@/components/BackArrow/BackArrow";
import { PadelPlayerProfileView } from "../../_components/PadelPlayerProfileView";
import { decodeKey } from "../../_components/padelFormat";
import type { PadelPlayerProfileWithVideo } from "../../_lib/players";
import { getPadelPlayerProfile } from "../../actions";

interface Params {
  params: Promise<{ key: string }>;
}

export default async function PadelPlayerPage({ params }: Params) {
  const { key } = await params;
  let profile: PadelPlayerProfileWithVideo;
  try {
    profile = await getPadelPlayerProfile(decodeKey(key));
  } catch {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href="/padel/players" label="All players" />
        <p className="text-muted-foreground">Player not found.</p>
      </div>
    );
  }
  return <PadelPlayerProfileView profile={profile} basePath="/padel/players" />;
}
