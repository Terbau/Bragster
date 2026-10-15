import { router } from "expo-router";
import {
  ChevronRight,
  CloudUpload,
  TriangleAlert,
  Upload,
  Video,
} from "lucide-react-native";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDateTime } from "@/lib/format";
import {
  courtName,
  formatFileSize,
  formatPlayTime,
  formatRallyLength,
  recordingRounds,
  recordingStatusText,
} from "@/lib/padel";
import type { PadelGame, PadelGameVideos } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  discardVideoUpload,
  processVideoUploads,
  type VideoUploadState,
} from "@/lib/video-uploads";

interface GameVideosProps {
  game: PadelGame;
  videos: PadelGameVideos;
  uploads: VideoUploadState[];
  onFilm: () => void;
  onUpload: () => void;
}

/** Videos of the game, and the ones still uploading from this phone */
export function GameVideos({ game, videos, uploads, onFilm, onUpload }: GameVideosProps) {
  const { colors } = useColors();
  const uploadingIds = new Set(uploads.map((upload) => upload.recordingId));
  const recordings = videos.recordings.filter(
    (recording) => !(recording.status === "UPLOADING" && uploadingIds.has(recording.id)),
  );
  const { stats } = videos;

  const discard = (upload: VideoUploadState) =>
    Alert.alert(
      "Delete video?",
      "The video hasn't been uploaded yet, and is deleted from this phone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void discardVideoUpload(upload.key),
        },
      ],
    );

  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        <Button icon={Video} variant="outline" className="flex-1" onPress={onFilm}>
          Film a match
        </Button>
        <Button icon={Upload} variant="outline" className="flex-1" onPress={onUpload}>
          Upload video
        </Button>
      </View>

      {uploads.map((upload) => (
        <View
          key={upload.key}
          className="gap-2 rounded-xl border border-border bg-card px-4 py-3"
        >
          <View className="flex-row items-center gap-3">
            <Icon
              as={upload.status === "failed" ? TriangleAlert : CloudUpload}
              size={18}
              className={upload.status === "failed" ? "text-destructive" : "text-foreground"}
            />
            <View className="flex-1">
              <Text className="text-sm font-medium">
                {upload.status === "failed"
                  ? "Upload failed"
                  : upload.status === "uploading"
                    ? `Uploading · ${Math.round(upload.progress * 100)}%`
                    : "Waiting to upload"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {formatDateTime(upload.recordedAt)} ·{" "}
                {formatPlayTime(upload.duration)} · {formatFileSize(upload.sizeBytes)}
              </Text>
            </View>
          </View>
          {upload.status === "uploading" && <Progress value={upload.progress * 100} />}
          {upload.status === "failed" && (
            <>
              {upload.error && (
                <Text className="text-xs text-muted-foreground">{upload.error}</Text>
              )}
              <View className="flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => void processVideoUploads()}
                >
                  Try again
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  textClassName="text-destructive"
                  onPress={() => discard(upload)}
                >
                  Delete
                </Button>
              </View>
            </>
          )}
          {upload.status !== "failed" && (
            <Text className="text-xs text-muted-foreground">
              It goes on in the background. Wi-Fi is quickest.
            </Text>
          )}
        </View>
      ))}

      {stats.rallies > 0 && (
        <View className="flex-row flex-wrap gap-3">
          <Tile label="Rallies filmed" value={String(stats.rallies)} />
          <Tile label="Ball in play" value={formatPlayTime(stats.playTime)} />
          <Tile label="Average rally" value={formatRallyLength(stats.averageRally)} />
          <Tile
            label="Longest rally"
            value={
              stats.longestRally ? formatRallyLength(stats.longestRally.duration) : "–"
            }
          />
        </View>
      )}

      {recordings.length > 0 && (
        <View className="overflow-hidden rounded-xl border border-border bg-card">
          {recordings.map((recording, index) => {
            const rounds = recordingRounds(recording);
            const isBusy =
              recording.status !== "READY" && recording.status !== "FAILED";
            return (
              <Pressable
                key={recording.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/padel/[gameId]/videos/[recordingId]",
                    params: { gameId: game.id, recordingId: recording.id },
                  })
                }
                className={cn(
                  "flex-row items-center gap-3 px-4 py-3 active:bg-accent",
                  index > 0 && "border-t border-border",
                )}
              >
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {isBusy ? (
                    <ActivityIndicator size="small" color={colors.mutedForeground} />
                  ) : (
                    <Icon
                      as={recording.status === "FAILED" ? TriangleAlert : Video}
                      size={18}
                      className={
                        recording.status === "FAILED" ? "text-destructive" : "text-foreground"
                      }
                    />
                  )}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {courtName(game.courtNames, recording.court)}
                    {rounds ? ` · ${rounds}` : ""}
                  </Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {formatDateTime(recording.recordedAt)}
                    {recording.duration !== null
                      ? ` · ${formatPlayTime(recording.duration)}`
                      : ""}{" "}
                    · {recordingStatusText(recording)}
                  </Text>
                </View>
                <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
              </Pressable>
            );
          })}
        </View>
      )}

      {recordings.length === 0 && uploads.length === 0 && (
        <Text className="text-center text-sm text-muted-foreground">
          Film a match with a phone at one end of the court, or upload a video you
          have filmed. The rallies are found in the video, so every point can be
          watched again.
        </Text>
      )}
    </View>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1 rounded-xl border border-border bg-card px-4 py-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-xl font-semibold">{value}</Text>
    </View>
  );
}
