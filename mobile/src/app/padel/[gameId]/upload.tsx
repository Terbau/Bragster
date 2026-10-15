import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { FileVideo } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Chip } from "@/components/padel/Chip";
import { MatchPicker } from "@/components/padel/MatchPicker";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import { courtMatches, formatFileSize, formatPlayTime, teamNames } from "@/lib/padel";
import { usePadelGame } from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame, PadelTeamNumber } from "@/lib/types";
import { MAX_APP_UPLOAD_BYTES, queueVideoUpload } from "@/lib/video-uploads";

export default function UploadVideoScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <UploadVideo game={data} />;
}

interface PickedVideo {
  uri: string;
  /** Seconds */
  duration: number;
  size: number;
}

function UploadVideo({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const [video, setVideo] = useState<PickedVideo | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [court, setCourt] = useState(1);
  const [matchIndex, setMatchIndex] = useState(0);
  const [nearTeam, setNearTeam] = useState<PadelTeamNumber | null>(null);
  const matches = courtMatches(game, court);
  const current = matches[Math.min(matchIndex, matches.length - 1)];
  const isTooBig = video !== null && video.size > MAX_APP_UPLOAD_BYTES;

  // The picker copies the video, and the copy is deleted unless it's uploaded
  const unused = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (unused.current) {
        void FileSystem.deleteAsync(unused.current, { idempotent: true });
      }
    },
    [],
  );

  const pick = async () => {
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        // Uploads the video as it is, without converting it first
        preferredAssetRepresentationMode:
          ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
        videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
      });
      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (unused.current) {
        void FileSystem.deleteAsync(unused.current, { idempotent: true });
      }
      unused.current = asset.uri;
      setVideo({
        uri: asset.uri,
        duration: (asset.duration ?? 0) / 1000,
        size: asset.fileSize ?? (info.exists ? info.size : 0),
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsPicking(false);
    }
  };

  const upload = async () => {
    if (!video || !current) return;
    setIsSaving(true);
    try {
      await queueVideoUpload({
        uri: video.uri,
        gameId: game.id,
        matchId: current.match.id,
        recordedAt: new Date(),
        duration: video.duration,
        nearTeam: nearTeam ?? undefined,
      });
      unused.current = null;
      toast.success("The video uploads in the background");
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-5"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-sm text-muted-foreground">
        A video of one court, filmed from behind the glass at one end. It can go
        on with the next matches on the court.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={isPicking || isSaving}
        onPress={() => void pick()}
        className="flex-row items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4 active:bg-accent"
      >
        {isPicking ? <Spinner /> : <Icon as={FileVideo} size={24} className="text-muted-foreground" />}
        <View className="flex-1">
          <Text className="font-medium">
            {isPicking
              ? "Getting the video ready…"
              : video
                ? "Video chosen"
                : "Choose a video"}
          </Text>
          {video && !isPicking && (
            <Text className="text-xs text-muted-foreground">
              {formatPlayTime(video.duration)} · {formatFileSize(video.size)} · Choose
              another
            </Text>
          )}
        </View>
      </Pressable>

      {isTooBig && video && (
        <Text className="text-sm text-destructive">
          {`This video is ${formatFileSize(video.size)}. The app can upload videos up to ${formatFileSize(MAX_APP_UPLOAD_BYTES)}, so upload it on the website instead.`}
        </Text>
      )}

      <MatchPicker
        game={game}
        court={court}
        matchIndex={matchIndex}
        onCourtChange={(c) => {
          setCourt(c);
          setMatchIndex(0);
          setNearTeam(null);
        }}
        onMatchIndexChange={(index) => {
          setMatchIndex(index);
          setNearTeam(null);
        }}
      />

      {current && (
        <View className="gap-2">
          <Text className="text-sm font-medium">
            Nearest the camera{" "}
            <Text className="text-sm text-muted-foreground">(optional)</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {([1, 2] as const).map((team) => (
              <Chip
                key={team}
                label={teamNames(
                  team === 1 ? current.match.team1 : current.match.team2,
                  game.players,
                )}
                selected={nearTeam === team}
                onPress={() => setNearTeam(nearTeam === team ? null : team)}
              />
            ))}
          </View>
        </View>
      )}

      <Button
        isLoading={isSaving}
        disabled={!video || isTooBig || !current || isPicking}
        onPress={() => void upload()}
      >
        Upload
      </Button>
      <Text className="text-center text-xs text-muted-foreground">
        The video uploads in the background. Wi-Fi is quickest.
      </Text>
    </ScrollView>
  );
}

