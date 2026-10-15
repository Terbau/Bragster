import { useEventListener } from "expo";
import { router, Stack } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Check, Ellipsis, ListVideo, Play, SkipForward } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { formatDateTime } from "@/lib/format";
import {
  courtName,
  formatClock,
  formatPlayTime,
  formatRallyLength,
  LONG_RALLY_SECONDS,
  matchRoundLabel,
  recordingRounds,
  recordingStatusText,
  teamNames,
} from "@/lib/padel";
import {
  useAnalyzePadelRecording,
  useDeletePadelRecording,
  useUpdatePadelRally,
  useUpdatePadelRecording,
} from "@/lib/queries";
import type {
  PadelGame,
  PadelRecording,
  PadelTeamNumber,
  PadelVideoMatch,
  PadelVideoRally,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Chip } from "./Chip";

type Filter = "all" | "team1" | "team2" | "unsure" | "long";

interface Action {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const showActions = (title: string, actions: Action[]) => {
  if (Platform.OS === "ios") {
    const destructive = actions.findIndex((action) => action.isDestructive);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...actions.map((action) => action.label), "Cancel"],
        destructiveButtonIndex: destructive === -1 ? undefined : destructive,
        cancelButtonIndex: actions.length,
      },
      (index) => actions[index]?.onPress(),
    );
  } else {
    Alert.alert(title, undefined, [
      ...actions.map((action) => ({ text: action.label, onPress: action.onPress })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  }
};

const tabular = { fontVariant: ["tabular-nums" as const] };

interface VideoViewerProps {
  game: PadelGame;
  recording: PadelRecording;
  initialRallyId?: string;
}

export function VideoViewer({ game, recording, initialRallyId }: VideoViewerProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const updateRecording = useUpdatePadelRecording(game.id, recording.id);
  const updateRally = useUpdatePadelRally(game.id, recording.id);
  const analyze = useAnalyzePadelRecording(game.id, recording.id);
  const deleteRecording = useDeletePadelRecording(game.id, recording.id);
  const isSaving = updateRally.isPending || updateRecording.isPending;
  const names = (ids: string[]) => teamNames(ids, game.players);

  // A new link would load the video again, so the first one is kept
  const [videoUrl, setVideoUrl] = useState(recording.videoUrl);
  useEffect(() => {
    if (!videoUrl && recording.videoUrl) setVideoUrl(recording.videoUrl);
  }, [recording.videoUrl, videoUrl]);
  const player = useVideoPlayer(videoUrl, (newPlayer) => {
    newPlayer.timeUpdateEventInterval = 0.25;
  });

  const [matchId, setMatchId] = useState(
    () =>
      (
        recording.matches.find((m) => m.rallies.some((r) => r.id === initialRallyId)) ??
        recording.matches[0]
      )?.matchId,
  );
  const match =
    recording.matches.find((m) => m.matchId === matchId) ?? recording.matches[0] ?? null;
  const rallies = match ? match.rallies : recording.unplaced;

  const [filter, setFilter] = useState<Filter>("all");
  const visible = rallies.filter((rally) => {
    switch (filter) {
      case "team1":
        return rally.winnerTeam === 1;
      case "team2":
        return rally.winnerTeam === 2;
      case "unsure":
        return !rally.isIgnored && rally.winnerTeam === null;
      case "long":
        return !rally.isIgnored && rally.duration >= LONG_RALLY_SECONDS;
      default:
        return true;
    }
  });
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const clip = useRef<{ id: string; start: number; end: number; playAll: boolean } | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(0);

  const playRally = (rally: PadelVideoRally, playAll = false) => {
    player.currentTime = rally.start;
    player.play();
    clip.current = { id: rally.id, start: rally.start, end: rally.end, playAll };
  };

  useEventListener(player, "timeUpdate", ({ currentTime: time }) => {
    setCurrentTime(time);
    const playing = clip.current;
    if (!playing) return;
    if (time < playing.start - 1) {
      // Jumped back elsewhere in the video
      clip.current = null;
    } else if (time >= playing.end) {
      const list = visibleRef.current;
      const next = playing.playAll
        ? list[list.findIndex((r) => r.id === playing.id) + 1]
        : undefined;
      if (next) {
        playRally(next, true);
      } else {
        player.pause();
        clip.current = null;
      }
    }
  });

  // A link to a rally starts there
  const startedAtRally = useRef(false);
  useEventListener(player, "statusChange", ({ status }) => {
    if (status !== "readyToPlay" || startedAtRally.current || !initialRallyId) return;
    startedAtRally.current = true;
    const rally = rallies.find((r) => r.id === initialRallyId);
    if (rally) player.currentTime = rally.start;
  });

  const currentRally = rallies.find(
    (rally) => currentTime >= rally.start && currentTime < rally.end,
  );

  const setWinner = (rally: PadelVideoRally, team: PadelTeamNumber | null) => {
    if (!match) return;
    updateRally.mutate({
      rallyId: rally.id,
      winner: team ? { matchId: match.matchId, team } : null,
    });
  };
  const setIgnored = (rally: PadelVideoRally, isIgnored: boolean) =>
    updateRally.mutate({ rallyId: rally.id, isIgnored });

  const rallyActions = (rally: PadelVideoRally) =>
    showActions(
      rally.isIgnored ? "Not a point" : `Rally ${rally.number}`,
      [
        ...(match && !rally.isIgnored
          ? [
              { label: `${names(match.team1)} won`, onPress: () => setWinner(rally, 1) },
              { label: `${names(match.team2)} won`, onPress: () => setWinner(rally, 2) },
              ...(rally.winnerSource === "manual"
                ? [{ label: "Not sure who won", onPress: () => setWinner(rally, null) }]
                : []),
            ]
          : []),
        {
          label: rally.isIgnored ? "It was a point" : "Not a point",
          onPress: () => setIgnored(rally, !rally.isIgnored),
        },
      ],
    );

  const chooseMatchCount = () =>
    showActions("Matches in the video", [
      ...Array.from({ length: recording.maxMatchCount }, (_, i) => i + 1).map((count) => ({
        label: `${count} ${count === 1 ? "match" : "matches"}${
          !recording.isMatchCountGuess && recording.matchCount === count ? " ✓" : ""
        }`,
        onPress: () => updateRecording.mutate({ matchCount: count }),
      })),
      {
        label: `Guess from the rallies${
          recording.isMatchCountGuess ? ` (${recording.matchCount}) ✓` : ""
        }`,
        onPress: () => updateRecording.mutate({ matchCount: null }),
      },
    ]);

  const confirmDelete = () =>
    Alert.alert(
      "Delete video?",
      "The video and its rallies are deleted. The scores of the game stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRecording.mutate(undefined, { onSuccess: () => router.back() }),
        },
      ],
    );

  const changeMatch = () =>
    router.push({
      pathname: "/padel/[gameId]/videos/[recordingId]/match",
      params: { gameId: game.id, recordingId: recording.id },
    });

  const openMenu = () =>
    showActions("Video", [
      { label: "Change match", onPress: changeMatch },
      ...(recording.maxMatchCount > 1
        ? [{ label: "Matches in the video", onPress: chooseMatchCount }]
        : []),
      ...(recording.status !== "UPLOADING"
        ? [{ label: "Find the rallies again", onPress: () => analyze.mutate() }]
        : []),
      { label: "Delete video", onPress: confirmDelete, isDestructive: true },
    ]);

  // Going through the rallies where it isn't known who won
  const [isReviewing, setIsReviewing] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const toReview = rallies.filter(
    (rally) => !rally.isIgnored && rally.winnerTeam === null && !skipped.includes(rally.id),
  );
  const reviewing = isReviewing ? toReview[0] : undefined;
  // Each new rally to go through is played once
  const reviewingId = reviewing?.id;
  const playReviewing = useRef(() => {});
  playReviewing.current = () => {
    if (reviewing) playRally(reviewing);
  };
  useEffect(() => {
    if (reviewingId) playReviewing.current();
  }, [reviewingId]);

  const rounds = recordingRounds(recording);
  const isBusy = recording.status !== "READY" && recording.status !== "FAILED";

  return (
    <>
      <Stack.Screen
        options={{
          title: courtName(game.courtNames, recording.court),
          headerRight: () => (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="More"
              onPress={openMenu}
              className="active:opacity-50"
            >
              <Icon as={Ellipsis} size={22} />
            </Pressable>
          ),
        }}
      />
      <View className="bg-black" style={{ height: Math.round(screenHeight * 0.42) }}>
        {videoUrl ? (
          <VideoView
            player={player}
            style={{ flex: 1 }}
            contentFit="contain"
            nativeControls
          />
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-sm text-white/70">
              The video shows up here when it has been uploaded.
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-4 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Text className="text-sm text-muted-foreground">
          {rounds ? `${rounds} · ` : ""}
          {formatDateTime(recording.recordedAt)}
          {recording.duration !== null ? ` · ${formatPlayTime(recording.duration)}` : ""} ·{" "}
          {recordingStatusText(recording)}
        </Text>

        {isBusy && (
          <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Spinner size="small" />
            <Text className="flex-1 text-sm">
              {recording.status === "UPLOADING"
                ? "The video is still uploading from the phone or browser it was added on."
                : recording.status === "UPLOADED"
                  ? "Waiting to be analysed. The rallies usually show up within a few minutes."
                  : "Finding the rallies. This takes a few minutes for a long video."}
            </Text>
          </View>
        )}
        {recording.status === "FAILED" && (
          <View className="gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
            <Text className="text-sm">
              {`The rallies couldn't be found${recording.error ? `: ${recording.error}` : "."}`}
            </Text>
            <Button
              size="sm"
              variant="outline"
              isLoading={analyze.isPending}
              onPress={() => analyze.mutate()}
            >
              Try again
            </Button>
          </View>
        )}

        {reviewing && match ? (
          <View className="gap-3 rounded-2xl border border-foreground/30 bg-card p-4 shadow-sm shadow-black/5">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-semibold">Who won rally {reviewing.number}?</Text>
              <Text className="text-xs text-muted-foreground">{toReview.length} left</Text>
            </View>
            <View className="flex-row gap-2">
              {([1, 2] as const).map((team) => (
                <Button
                  key={team}
                  variant="outline"
                  className="h-auto flex-1 py-2.5"
                  disabled={isSaving}
                  onPress={() => setWinner(reviewing, team)}
                >
                  {names(team === 1 ? match.team1 : match.team2)}
                </Button>
              ))}
            </View>
            <View className="flex-row flex-wrap gap-1">
              <Button size="sm" variant="ghost" icon={Play} onPress={() => playRally(reviewing)}>
                Again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isSaving}
                onPress={() => setIgnored(reviewing, true)}
              >
                Not a point
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={SkipForward}
                onPress={() => setSkipped((ids) => [...ids, reviewing.id])}
              >
                Skip
              </Button>
              <Button size="sm" variant="ghost" onPress={() => setIsReviewing(false)}>
                Done
              </Button>
            </View>
          </View>
        ) : (
          isReviewing && (
            <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Icon as={Check} size={18} className="text-green-600" />
              <Text className="flex-1 text-sm">
                {skipped.length > 0
                  ? "You've been through every rally."
                  : "It's known who won every rally."}
              </Text>
              <Button size="sm" variant="outline" onPress={() => setIsReviewing(false)}>
                Done
              </Button>
            </View>
          )
        )}

        {recording.matches.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {recording.matches.map((m) => (
                <Chip
                  key={m.matchId}
                  label={matchRoundLabel(m)}
                  selected={m.matchId === match?.matchId}
                  onPress={() => {
                    setMatchId(m.matchId);
                    setIsReviewing(false);
                  }}
                />
              ))}
            </View>
          </ScrollView>
        )}

        {match && (
          <MatchCard
            match={match}
            names={names}
            isSaving={isSaving}
            onNearTeam={(team) =>
              updateRecording.mutate({ nearTeam: { matchId: match.matchId, team } })
            }
            onReview={() => {
              setSkipped([]);
              setIsReviewing(true);
            }}
          />
        )}
        {!match && recording.status === "READY" && (
          <View className="gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Text className="text-sm text-muted-foreground">
              The match this video started with is no longer in the game.
            </Text>
            <Button size="sm" variant="outline" onPress={changeMatch}>
              Choose the match
            </Button>
          </View>
        )}

        {rallies.length > 0 && (
          <View className="gap-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {(
                  [
                    ["all", "All"],
                    ...(match
                      ? ([
                          ["team1", `${names(match.team1)} won`],
                          ["team2", `${names(match.team2)} won`],
                        ] as const)
                      : []),
                    ["unsure", "Not sure"],
                    ["long", "Long"],
                  ] as const
                ).map(([value, label]) => (
                  <Chip
                    key={value}
                    label={label}
                    selected={filter === value}
                    onPress={() => setFilter(value)}
                  />
                ))}
              </View>
            </ScrollView>

            {visible.length > 0 && videoUrl && (
              <Button
                variant="outline"
                size="sm"
                icon={ListVideo}
                onPress={() => playRally(visible[0], true)}
              >
                Play {filter === "all" ? "all rallies" : "these rallies"}
              </Button>
            )}

            {visible.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                No rallies here.
              </Text>
            ) : (
              <View className="overflow-hidden rounded-xl border border-border bg-card">
                {visible.map((rally, index) => (
                  <RallyRow
                    key={rally.id}
                    rally={rally}
                    match={match}
                    names={names}
                    isFirst={index === 0}
                    isCurrent={rally.id === currentRally?.id}
                    canPlay={Boolean(videoUrl)}
                    onPlay={() => playRally(rally)}
                    onMore={() => rallyActions(rally)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function MatchCard({
  match,
  names,
  isSaving,
  onNearTeam,
  onReview,
}: {
  match: PadelVideoMatch;
  names: (ids: string[]) => string;
  isSaving: boolean;
  onNearTeam: (team: PadelTeamNumber | null) => void;
  onReview: () => void;
}) {
  const { stats } = match;
  const hasScore = match.team1Score !== null && match.team2Score !== null;
  const points = (match.team1Score ?? 0) + (match.team2Score ?? 0);
  const unsure = stats.rallies - stats.decided;
  const nearChoice: "1" | "2" | "guess" = match.isNearTeamGuess
    ? "guess"
    : match.nearTeam === 1
      ? "1"
      : "2";

  return (
    <View className="gap-4 rounded-2xl border border-border bg-card p-4">
      <View className="gap-1">
        <Text className="text-xs text-muted-foreground">{matchRoundLabel(match)}</Text>
        <View className="flex-row items-center gap-3">
          <Text className="flex-1 text-right text-sm font-medium">{names(match.team1)}</Text>
          <Text className="rounded-md bg-muted px-2 py-1 font-semibold" style={tabular}>
            {hasScore ? `${match.team1Score} – ${match.team2Score}` : "–"}
          </Text>
          <Text className="flex-1 text-sm font-medium">{names(match.team2)}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <SmallStat label="Rallies" value={String(stats.rallies)} />
        <SmallStat label="In play" value={formatPlayTime(stats.playTime)} />
        <SmallStat
          label="Average"
          value={stats.rallies ? formatRallyLength(stats.averageRally) : "–"}
        />
        <SmallStat
          label="Longest"
          value={stats.longestRally ? formatRallyLength(stats.longestRally.duration) : "–"}
        />
      </View>

      {hasScore && stats.rallies > 0 && stats.rallies !== points && (
        <Text className="text-xs text-muted-foreground">
          {stats.rallies} rallies were found for {points} points.{" "}
          {stats.rallies > points
            ? "Mark the ones that weren't points, like the warm up."
            : "The video may not have the whole match, or some points weren't found."}
        </Text>
      )}

      <View className="gap-1.5">
        <Text className="text-xs text-muted-foreground">Nearest the camera</Text>
        <SegmentedControl
          value={nearChoice}
          onChange={(value) =>
            !isSaving && onNearTeam(value === "guess" ? null : value === "1" ? 1 : 2)
          }
          options={[
            { value: "1", label: names(match.team1) },
            { value: "2", label: names(match.team2) },
            { value: "guess", label: "Guess" },
          ]}
        />
        {match.isNearTeamGuess && (
          <Text className="text-xs text-muted-foreground">
            {match.nearTeam
              ? `Guessed: ${names(match.nearTeam === 1 ? match.team1 : match.team2)}`
              : "Not enough to go on yet. Choose the team, or say who won a few rallies."}
          </Text>
        )}
      </View>

      {stats.rallies > 0 && (
        <View className="gap-2">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-sm">Who won</Text>
            <Text className="text-xs text-muted-foreground">
              Known for {stats.decided} of {stats.rallies}
            </Text>
          </View>
          <Progress value={(stats.decided / stats.rallies) * 100} />
          {stats.decided > 0 && (
            <Text className="text-xs text-muted-foreground">
              {names(match.team1)} won {stats.team1.won}, {names(match.team2)} won{" "}
              {stats.team2.won}
            </Text>
          )}
          {unsure > 0 && (
            <Button variant="outline" size="sm" onPress={onReview}>
              {`Go through the ${unsure} ${unsure === 1 ? "rally" : "rallies"} where it's not sure`}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-lg bg-muted/60 px-1 py-2">
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold">{value}</Text>
    </View>
  );
}

function RallyRow({
  rally,
  match,
  names,
  isFirst,
  isCurrent,
  canPlay,
  onPlay,
  onMore,
}: {
  rally: PadelVideoRally;
  match: PadelVideoMatch | null;
  names: (ids: string[]) => string;
  isFirst: boolean;
  isCurrent: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onMore: () => void;
}) {
  const winnerNames =
    match && rally.winnerTeam
      ? names(rally.winnerTeam === 1 ? match.team1 : match.team2)
      : null;

  return (
    <View
      className={cn(
        "flex-row items-center",
        !isFirst && "border-t border-border",
        isCurrent && "bg-accent",
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play rally ${rally.number}`}
        disabled={!canPlay}
        onPress={onPlay}
        onLongPress={onMore}
        className="flex-1 flex-row items-center gap-3 py-2.5 pl-4 active:bg-accent"
      >
        <Text className="w-6 text-xs text-muted-foreground" style={tabular}>
          {rally.isIgnored ? "–" : rally.number}
        </Text>
        <Text className="w-14 text-sm" style={tabular}>
          {formatClock(rally.start)}
        </Text>
        <Text className="w-10 text-xs text-muted-foreground" style={tabular}>
          {formatRallyLength(rally.duration)}
        </Text>
        <View className="min-w-0 flex-1 flex-row">
          {rally.isIgnored ? (
            <Text className="text-xs text-muted-foreground line-through">Not a point</Text>
          ) : winnerNames ? (
            <View
              className={cn(
                "flex-row items-center gap-1 rounded-full px-2 py-0.5",
                rally.winnerSource === "manual"
                  ? "bg-foreground"
                  : "border border-dashed border-foreground/40",
              )}
            >
              {rally.winnerSource === "manual" && (
                <Icon as={Check} size={12} className="text-background" />
              )}
              <Text
                numberOfLines={1}
                className={cn(
                  "text-xs",
                  rally.winnerSource === "manual" && "text-background",
                )}
              >
                {winnerNames}
              </Text>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground">Not sure</Text>
          )}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Change rally ${rally.number}`}
        onPress={onMore}
        hitSlop={6}
        className="px-4 py-2.5 active:opacity-50"
      >
        <Icon as={Ellipsis} size={18} className="text-muted-foreground" />
      </Pressable>
    </View>
  );
}
