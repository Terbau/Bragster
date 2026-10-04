import { router } from "expo-router";
import { Check, Plus, X } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "@/components/padel/Chip";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  defaultGameName,
  estimatePadelGame,
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
  maxPadelCourts,
  PADEL_POINT_PRESETS,
} from "@/lib/padel";
import { useCreatePadelGame, usePreviousPadelPlayers } from "@/lib/queries";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 30;

export default function NewPadelGameScreen() {
  const insets = useSafeAreaInsets();
  const createGame = useCreatePadelGame();
  const previousPlayers = usePreviousPadelPlayers();
  const [namePlaceholder] = useState(defaultGameName);
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [chosenCourts, setChosenCourts] = useState<number | null>(null);
  const [points, setPoints] = useState(24);
  const [customPoints, setCustomPoints] = useState("");
  const [showAllPrevious, setShowAllPrevious] = useState(false);

  const maxCourts = maxPadelCourts(players.length);
  // Until a number is picked, use as many courts as the players can fill
  const courts = Math.min(chosenCourts ?? maxCourts, maxCourts);
  const hasEnoughPlayers = players.length >= MIN_PADEL_PLAYERS;
  const isFull = players.length >= MAX_PADEL_PLAYERS;
  const estimate = estimatePadelGame(players.length, courts);
  const sittingOut = players.length - courts * 4;
  const pointsAreValid =
    Number.isInteger(points) && points >= MIN_PADEL_POINTS && points <= MAX_PADEL_POINTS;

  const hasPlayer = (playerName: string) =>
    players.some((p) => p.toLowerCase() === playerName.trim().toLowerCase());

  const trimmedNewPlayer = newPlayer.trim();
  const newPlayerError =
    trimmedNewPlayer && hasPlayer(trimmedNewPlayer)
      ? `${trimmedNewPlayer} has already been added`
      : trimmedNewPlayer.length > MAX_NAME_LENGTH
        ? `Use at most ${MAX_NAME_LENGTH} characters`
        : null;

  const addPlayer = (playerName: string) => {
    const trimmed = playerName.trim();
    if (!trimmed || trimmed.length > MAX_NAME_LENGTH || hasPlayer(trimmed) || isFull) {
      return false;
    }
    setPlayers((current) => [...current, trimmed]);
    return true;
  };

  const removePlayer = (playerName: string) =>
    setPlayers((current) =>
      current.filter((p) => p.toLowerCase() !== playerName.toLowerCase()),
    );

  const query = trimmedNewPlayer.toLowerCase();
  const matchingPrevious = (previousPlayers.data ?? [])
    .map((player) => player.name)
    .filter((playerName) => playerName.toLowerCase().includes(query));
  const visiblePrevious =
    showAllPrevious || query ? matchingPrevious : matchingPrevious.slice(0, 16);

  const create = () =>
    createGame.mutate(
      {
        name: name.trim() || namePlaceholder,
        playerNames: players,
        courts,
        pointsPerMatch: points,
      },
      {
        onSuccess: ({ id }) =>
          router.replace({ pathname: "/padel/[gameId]", params: { gameId: id } }),
      },
    );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="gap-8 p-5 pb-10"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Section title="Name">
          <Input
            value={name}
            onChangeText={setName}
            placeholder={namePlaceholder}
            maxLength={60}
            returnKeyType="done"
          />
        </Section>

        <Section title="Players" aside={`${players.length} / ${MAX_PADEL_PLAYERS}`}>
          <View className="flex-row gap-2">
            <Input
              className="flex-1"
              value={newPlayer}
              onChangeText={setNewPlayer}
              placeholder={isFull ? "The game is full" : "Add a player by name"}
              editable={!isFull}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={() => addPlayer(newPlayer) && setNewPlayer("")}
            />
            <Button
              variant="secondary"
              icon={Plus}
              disabled={!trimmedNewPlayer || !!newPlayerError || isFull}
              onPress={() => addPlayer(newPlayer) && setNewPlayer("")}
            >
              Add
            </Button>
          </View>
          {newPlayerError && (
            <Text className="text-sm text-destructive">{newPlayerError}</Text>
          )}

          {players.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {players.map((player, index) => (
                <View
                  key={player}
                  className="flex-row items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3 pr-2"
                >
                  <Text className="text-xs text-muted-foreground">{index + 1}</Text>
                  <Text className="text-sm">{player}</Text>
                  <Pressable
                    hitSlop={8}
                    accessibilityLabel={`Remove ${player}`}
                    onPress={() => removePlayer(player)}
                    className="active:opacity-50"
                  >
                    <Icon as={X} size={14} className="text-muted-foreground" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {(previousPlayers.data?.length ?? 0) > 0 && (
            <View className="gap-3 rounded-xl bg-muted/50 p-4">
              <Text className="text-sm font-medium">Played with before</Text>
              {visiblePrevious.length === 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Nobody called &quot;{trimmedNewPlayer}&quot; yet. Tap Add to add them.
                </Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {visiblePrevious.map((player) => {
                    const isAdded = hasPlayer(player);
                    return (
                      <Chip
                        key={player}
                        label={player}
                        icon={isAdded ? Check : Plus}
                        selected={isAdded}
                        disabled={!isAdded && isFull}
                        onPress={() => {
                          if (isAdded) {
                            removePlayer(player);
                          } else if (addPlayer(player) && query) {
                            setNewPlayer("");
                          }
                        }}
                      />
                    );
                  })}
                </View>
              )}
              {!query && matchingPrevious.length > visiblePrevious.length && (
                <Pressable onPress={() => setShowAllPrevious(true)} hitSlop={8}>
                  <Text className="text-sm text-muted-foreground">
                    Show all {matchingPrevious.length}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </Section>

        <Section title="Courts">
          {hasEnoughPlayers ? (
            <>
              <View className="flex-row flex-wrap gap-2">
                {Array.from({ length: maxCourts }, (_, index) => index + 1).map((count) => (
                  <OptionButton
                    key={count}
                    label={String(count)}
                    selected={count === courts}
                    onPress={() => setChosenCourts(count)}
                  />
                ))}
              </View>
              <Text className="text-sm text-muted-foreground">
                {sittingOut > 0
                  ? `${courts * 4} play at a time, ${sittingOut} ${sittingOut === 1 ? "sits" : "sit"} out each round.`
                  : "Everyone plays every round."}
                {maxCourts === 1 && " Add more players to use more courts."}
              </Text>
            </>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Add at least {MIN_PADEL_PLAYERS} players to choose the number of courts.
            </Text>
          )}
        </Section>

        <Section title="Points per match">
          <View className="flex-row flex-wrap gap-2">
            {PADEL_POINT_PRESETS.map((preset) => (
              <OptionButton
                key={preset}
                label={String(preset)}
                selected={preset === points && !customPoints}
                onPress={() => {
                  setPoints(preset);
                  setCustomPoints("");
                }}
              />
            ))}
            <Input
              value={customPoints}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, "").slice(0, 2);
                setCustomPoints(digits);
                setPoints(digits ? Number(digits) : 24);
              }}
              placeholder="Other"
              keyboardType="number-pad"
              returnKeyType="done"
              className={cn("w-20 text-center", customPoints && "border-2 border-primary")}
            />
          </View>
          <Text
            className={cn(
              "text-sm",
              pointsAreValid ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {pointsAreValid
              ? `The two teams' points add up to ${points}, e.g. ${Math.ceil(points / 2) + 2}–${points - Math.ceil(points / 2) - 2}. Each player gets their team's points.`
              : `Choose between ${MIN_PADEL_POINTS} and ${MAX_PADEL_POINTS} points.`}
          </Text>
        </Section>
      </ScrollView>

      <View
        className="gap-3 border-t border-border bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Text className="text-center text-sm text-muted-foreground">
          {hasEnoughPlayers
            ? `${estimate.rounds} rounds · ${
                estimate.hasUnpairedPlayers
                  ? `${estimate.gamesPerPlayer - 1}–${estimate.gamesPerPlayer}`
                  : estimate.gamesPerPlayer
              } matches each · ${courts} ${courts === 1 ? "court" : "courts"}`
            : `Add ${MIN_PADEL_PLAYERS - players.length} more ${
                MIN_PADEL_PLAYERS - players.length === 1 ? "player" : "players"
              } to start`}
        </Text>
        {hasEnoughPlayers && estimate.hasUnpairedPlayers && (
          <Text className="-mt-1 text-center text-xs text-muted-foreground">
            Two players can&apos;t be partners and play one match less. They get their
            average score for it at the end.
          </Text>
        )}
        <Button
          size="lg"
          disabled={!hasEnoughPlayers || !pointsAreValid}
          isLoading={createGame.isPending}
          onPress={create}
        >
          Create game
        </Button>
      </View>
    </View>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-semibold">{title}</Text>
        {aside && <Text className="text-sm text-muted-foreground">{aside}</Text>}
      </View>
      {children}
    </View>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      className="w-14 px-0"
      onPress={onPress}
      accessibilityState={{ selected }}
    >
      {label}
    </Button>
  );
}
