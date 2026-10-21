import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, Moon, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { getErrorMessage } from "@/lib/api";
import {
  courtMatches,
  courtName,
  formatClock,
  isMatchDone,
  matchRoundLabel,
  teamNames,
} from "@/lib/padel";
import { usePadelGame } from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame, PadelTeamNumber } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MAX_APP_UPLOAD_BYTES, queueVideoUpload } from "@/lib/video-uploads";

// H.264 plays in every browser. At this bitrate an hour of 1080p video is
// about 2.2 GB.
const VIDEO_BITRATE = 5_000_000;
const MAX_DURATION_SECONDS = 3 * 60 * 60;

export default function RecordScreen() {
  const { gameId, matchId } = useLocalSearchParams<{
    gameId: string;
    matchId?: string;
  }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1 bg-black" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <Recorder game={data} initialMatchId={matchId} />;
}

/** The first match on the court still to be played, or the last one */
const defaultMatchIndex = (game: PadelGame, court: number) => {
  const matches = courtMatches(game, court);
  const index = matches.findIndex(({ match }) => !isMatchDone(match));
  return index === -1 ? Math.max(0, matches.length - 1) : index;
};

function Recorder({
  game,
  initialMatchId,
}: {
  game: PadelGame;
  initialMatchId?: string;
}) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const camera = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const initialMatch = game.rounds
    .flatMap((round) => round.matches)
    .find((match) => match.id === initialMatchId);
  const [court, setCourt] = useState(initialMatch?.court ?? 1);
  const matches = courtMatches(game, court);
  const [matchIndex, setMatchIndex] = useState(() => {
    const index = matches.findIndex(({ match }) => match.id === initialMatchId);
    return index === -1 ? defaultMatchIndex(game, court) : index;
  });
  const current = matches[Math.min(matchIndex, matches.length - 1)];
  const [nearTeam, setNearTeam] = useState<PadelTeamNumber | null>(null);

  const [lenses, setLenses] = useState<string[]>([]);
  const ultraWide = lenses.find((lens) => /ultra wide/i.test(lens));
  const [isWide, setIsWide] = useState(true);

  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const stopRequested = useRef(false);

  useEffect(() => {
    if (!cameraPermission?.granted && cameraPermission?.canAskAgain !== false) {
      void requestCameraPermission();
    }
  }, [cameraPermission, requestCameraPermission]);
  useEffect(() => {
    if (
      !microphonePermission?.granted &&
      microphonePermission?.canAskAgain !== false
    ) {
      void requestMicrophonePermission();
    }
  }, [microphonePermission, requestMicrophonePermission]);

  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const chooseCourt = (next: number) => {
    setCourt(next);
    setMatchIndex(defaultMatchIndex(game, next));
    setNearTeam(null);
  };

  const record = async () => {
    if (!camera.current || !current) return;
    const firstMatch = current.match;
    const team = nearTeam ?? undefined;
    const start = new Date();
    stopRequested.current = false;
    setStartedAt(start);
    setNow(start.getTime());
    try {
      const video = await camera.current.recordAsync({
        codec: "avc1",
        maxFileSize: MAX_APP_UPLOAD_BYTES,
        maxDuration: MAX_DURATION_SECONDS,
      });
      if (!video?.uri) throw new Error("Nothing was filmed");
      setIsSaving(true);
      await queueVideoUpload({
        uri: video.uri,
        gameId: game.id,
        matchId: firstMatch.id,
        recordedAt: start,
        duration: (Date.now() - start.getTime()) / 1000,
        nearTeam: team,
      });
      toast.success(
        stopRequested.current
          ? "Video saved. It uploads in the background."
          : "Filming stopped, the video was saved. It uploads in the background.",
      );
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setStartedAt(null);
      setIsSaving(false);
    }
  };

  const stop = () => {
    stopRequested.current = true;
    camera.current?.stopRecording();
  };

  const close = () => {
    if (!startedAt) {
      router.back();
      return;
    }
    Alert.alert("Stop filming?", "The video so far is saved and uploaded.", [
      { text: "Keep filming", style: "cancel" },
      { text: "Stop", onPress: stop },
    ]);
  };

  if (!cameraPermission || !microphonePermission) {
    return <Spinner className="flex-1 bg-black" />;
  }
  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-background px-8"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-center text-lg font-semibold">
          Bragster needs the camera and microphone
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          The sound of the ball helps find the rallies in the video.
        </Text>
        <Button onPress={() => void Linking.openSettings()}>Open Settings</Button>
        <Button variant="ghost" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    );
  }

  const isRecording = startedAt !== null;
  const elapsed = startedAt ? (now - startedAt.getTime()) / 1000 : 0;

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={camera}
        style={{ flex: 1 }}
        facing="back"
        mode="video"
        videoQuality="1080p"
        videoBitrate={VIDEO_BITRATE}
        selectedLens={isWide && ultraWide ? ultraWide : undefined}
        onAvailableLensesChanged={({ lenses: available }) => setLenses(available)}
      />

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isRecording ? "Stop and close" : "Close"}
          onPress={close}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-60"
        >
          <Icon as={X} size={22} className="text-white" />
        </Pressable>
        {isRecording ? (
          <View className="flex-row items-center gap-2 rounded-full bg-black/50 px-3 py-1.5">
            <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <Text className="font-medium text-white" style={{ fontVariant: ["tabular-nums"] }}>
              {formatClock(elapsed)}
            </Text>
          </View>
        ) : (
          ultraWide && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isWide ? "Use the normal lens" : "Use the wide lens"}
              onPress={() => setIsWide((wide) => !wide)}
              className="h-10 min-w-10 items-center justify-center rounded-full bg-black/50 px-3 active:opacity-60"
            >
              <Text className="text-sm font-semibold text-amber-300">
                {isWide ? "0.5×" : "1×"}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 gap-4 bg-black/70 px-5 pt-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {!isRecording && game.courts > 1 && (
          <View className="flex-row flex-wrap gap-2">
            {Array.from({ length: game.courts }, (_, i) => i + 1).map((c) => (
              <DarkChip
                key={c}
                label={courtName(game.courtNames, c)}
                selected={c === court}
                onPress={() => chooseCourt(c)}
              />
            ))}
          </View>
        )}

        {current && (
          <View className="flex-row items-center gap-2">
            {!isRecording && (
              <StepButton
                icon={ChevronLeft}
                label="Earlier match"
                disabled={matchIndex === 0}
                onPress={() => {
                  setMatchIndex((index) => index - 1);
                  setNearTeam(null);
                }}
              />
            )}
            <View className="flex-1 items-center">
              <Text className="text-xs text-white/60">
                {isRecording ? "Started with " : ""}
                {matchRoundLabel(current)} · {courtName(game.courtNames, court)}
              </Text>
              <Text className="text-center font-medium text-white" numberOfLines={2}>
                {teamNames(current.match.team1, game.players)} vs{" "}
                {teamNames(current.match.team2, game.players)}
              </Text>
            </View>
            {!isRecording && (
              <StepButton
                icon={ChevronRight}
                label="Later match"
                disabled={matchIndex >= matches.length - 1}
                onPress={() => {
                  setMatchIndex((index) => index + 1);
                  setNearTeam(null);
                }}
              />
            )}
          </View>
        )}

        {!isRecording && current && (
          <View className="gap-2">
            <Text className="text-xs text-white/60">
              Nearest the camera (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {([1, 2] as const).map((team) => (
                <DarkChip
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

        <Text className="text-center text-xs text-white/60">
          {isRecording
            ? "Keep the app open while filming. Later matches on this court can be filmed in the same video."
            : "Put the phone behind the glass at one end, with the whole court in view."}
        </Text>

        <View className="flex-row items-center justify-center gap-8">
          {isRecording && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dim the screen"
              onPress={() => setIsDimmed(true)}
              className="h-12 w-12 items-center justify-center rounded-full bg-white/15 active:opacity-60"
            >
              <Icon as={Moon} size={20} className="text-white" />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRecording ? "Stop filming" : "Start filming"}
            disabled={isSaving || !current}
            onPress={isRecording ? stop : () => void record()}
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white active:opacity-70"
          >
            {isSaving ? (
              <Spinner />
            ) : (
              <View
                className={cn(
                  "bg-red-500",
                  isRecording ? "h-8 w-8 rounded-md" : "h-16 w-16 rounded-full",
                )}
              />
            )}
          </Pressable>
          {isRecording && <View className="h-12 w-12" />}
        </View>
      </View>

      {isDimmed && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Wake the screen"
          onPress={() => setIsDimmed(false)}
          className="absolute inset-0 items-center justify-center bg-black"
        >
          <Text className="text-sm text-white/30">
            Filming · {formatClock(elapsed)} · tap to wake
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function DarkChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "rounded-full border px-3 py-1.5 active:opacity-70",
        selected ? "border-white bg-white" : "border-white/40",
      )}
    >
      <Text className={cn("text-sm", selected ? "font-medium text-black" : "text-white")}>
        {label}
      </Text>
    </Pressable>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: typeof ChevronLeft;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={cn(
        "h-9 w-9 items-center justify-center rounded-full bg-white/15 active:opacity-60",
        disabled && "opacity-30",
      )}
    >
      <Icon as={icon} size={20} className="text-white" />
    </Pressable>
  );
}
