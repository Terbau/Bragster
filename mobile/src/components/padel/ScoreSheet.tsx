import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { PadelMatch, PadelPlayer } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS = 6;
const GAP = 8;

interface ScoreSheetProps {
  match: PadelMatch | null;
  roundNumber: number;
  pointsPerMatch: number;
  players: PadelPlayer[];
  onSave: (score: {
    team1Score: number | null;
    team2Score: number | null;
  }) => void;
  onCancel: () => void;
}

/**
 * Pick one team's points, the other team gets the rest of the points of the
 * match.
 */
export function ScoreSheet({
  match,
  roundNumber,
  pointsPerMatch,
  players,
  onSave,
  onCancel,
}: ScoreSheetProps) {
  const insets = useSafeAreaInsets();
  const [team, setTeam] = useState<1 | 2>(1);
  const [team1Score, setTeam1Score] = useState<number | null>(null);
  const [gridWidth, setGridWidth] = useState(0);

  useEffect(() => {
    if (match) {
      setTeam(1);
      setTeam1Score(match.team1Score);
    }
  }, [match]);

  const team2Score = team1Score === null ? null : pointsPerMatch - team1Score;
  const selectedScore = team === 1 ? team1Score : team2Score;
  const name = (id: string) =>
    players.find((player) => player.id === id)?.name ?? "?";

  return (
    <Modal
      visible={match !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable
            hitSlop={10}
            onPress={onCancel}
            className="active:opacity-50"
          >
            <Text className="text-base">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold">
            Round {roundNumber} · Court {match?.court}
          </Text>
          {/* Balances the Cancel button, so the title stays centered */}
          <Text className="text-base opacity-0">Cancel</Text>
        </View>

        {match && (
          <ScrollView
            contentContainerClassName="gap-5 p-5"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          >
            <Text className="text-center text-sm text-muted-foreground">
              Tap a team, then its points. The other team gets the rest of the{" "}
              {pointsPerMatch}, and the score is saved.
            </Text>

            <View className="flex-row gap-3">
              {([1, 2] as const).map((side) => {
                const score = side === 1 ? team1Score : team2Score;
                const other = side === 1 ? team2Score : team1Score;
                const isWinning =
                  score !== null && other !== null && score > other;
                return (
                  <Pressable
                    key={side}
                    accessibilityRole="button"
                    accessibilityState={{ selected: team === side }}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setTeam(side);
                    }}
                    className={cn(
                      "flex-1 items-center gap-1 rounded-2xl border-2 px-2 py-4",
                      team === side
                        ? "border-primary bg-accent"
                        : "border-border",
                    )}
                  >
                    {(side === 1 ? match.team1 : match.team2).map((id) => (
                      <Text
                        key={id}
                        className="text-center text-sm font-medium"
                        numberOfLines={1}
                      >
                        {name(id)}
                      </Text>
                    ))}
                    <Text
                      className={cn(
                        "mt-1 text-5xl font-bold leading-[56px]",
                        score === null && "text-muted-foreground",
                        isWinning && "text-green-600 dark:text-green-500",
                      )}
                      style={{ fontVariant: ["tabular-nums"] }}
                    >
                      {score ?? "–"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              className="flex-row flex-wrap"
              style={{ gap: GAP }}
              onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
            >
              {Array.from(
                { length: pointsPerMatch + 1 },
                (_, value) => value,
              ).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} points`}
                  onPress={() => {
                    // Picking the points finishes the match
                    void Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    );
                    const score1 = team === 1 ? value : pointsPerMatch - value;
                    onSave({
                      team1Score: score1,
                      team2Score: pointsPerMatch - score1,
                    });
                  }}
                  className={cn(
                    "h-12 items-center justify-center rounded-lg border",
                    value === selectedScore
                      ? "border-primary bg-primary"
                      : "border-border bg-background active:bg-accent",
                  )}
                  style={{
                    width: Math.max(
                      0,
                      (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS,
                    ),
                  }}
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      value === selectedScore && "text-primary-foreground",
                    )}
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>

            {match.team1Score !== null && (
              <Button
                variant="ghost"
                onPress={() => onSave({ team1Score: null, team2Score: null })}
                textClassName="text-destructive"
              >
                Clear score
              </Button>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
