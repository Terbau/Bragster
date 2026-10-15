import { useLocalSearchParams } from "expo-router";
import { ErrorState } from "@/components/ErrorState";
import { VideoViewer } from "@/components/padel/VideoViewer";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { usePadelGame, usePadelGameVideos } from "@/lib/queries";

export default function PadelVideoScreen() {
  const { gameId, recordingId, rallyId } = useLocalSearchParams<{
    gameId: string;
    recordingId: string;
    rallyId?: string;
  }>();
  const game = usePadelGame(gameId);
  const videos = usePadelGameVideos(gameId);

  if (game.isPending || videos.isPending) {
    return <Spinner className="flex-1" />;
  }
  if (game.error || !game.data) {
    return <ErrorState error={game.error} onRetry={game.refetch} />;
  }
  if (videos.error || !videos.data) {
    return <ErrorState error={videos.error} onRetry={videos.refetch} />;
  }
  const recording = videos.data.recordings.find((r) => r.id === recordingId);
  if (!recording) {
    return (
      <Text className="p-8 text-center text-muted-foreground">
        The video has been deleted.
      </Text>
    );
  }
  return (
    <VideoViewer game={game.data} recording={recording} initialRallyId={rallyId} />
  );
}
