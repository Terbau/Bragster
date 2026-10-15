import { BackArrow } from "@/components/BackArrow/BackArrow";
import { isVideoStorageEnabled } from "@/lib/azure/storage";
import { prisma } from "@/prisma";
import { getOwnedGame, requireUser } from "../../../_lib/server";
import { recordingInclude, toRecordingView } from "../../../_lib/videos";
import { PadelVideoView } from "./PadelVideoView";

interface Params {
  params: Promise<{ gameId: string; recordingId: string }>;
  searchParams: Promise<{ match?: string; rally?: string }>;
}

export default async function PadelVideoPage({ params, searchParams }: Params) {
  const { gameId, recordingId } = await params;
  const { match, rally } = await searchParams;
  const user = await requireUser();

  const game = await getOwnedGame(gameId, user.id).catch(() => null);
  const recording =
    game && isVideoStorageEnabled()
      ? await prisma.padelRecording.findUnique({
          where: { id: recordingId },
          include: recordingInclude,
        })
      : null;
  if (!game || !recording || recording.gameId !== gameId) {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href={`/padel/${gameId}`} label="Back to the game" />
        <p className="text-muted-foreground">Video not found.</p>
      </div>
    );
  }

  return (
    <PadelVideoView
      game={game}
      recording={await toRecordingView(game, recording)}
      initialMatchId={match}
      initialRallyId={rally}
    />
  );
}
