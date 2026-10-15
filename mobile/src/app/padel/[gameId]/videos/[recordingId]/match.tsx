import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { MatchPicker } from "@/components/padel/MatchPicker";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { courtMatches } from "@/lib/padel";
import { usePadelGame, usePadelGameVideos, useUpdatePadelRecording } from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame, PadelRecording } from "@/lib/types";

export default function ChangeVideoMatchScreen() {
  const { gameId, recordingId } = useLocalSearchParams<{
    gameId: string;
    recordingId: string;
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
  return <ChangeMatch game={game.data} recording={recording} />;
}

function ChangeMatch({ game, recording }: { game: PadelGame; recording: PadelRecording }) {
  const insets = useSafeAreaInsets();
  const updateRecording = useUpdatePadelRecording(game.id, recording.id);
  const [court, setCourt] = useState(recording.court);
  const [matchIndex, setMatchIndex] = useState(() =>
    Math.max(
      0,
      courtMatches(game, recording.court).findIndex(
        ({ match }) => match.id === recording.firstMatchId,
      ),
    ),
  );
  const matches = courtMatches(game, court);
  const chosen = matches[Math.min(matchIndex, matches.length - 1)];

  const save = () => {
    if (!chosen) return;
    updateRecording.mutate(
      { matchId: chosen.match.id },
      {
        onSuccess: () => {
          toast.success("Match changed");
          router.back();
        },
      },
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-sm text-muted-foreground">
        Choose the court and the match the video starts with. The rallies are
        placed in the matches again, and who won the rallies you labelled is kept
        for those matches.
      </Text>
      <MatchPicker
        game={game}
        court={court}
        matchIndex={matchIndex}
        onCourtChange={(c) => {
          setCourt(c);
          setMatchIndex(0);
        }}
        onMatchIndexChange={setMatchIndex}
      />
      <Button
        isLoading={updateRecording.isPending}
        disabled={!chosen || chosen.match.id === recording.firstMatchId}
        onPress={save}
      >
        Save
      </Button>
    </ScrollView>
  );
}
