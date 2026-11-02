import { padelSpacePath } from "@/app/padel/_components/padelFormat";
import { SpaceNotFound } from "@/app/padel/_components/SpaceNotFound";
import { getPadelSpace } from "@/app/padel/actions";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import { getSession } from "@/lib/auth";
import { SpaceSettings } from "./SpaceSettings";

interface Params {
  params: Promise<{ spaceId: string }>;
}

export default async function PadelSpaceSettingsPage({ params }: Params) {
  const { spaceId } = await params;
  const [space, session] = await Promise.all([
    getPadelSpace(spaceId).catch(() => null),
    getSession(),
  ]);
  if (!space || !session) return <SpaceNotFound />;

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href={padelSpacePath(spaceId)} label={space.name} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Who can host games in {space.name}, and which players have an
            account.
          </p>
        </div>
      </div>
      <SpaceSettings space={space} currentUserId={session.user.id} />
    </div>
  );
}
