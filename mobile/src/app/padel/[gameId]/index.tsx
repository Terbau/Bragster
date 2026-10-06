import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Repeat,
  Trash2,
  Trophy,
} from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Leaderboard } from "@/components/padel/Leaderboard";
import { RoundCard } from "@/components/padel/RoundCard";
import { ScoreSheet } from "@/components/padel/ScoreSheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import {
  getCurrentSeries,
  getPadelProgress,
  getPadelStandings,
  getSeriesNumbers,
} from "@/lib/padel";
import {
  useAddPadelSeries,
  useDeletePadelGame,
  usePadelGame,
  useUpdatePadelScore,
} from "@/lib/queries";
import type { PadelGame, PadelMatch } from "@/lib/types";

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
  const progress = getPadelProgress(game.rounds);
  const seriesNumbers = getSeriesNumbers(game.rounds);
  const current = getCurrentSeries(game.rounds);
  const seriesProgress = getPadelProgress(current.rounds);
  // Finished series are folded away until opened
  const [openSeries, setOpenSeries] = useState<number[]>([]);
  const [view, setView] = useState<"rounds" | "standings">(
    progress.isFinished ? "standings" : "rounds",
  );
  const [scoring, setScoring] = useState<{
    match: PadelMatch;
    roundNumber: number;
  } | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  // Start at the round being played, once the positions are known
  const position = useRef<{ list?: number; round?: number; done?: boolean }>(
    {},
  );
  const scrollToCurrentRound = () => {
    const { list, round, done } = position.current;
    if (done || list === undefined || round === undefined) return;
    position.current.done = true;
    scrollRef.current?.scrollTo({ y: list + round - 12, animated: false });
  };

  const winner = progress.isFinished
    ? getPadelStandings(game.players, game.rounds)[0]
    : undefined;

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

  return (
    <>
      <Stack.Screen
        options={{
          title: game.name,
          headerRight: progress.isFinished
            ? undefined
            : () => (
                <Pressable
                  hitSlop={10}
                  accessibilityLabel="Order of rounds"
                  onPress={() =>
                    router.push({
                      pathname: "/padel/[gameId]/order",
                      params: { gameId: game.id },
                    })
                  }
                  className="flex-row items-center gap-1.5 active:opacity-50"
                >
                  <Icon as={ArrowUpDown} size={18} />
                  <Text className="text-base">Order</Text>
                </Pressable>
              ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-background"
        contentContainerClassName="gap-5 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="gap-4">
          <Text className="text-sm text-muted-foreground">
            {game.players.length} players · {game.courts}{" "}
            {game.courts === 1 ? "court" : "courts"} · {game.pointsPerMatch}{" "}
            points per match
          </Text>

          {winner ? (
            <View className="flex-row items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
              <Icon as={Trophy} size={24} className="text-amber-500" />
              <Text className="flex-1 text-sm">
                <Text className="text-sm font-semibold">{winner.name}</Text> won
                with {winner.total} points
                {seriesNumbers.length > 1 ? " in total" : ""}!
              </Text>
            </View>
          ) : (
            <View className="gap-1.5">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted-foreground">
                  {seriesNumbers.length > 1 && `Series ${current.series} · `}
                  {seriesProgress.currentRoundIndex >= 0 &&
                    `Round ${seriesProgress.currentRoundIndex + 1} of ${current.rounds.length}`}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {seriesProgress.played} of {seriesProgress.total} matches
                  played
                </Text>
              </View>
              <Progress
                value={
                  (seriesProgress.played / Math.max(1, seriesProgress.total)) *
                  100
                }
              />
            </View>
          )}

          {progress.isFinished && (
            <Button
              variant="outline"
              icon={Repeat}
              isLoading={addSeries.isPending}
              onPress={() =>
                Alert.alert(
                  "Play another series?",
                  "Everyone partners with everyone once more, with the same players in a new random order. The leaderboard keeps adding up the points.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Start",
                      onPress: () =>
                        addSeries.mutate(undefined, {
                          onSuccess: () => {
                            position.current = { list: position.current.list };
                            setView("rounds");
                          },
                        }),
                    },
                  ],
                )
              }
            >
              Play another series
            </Button>
          )}

          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "rounds", label: "Rounds" },
              { value: "standings", label: "Leaderboard" },
            ]}
          />
        </View>

        {view === "rounds" ? (
          <View
            className="gap-3"
            onLayout={(event) => {
              position.current.list = event.nativeEvent.layout.y;
              scrollToCurrentRound();
            }}
          >
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
                      rounds.map((round, index) => (
                        <RoundCard
                          key={round.id}
                          round={round}
                          number={index + 1}
                          isCurrent={false}
                          players={game.players}
                          onPressMatch={(match) =>
                            setScoring({ match, roundNumber: index + 1 })
                          }
                        />
                      ))}
                  </View>
                );
              })}
            {seriesNumbers.length > 1 && (
              <Text className="pt-1 font-semibold">
                Series {current.series}
              </Text>
            )}
            {current.rounds.map((round, index) => {
              const isCurrent = index === seriesProgress.currentRoundIndex;
              return (
                <RoundCard
                  key={round.id}
                  round={round}
                  number={index + 1}
                  isCurrent={isCurrent}
                  players={game.players}
                  onPressMatch={(match) =>
                    setScoring({ match, roundNumber: index + 1 })
                  }
                  onLayout={
                    isCurrent && (index > 0 || seriesNumbers.length > 1)
                      ? (event) => {
                          position.current.round = event.nativeEvent.layout.y;
                          scrollToCurrentRound();
                        }
                      : undefined
                  }
                />
              );
            })}
          </View>
        ) : (
          <Leaderboard game={game} />
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
        pointsPerMatch={game.pointsPerMatch}
        players={game.players}
        onCancel={() => setScoring(null)}
        onSave={(score) => {
          if (scoring) {
            updateScore.mutate({ matchId: scoring.match.id, ...score });
          }
          setScoring(null);
        }}
      />
    </>
  );
}
