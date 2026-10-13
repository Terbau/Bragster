import { router, Stack, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";
import { Stepper } from "@/components/padel/Stepper";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import {
  isRoundStarted,
  MAX_PADEL_COURT_NAME_LENGTH,
  MAX_PADEL_ROUNDS,
} from "@/lib/padel";
import {
  type UpdatePadelGameBody,
  usePadelGame,
  useUpdatePadelGame,
} from "@/lib/queries";
import { toast } from "@/lib/toast";
import type { PadelGame } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 30;

export default function EditPadelGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { data, error, isPending, refetch } = usePadelGame(gameId);

  if (isPending) {
    return <Spinner className="flex-1" />;
  }
  if (error || !data) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  return <EditGame key={data.id} game={data} />;
}

const courtNamesOf = (game: PadelGame) =>
  Array.from({ length: game.courts }, (_, i) => game.courtNames[i] ?? "");

function EditGame({ game }: { game: PadelGame }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const updateGame = useUpdatePadelGame(game.id);
  const [name, setName] = useState(game.name);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(game.players.map((player) => [player.id, player.name])),
  );
  const [courtNames, setCourtNames] = useState(() => courtNamesOf(game));
  const [rounds, setRounds] = useState(game.plannedRounds ?? 0);
  const isMexicano = game.format === "MEXICANO";
  const minRounds = Math.max(1, game.rounds.filter(isRoundStarted).length);

  const trimmed = (id: string) => (playerNames[id] ?? "").trim();
  const playerError = (id: string) => {
    const value = trimmed(id);
    if (!value) return "Enter a name";
    const isTaken = game.players.some(
      (other) =>
        other.id !== id &&
        trimmed(other.id).toLowerCase() === value.toLowerCase(),
    );
    return isTaken ? "Two players have this name" : null;
  };
  const hasErrors =
    !name.trim() || game.players.some((player) => playerError(player.id));

  const changes: UpdatePadelGameBody = {};
  if (name.trim() !== game.name) changes.name = name.trim();
  const renamed = game.players
    .filter((player) => trimmed(player.id) !== player.name)
    .map((player) => ({ id: player.id, name: trimmed(player.id) }));
  if (renamed.length > 0) changes.players = renamed;
  const courts = courtNames.map((court) => court.trim());
  if (courts.join("\n") !== courtNamesOf(game).join("\n")) {
    changes.courtNames = courts;
  }
  if (isMexicano && rounds !== game.plannedRounds) {
    changes.plannedRounds = rounds;
  }
  const isChanged = Object.keys(changes).length > 0;

  const cancel = () => {
    if (!isChanged) {
      router.back();
      return;
    }
    Alert.alert("Discard changes?", "Your changes to the game will be lost.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  const save = () =>
    updateGame.mutate(changes, {
      onSuccess: () => {
        toast.success("Game updated");
        router.back();
      },
    });

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
            updateGame.isPending ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <Pressable
                hitSlop={10}
                onPress={save}
                disabled={!isChanged || hasErrors}
                className={
                  isChanged && !hasErrors ? "active:opacity-50" : "opacity-40"
                }
              >
                <Text className="text-base font-semibold">Save</Text>
              </Pressable>
            ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-8 p-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Section title="Name">
          <Input
            value={name}
            onChangeText={setName}
            maxLength={60}
            returnKeyType="done"
          />
        </Section>

        <Section
          title="Players"
          description="Fix a name that was spelled wrong. The player keeps their scores."
        >
          {game.players.map((player, index) => {
            const error = playerError(player.id);
            return (
              <View key={player.id} className="gap-1">
                <View className="flex-row items-center gap-3">
                  <Text className="w-5 text-right text-xs text-muted-foreground">
                    {index + 1}
                  </Text>
                  <Input
                    className={cn("flex-1", error && "border-destructive")}
                    value={playerNames[player.id] ?? ""}
                    onChangeText={(text) =>
                      setPlayerNames((current) => ({
                        ...current,
                        [player.id]: text,
                      }))
                    }
                    maxLength={MAX_NAME_LENGTH}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                </View>
                {error && (
                  <Text className="pl-8 text-xs text-destructive">{error}</Text>
                )}
              </View>
            );
          })}
        </Section>

        <Section
          title="Court names"
          description="Use the names from the booking, like Court 7."
        >
          {courtNames.map((court, index) => (
            <Input
              // biome-ignore lint/suspicious/noArrayIndexKey: courts are numbered
              key={index}
              value={court}
              onChangeText={(text) =>
                setCourtNames((current) =>
                  current.map((c, i) => (i === index ? text : c)),
                )
              }
              placeholder={`Court ${index + 1}`}
              maxLength={MAX_PADEL_COURT_NAME_LENGTH}
              returnKeyType="done"
            />
          ))}
        </Section>

        {isMexicano && (
          <Section
            title="Rounds"
            description="Rounds that have been played can't be removed."
          >
            <Stepper
              value={rounds}
              min={minRounds}
              max={MAX_PADEL_ROUNDS}
              onChange={setRounds}
            />
          </Section>
        )}
      </ScrollView>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="font-semibold">{title}</Text>
        {description && (
          <Text className="text-sm text-muted-foreground">{description}</Text>
        )}
      </View>
      {children}
    </View>
  );
}
