import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  Plus,
  Repeat,
  Share as ShareIcon,
  Shuffle,
  Trash2,
  Trophy,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { GameVideos } from "@/components/padel/GameVideos";
import { Leaderboard } from "@/components/padel/Leaderboard";
import { RoundCard } from "@/components/padel/RoundCard";
import { ScoreSheet } from "@/components/padel/ScoreSheet";
import { UpNextCard } from "@/components/padel/UpNextCard";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  courtName,
  formatLabel,
  getCurrentSeries,
  getGameStatus,
  getPadelProgress,
  getPadelStandings,
  getSeriesNumbers,
  playerKey,
} from "@/lib/padel";
import {
  useAddPadelSeries,
  useDeletePadelGame,
  useEndPadelRound,
  useEndPadelSeries,
  usePadelGame,
  usePadelGameVideos,
  useUpdatePadelGame,
  useUpdatePadelScore,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame, PadelMatch, PadelRound } from "@/lib/types";
import { useVideoUploads } from "@/lib/video-uploads";

type Score = { team1Score: number | null; team2Score: number | null };

export default function PadelGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <GameView key={data.id} game={data} />;
}

function GameView({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const updateScore = useUpdatePadelScore(game.id);
  const deleteGame = useDeletePadelGame(game.id);
  const addSeries = useAddPadelSeries(game.id);
  const updateGame = useUpdatePadelGame(game.id);
  const endRound = useEndPadelRound(game.id);
  const endSeries = useEndPadelSeries(game.id);
  const status = getGameStatus(game);
  const isMexicano = game.format === "MEXICANO";
  const seriesNumbers = getSeriesNumbers(game.rounds);
  const current = getCurrentSeries(game.rounds);
  const { currentRoundIndex } = getPadelProgress(current.rounds);
  // Mexicano rounds are drawn one at a time
  const roundsToDraw = status.totalRounds - current.rounds.length;
  // Finished series are folded away until opened
  const [openSeries, setOpenSeries] = useState<number[]>([]);
  const [view, setView] = useState<"rounds" | "standings" | "videos">(
    status.isFinished ? "standings" : "rounds",
  );
  const videos = usePadelGameVideos(game.id);
  const uploads = useVideoUploads(game.id);
  const isVideoEnabled = videos.data?.isEnabled ?? false;
  const hasVideos =
    (videos.data?.recordings.length ?? 0) > 0 || uploads.length > 0;

  // Show the video that was just filmed
  const uploadCount = useRef(uploads.length);
  useEffect(() => {
    if (uploads.length > uploadCount.current) setView("videos");
    uploadCount.current = uploads.length;
  }, [uploads.length]);
  const [scoring, setScoring] = useState<{
    match: PadelMatch;
    roundNumber: number;
  } | null>(null);

  const winner = status.isFinished
    ? getPadelStandings(game.players, game.rounds)[0]
    : undefined;

  const openRecorder = () =>
    router.push({ pathname: "/padel/[gameId]/record", params: { gameId: game.id } });
  const openUpload = () =>
    router.push({ pathname: "/padel/[gameId]/upload", params: { gameId: game.id } });

  const openScreen = (screen: "edit" | "order" | "share") => {
    const params = { gameId: game.id };
    if (screen === "edit") {
      router.push({ pathname: "/padel/[gameId]/edit", params });
    } else if (screen === "order") {
      router.push({ pathname: "/padel/[gameId]/order", params });
    } else {
      router.push({ pathname: "/padel/[gameId]/share", params });
    }
  };

  const saveScore = (match: PadelMatch, score: Score) => {
    const previous = {
      team1Score: match.team1Score,
      team2Score: match.team2Score,
    };
    updateScore.mutate({ matchId: match.id, ...score });
    toast.success(
      score.team1Score === null
        ? "Score cleared"
        : `Score saved: ${score.team1Score}–${score.team2Score}`,
      {
        action: {
          label: "Undo",
          onClick: () => updateScore.mutate({ matchId: match.id, ...previous }),
        },
      },
    );
  };

  const confirmDelete = () =>
    Alert.alert(
      "Delete game?",
      `${game.name} and all its scores will be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteGame.mutate(undefined, { onSuccess: () => router.back() }),
        },
      ],
    );

  const confirmEndRound = (round: PadelRound, roundNumber: number) =>
    Alert.alert(
      `End round ${roundNumber}?`,
      "Matches without a score won't be played. Their players get their average points per match for them, so nobody falls behind. You can still enter a score for them later.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End round", onPress: () => endRound.mutate(round.id) },
      ],
    );

  const confirmEndSeries = () =>
    Alert.alert(
      isMexicano ? "End the game now?" : "End the series now?",
      `Rounds that haven't started are removed, and matches without a score won't be played. Players who end up with fewer matches than the others get their average points per match for each missing one. ${
        isMexicano
          ? "You can still play more rounds afterwards."
          : "You can still play another series afterwards."
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isMexicano ? "End game" : "End series",
          style: "destructive",
          onPress: () =>
            endSeries.mutate(undefined, {
              onSuccess: () => setView("standings"),
            }),
        },
      ],
    );

  const playAgain = () =>
    router.push({ pathname: "/padel/new", params: { from: game.id } });

  const openMenu = () => {
    const actions = [
      ...(isVideoEnabled
        ? [
            { label: "Film a match", onPress: openRecorder },
            { label: "Upload a video", onPress: openUpload },
          ]
        : []),
      { label: "Edit game", onPress: () => openScreen("edit") },
      ...(!isMexicano && !status.isFinished
        ? [{ label: "Order of rounds", onPress: () => openScreen("order") }]
        : []),
      ...(!status.isFinished && status.matchesPlayed > 0
        ? [
            {
              label: isMexicano ? "End game early" : "End series early",
              onPress: confirmEndSeries,
            },
          ]
        : []),
      { label: "Play again", onPress: playAgain },
      { label: "Delete game", onPress: confirmDelete },
    ];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...actions.map((action) => action.label), "Cancel"],
          destructiveButtonIndex: actions.length - 1,
          cancelButtonIndex: actions.length,
        },
        (index) => actions[index]?.onPress(),
      );
    } else {
      Alert.alert(game.name, undefined, [
        ...actions.map((action) => ({
          text: action.label,
          onPress: action.onPress,
        })),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  // A new series of an Americano, or one more round of a Mexicano
  const playMore = () =>
    isMexicano
      ? updateGame.mutate(
          { plannedRounds: status.totalRounds + 1 },
          {
            onSuccess: () => {
              setView("rounds");
              toast.success("Round added");
            },
          },
        )
      : Alert.alert(
          "Play another series?",
          game.format === "ELO_AMERICANO"
            ? "Everyone partners with everyone once more, with new matchups from the latest ratings. The leaderboard keeps adding up the points."
            : "Everyone partners with everyone once more, with the same players in a new random order. The leaderboard keeps adding up the points.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Start",
              onPress: () =>
                addSeries.mutate(undefined, {
                  onSuccess: () => setView("rounds"),
                }),
            },
          ],
        );

  const roundCard = (
    round: PadelGame["rounds"][number],
    index: number,
    isCurrent: boolean,
  ) => (
    <RoundCard
      key={round.id}
      round={round}
      number={index + 1}
      isCurrent={isCurrent}
      players={game.players}
      courtNames={game.courtNames}
      onPressMatch={(match) => setScoring({ match, roundNumber: index + 1 })}
    />
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: game.name,
          headerRight: () => (
            <View className="flex-row items-center gap-5">
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Share"
                onPress={() => openScreen("share")}
                className="active:opacity-50"
              >
                <Icon as={ShareIcon} size={21} />
              </Pressable>
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="More"
                onPress={openMenu}
                className="active:opacity-50"
              >
                <Icon as={Ellipsis} size={22} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-5 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="gap-4">
          <Text className="text-sm text-muted-foreground">
            {formatLabel(game.format)} · {game.players.length} players ·{" "}
            {game.courts} {game.courts === 1 ? "court" : "courts"} ·{" "}
            {game.pointsPerMatch} points
          </Text>

          {winner ? (
            <View className="flex-row items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
              <Icon as={Trophy} size={24} className="text-amber-500" />
              <Text className="flex-1 text-sm">
                <Text className="text-sm font-semibold">{winner.name}</Text> won
                with {winner.total} points
                {status.seriesCount > 1 ? " in total" : ""}!
              </Text>
            </View>
          ) : (
            <View className="gap-1.5">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted-foreground">
                  {status.seriesCount > 1 && `Series ${status.series} · `}
                  Round {status.roundNumber} of {status.totalRounds}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {status.matchesPlayed} of {status.matchesTotal} matches
                  played
                </Text>
              </View>
              <Progress
                value={
                  (status.matchesPlayed / Math.max(1, status.matchesTotal)) *
                  100
                }
              />
            </View>
          )}

          {status.isFinished && (
            <Button
              variant="outline"
              icon={isMexicano ? Plus : Repeat}
              isLoading={addSeries.isPending || updateGame.isPending}
              onPress={playMore}
            >
              {isMexicano ? "Play one more round" : "Play another series"}
            </Button>
          )}

          <UpNextCard
            game={game}
            onPressMatch={(match, roundNumber) =>
              setScoring({ match, roundNumber })
            }
            onEndRound={confirmEndRound}
          />

          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "rounds", label: "Rounds" },
              { value: "standings", label: "Leaderboard" },
              ...(isVideoEnabled && (hasVideos || view === "videos")
                ? [{ value: "videos" as const, label: "Videos" }]
                : []),
            ]}
          />
        </View>

        {view === "videos" && videos.data ? (
          <GameVideos
            game={game}
            videos={videos.data}
            uploads={uploads}
            onFilm={openRecorder}
            onUpload={openUpload}
          />
        ) : view === "rounds" ? (
          <View className="gap-3">
            {seriesNumbers
              .filter((series) => series !== current.series)
              .map((series) => {
                const isOpen = openSeries.includes(series);
                const rounds = game.rounds.filter(
                  (round) => round.series === series,
                );
                return (
                  <View key={series} className="gap-3">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      onPress={() =>
                        setOpenSeries((open) =>
                          isOpen
                            ? open.filter((s) => s !== series)
                            : [...open, series],
                        )
                      }
                      className="flex-row items-center gap-1.5 py-1 active:opacity-50"
                    >
                      <Icon
                        as={isOpen ? ChevronDown : ChevronRight}
                        size={18}
                      />
                      <Text className="font-semibold">Series {series}</Text>
                      <Text className="text-sm text-muted-foreground">
                        · {rounds.length} rounds played
                      </Text>
                    </Pressable>
                    {isOpen &&
                      rounds.map((round, index) =>
                        roundCard(round, index, false),
                      )}
                  </View>
                );
              })}
            {seriesNumbers.length > 1 && (
              <Text className="pt-1 font-semibold">
                Series {current.series}
              </Text>
            )}
            {current.rounds.map((round, index) =>
              roundCard(round, index, index === currentRoundIndex),
            )}
            {roundsToDraw > 0 && (
              <View className="flex-row items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3">
                <Icon as={Shuffle} size={16} className="text-muted-foreground" />
                <Text className="flex-1 text-sm text-muted-foreground">
                  {roundsToDraw === 1
                    ? `Round ${current.rounds.length + 1} is drawn from the leaderboard when the round before it is finished.`
                    : `Rounds ${current.rounds.length + 1}–${status.totalRounds} are drawn from the leaderboard, one at a time.`}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Leaderboard
            game={game}
            onPressPlayer={(standing) =>
              router.push({
                pathname: "/padel/players/[playerKey]",
                params: { playerKey: playerKey(standing.name) },
              })
            }
          />
        )}

        <Button
          variant="ghost"
          icon={Trash2}
          textClassName="text-destructive"
          isLoading={deleteGame.isPending}
          onPress={confirmDelete}
        >
          Delete game
        </Button>
      </ScrollView>

      <ScoreSheet
        match={scoring?.match ?? null}
        roundNumber={scoring?.roundNumber ?? 0}
        courtName={
          scoring ? courtName(game.courtNames, scoring.match.court) : ""
        }
        pointsPerMatch={game.pointsPerMatch}
        players={game.players}
        onCancel={() => setScoring(null)}
        onSave={(score) => {
          if (scoring) saveScore(scoring.match, score);
          setScoring(null);
        }}
      />
    </>
  );
}
