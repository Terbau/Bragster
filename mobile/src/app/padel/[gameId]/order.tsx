import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Coffee, Lock } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Chip } from "@/components/padel/Chip";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import {
  getCurrentSeries,
  getSittingOut,
  isRoundPlayed,
  isRoundStarted,
  moveRound,
  restPlayerNext,
} from "@/lib/padel";
import { usePadelGame, useReorderPadelRounds } from "@/lib/queries";
import type { PadelGame, PadelPlayer, PadelRound } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RoundOrderScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <RoundOrder key={data.id} game={data} />;
}

function RoundOrder({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const reorder = useReorderPadelRounds(game.id);
  // Earlier series are finished, so only the current one can be reordered
  const seriesRounds = getCurrentSeries(game.rounds).rounds;
  const [rounds, setRounds] = useState(seriesRounds);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isChanged = rounds.some(
    (round, index) => round.id !== seriesRounds[index]?.id,
  );
  const nextIndex = rounds.findIndex((round) => !isRoundStarted(round));
  // With every player on court each round, nobody can get a break
  const someoneSitsOut = rounds.some(
    (round) =>
      !isRoundStarted(round) && getSittingOut(game.players, round).length > 0,
  );
  const originalNumber = (round: PadelRound) =>
    seriesRounds.findIndex((r) => r.id === round.id) + 1;

  const move = (from: number, to: number) => {
    const result = moveRound(rounds, from, to);
    if (result !== rounds) {
      void Haptics.selectionAsync();
      setRounds(result);
      setMessage(null);
    }
  };

  const giveBreak = (player: PadelPlayer) => {
    setHighlighted(player.id);
    const result = restPlayerNext(rounds, player.id);
    if (!result) {
      setMessage(`${player.name} doesn't sit out any of the remaining rounds.`);
    } else if (result === rounds) {
      setMessage(`${player.name} already sits out round ${nextIndex + 1}.`);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRounds(result);
      setMessage(`${player.name} now sits out round ${nextIndex + 1}.`);
    }
  };

  const cancel = () => {
    if (!isChanged) {
      router.back();
      return;
    }
    Alert.alert(
      "Discard changes?",
      "The new order of the rounds will be lost.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  const save = () =>
    reorder.mutate(
      [
        ...game.rounds.filter((round) => !seriesRounds.includes(round)),
        ...rounds,
      ].map((round) => round.id),
      { onSuccess: () => router.back() },
    );

  return (
    <>
      <Stack.Screen
        options={{
          // Swiping the sheet away would lose the changes
          gestureEnabled: !isChanged,
          headerLeft: () => (
            <Pressable
              hitSlop={10}
              onPress={cancel}
              className="active:opacity-50"
            >
              <Text className="text-base">Cancel</Text>
            </Pressable>
          ),
          headerRight: () =>
            reorder.isPending ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <Pressable
                hitSlop={10}
                onPress={save}
                disabled={!isChanged}
                className={isChanged ? "active:opacity-50" : "opacity-40"}
              >
                <Text className="text-base font-semibold">Save</Text>
              </Pressable>
            ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-5 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Text className="text-sm text-muted-foreground">
          Move rounds up or down to change when they are played. Rounds that
          have a score stay where they are.
        </Text>

        {someoneSitsOut && (
          <View className="gap-3 rounded-xl bg-muted/50 p-4">
            <View className="gap-1">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Coffee} size={16} />
                <Text className="text-sm font-medium">Needs a break?</Text>
              </View>
              <Text className="text-xs text-muted-foreground">
                Tap a player to move the next round they sit out to be played
                next.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {game.players.map((player) => (
                <Chip
                  key={player.id}
                  label={player.name}
                  highlighted={highlighted === player.id}
                  onPress={() => giveBreak(player)}
                />
              ))}
            </View>
            {message && <Text className="text-sm">{message}</Text>}
          </View>
        )}

        <View className="gap-2">
          {rounds.map((round, index) => {
            const started = isRoundStarted(round);
            const resting = getSittingOut(game.players, round);
            const highlightRests = resting.some((p) => p.id === highlighted);
            const canMoveUp = moveRound(rounds, index, index - 1) !== rounds;
            const canMoveDown = moveRound(rounds, index, index + 1) !== rounds;
            const wasNumber = originalNumber(round);

            return (
              <View
                key={round.id}
                className={cn(
                  "flex-row items-center gap-3 rounded-xl border py-2.5 pl-3 pr-1",
                  started
                    ? "border-border bg-muted/40"
                    : "border-border bg-card",
                  highlightRests && "border-amber-500 bg-amber-500/10",
                )}
              >
                <View className="w-16">
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      started && "text-muted-foreground",
                    )}
                  >
                    Round {index + 1}
                  </Text>
                  {started ? (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        as={Lock}
                        size={11}
                        className="text-muted-foreground"
                      />
                      <Text className="text-xs text-muted-foreground">
                        {isRoundPlayed(round) ? "Played" : "Started"}
                      </Text>
                    </View>
                  ) : index === nextIndex ? (
                    <Text className="text-xs text-green-600 dark:text-green-500">
                      Next
                    </Text>
                  ) : wasNumber !== index + 1 ? (
                    <Text className="text-xs text-muted-foreground">
                      was {wasNumber}
                    </Text>
                  ) : null}
                </View>

                <View className="min-w-0 flex-1 gap-0.5">
                  {round.matches.map((match) => (
                    <Text
                      key={match.id}
                      className={cn(
                        "text-sm",
                        started && "text-muted-foreground",
                      )}
                      numberOfLines={2}
                    >
                      {round.matches.length > 1 && (
                        <Text className="text-sm text-muted-foreground">
                          {match.court}:{" "}
                        </Text>
                      )}
                      <Names
                        ids={match.team1}
                        players={game.players}
                        highlighted={highlighted}
                      />
                      <Text className="text-sm text-muted-foreground">
                        {" "}
                        vs{" "}
                      </Text>
                      <Names
                        ids={match.team2}
                        players={game.players}
                        highlighted={highlighted}
                      />
                    </Text>
                  ))}
                  {resting.length > 0 && (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        as={Coffee}
                        size={12}
                        className={
                          highlightRests
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground"
                        }
                      />
                      <Text
                        numberOfLines={1}
                        className={cn(
                          "flex-1 text-xs",
                          highlightRests
                            ? "font-medium text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {resting.map((player) => player.name).join(", ")}
                      </Text>
                    </View>
                  )}
                </View>

                {!started && (
                  <View>
                    <MoveButton
                      direction="up"
                      round={index + 1}
                      disabled={!canMoveUp}
                      onPress={() => move(index, index - 1)}
                    />
                    <MoveButton
                      direction="down"
                      round={index + 1}
                      disabled={!canMoveDown}
                      onPress={() => move(index, index + 1)}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

function Names({
  ids,
  players,
  highlighted,
}: {
  ids: string[];
  players: PadelPlayer[];
  highlighted: string | null;
}) {
  return ids.map((id, index) => (
    <Text key={id} className="text-sm">
      {index > 0 ? " & " : ""}
      <Text
        className={cn(
          "text-sm",
          id === highlighted &&
            "font-semibold text-amber-700 dark:text-amber-400",
        )}
      >
        {players.find((player) => player.id === id)?.name ?? "?"}
      </Text>
    </Text>
  ));
}

function MoveButton({
  direction,
  round,
  disabled,
  onPress,
}: {
  direction: "up" | "down";
  round: number;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Move round ${round} ${direction}`}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      className={cn(
        "h-9 w-10 items-center justify-center rounded-md active:bg-accent",
        disabled && "opacity-25",
      )}
    >
      <Icon as={direction === "up" ? ChevronUp : ChevronDown} size={20} />
    </Pressable>
  );
}
