import { useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Check, Plus, X } from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "@/components/padel/Chip";
import { Stepper } from "@/components/padel/Stepper";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  DEFAULT_PADEL_POINTS,
  defaultGameName,
  defaultMexicanoRounds,
  estimatePadelGame,
  formatLabel,
  isDefaultGameName,
  MAX_PADEL_COURT_NAME_LENGTH,
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MAX_PADEL_ROUNDS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
  MIN_PADEL_ROUNDS,
  maxPadelCourts,
  PADEL_POINT_PRESETS,
  padelExtraSitOuts,
} from "@/lib/padel";
import {
  queryKeys,
  useCreatePadelGame,
  usePadelPlayerSummaries,
  usePreviousPadelPlayers,
} from "@/lib/queries";
import type { PadelFormat, PadelGame } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 30;
/** Where new players start, see the website's src/utils/padelStats.ts */
const START_RATING = 1000;

const FORMATS: { format: PadelFormat; description: string }[] = [
  {
    format: "AMERICANO",
    description: "Everyone partners with everyone once.",
  },
  {
    format: "ELO_AMERICANO",
    description:
      "Everyone partners with everyone once, and teams of about the same strength meet, from the players' ratings.",
  },
  {
    format: "MEXICANO",
    description: "Each round is drawn from the leaderboard, for even matches.",
  },
];

export default function NewPadelGameScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  // `from` is a game to play again with the same players and settings
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [template] = useState(() =>
    from
      ? queryClient.getQueryData<PadelGame>(queryKeys.padelGame(from))
      : undefined,
  );
  const createGame = useCreatePadelGame();
  const previousPlayers = usePreviousPadelPlayers();
  const summaries = usePadelPlayerSummaries();
  // A dated default name gets today's date instead
  const [name, setName] = useState(
    template && !isDefaultGameName(template.name) ? template.name : "",
  );
  const [format, setFormat] = useState<PadelFormat>(
    template?.format ?? "AMERICANO",
  );
  const [players, setPlayers] = useState<string[]>(
    () => template?.players.map((player) => player.name) ?? [],
  );
  const [newPlayer, setNewPlayer] = useState("");
  const [chosenCourts, setChosenCourts] = useState<number | null>(
    template?.courts ?? null,
  );
  const [courtNames, setCourtNames] = useState<string[]>(
    template?.courtNames ?? [],
  );
  const [showCourtNames, setShowCourtNames] = useState(
    (template?.courtNames.length ?? 0) > 0,
  );
  const initialPoints = template?.pointsPerMatch ?? DEFAULT_PADEL_POINTS;
  const [points, setPoints] = useState(initialPoints);
  const [customPoints, setCustomPoints] = useState(
    PADEL_POINT_PRESETS.includes(initialPoints) ? "" : String(initialPoints),
  );
  const [chosenRounds, setChosenRounds] = useState<number | null>(
    template?.plannedRounds ?? null,
  );
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [sitOutMore, setSitOutMore] = useState<string[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const namePlaceholder = defaultGameName(format);
  const isMexicano = format === "MEXICANO";
  const isElo = format === "ELO_AMERICANO";
  const ratingOf = (playerName: string) =>
    summaries.data?.find(
      (summary) => summary.key === playerName.trim().toLowerCase(),
    )?.rating;

  // The Create button is hidden while typing, so closing the keyboard can't
  // tap it by accident
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () =>
      setIsKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const maxCourts = maxPadelCourts(players.length);
  // Until a number is picked, use as many courts as the players can fill
  const courts = Math.min(chosenCourts ?? maxCourts, maxCourts);
  const hasEnoughPlayers = players.length >= MIN_PADEL_PLAYERS;
  const isFull = players.length >= MAX_PADEL_PLAYERS;
  const estimate = estimatePadelGame(players.length, courts);
  const sittingOut = players.length - courts * 4;
  // Follows the players and courts until a number is picked
  const rounds = chosenRounds ?? defaultMexicanoRounds(players.length, courts);
  const mexicanoMatches = (rounds * courts * 4) / Math.max(1, players.length);
  const extraSitOuts = padelExtraSitOuts(
    format,
    players.length,
    courts,
    rounds,
  );
  // Players who are removed, or more than can sit out more, drop out
  const chosenSitOut = players
    .filter((player) => sitOutMore.includes(player.toLowerCase()))
    .slice(0, extraSitOuts);
  const matchesEach = isMexicano
    ? Number.isInteger(mexicanoMatches)
      ? String(mexicanoMatches)
      : `${Math.floor(mexicanoMatches)}–${Math.ceil(mexicanoMatches)}`
    : estimate.hasUnpairedPlayers
      ? `${estimate.gamesPerPlayer - 1}–${estimate.gamesPerPlayer}`
      : String(estimate.gamesPerPlayer);
  const pointsAreValid =
    Number.isInteger(points) &&
    points >= MIN_PADEL_POINTS &&
    points <= MAX_PADEL_POINTS;

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
    if (
      !trimmed ||
      trimmed.length > MAX_NAME_LENGTH ||
      hasPlayer(trimmed) ||
      isFull
    ) {
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
        format,
        playerNames: players,
        courts,
        courtNames: courtNames.slice(0, courts).map((court) => court.trim()),
        pointsPerMatch: points,
        plannedRounds: isMexicano ? rounds : undefined,
        sitOutMore: chosenSitOut,
      },
      {
        onSuccess: ({ id }) =>
          router.replace({
            pathname: "/padel/[gameId]",
            params: { gameId: id },
          }),
      },
    );

  return (
    <View className="flex-1 bg-background">
      {template && <Stack.Screen options={{ title: "Play again" }} />}
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
            submitBehavior="blurAndSubmit"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </Section>

        <Section title="Format">
          <View className="gap-2">
            {FORMATS.map((option) => {
              const isSelected = option.format === format;
              return (
                <Pressable
                  key={option.format}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setFormat(option.format)}
                  className={cn(
                    "gap-1 rounded-xl border-2 p-3",
                    isSelected
                      ? "border-primary bg-accent"
                      : "border-border active:bg-accent",
                  )}
                >
                  <Text className="font-medium">
                    {formatLabel(option.format)}
                  </Text>
                  <Text className="text-xs leading-4 text-muted-foreground">
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section
          title="Players"
          aside={`${players.length} / ${MAX_PADEL_PLAYERS}`}
        >
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
              submitBehavior="blurAndSubmit"
              // Done closes the keyboard, keeping a name that was typed
              onSubmitEditing={() => {
                if (addPlayer(newPlayer)) setNewPlayer("");
                Keyboard.dismiss();
              }}
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
                  <Text className="text-xs text-muted-foreground">
                    {index + 1}
                  </Text>
                  <Text className="text-sm">{player}</Text>
                  {isElo && ratingOf(player) !== undefined && (
                    <Text className="text-xs text-muted-foreground">
                      {ratingOf(player)}
                    </Text>
                  )}
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

          {isElo && players.length > 0 && (
            <Text className="text-sm text-muted-foreground">
              The ratings are from your earlier games. New players start at{" "}
              {START_RATING}.
            </Text>
          )}

          {(previousPlayers.data?.length ?? 0) > 0 && (
            <View className="gap-3 rounded-xl bg-muted/50 p-4">
              <Text className="text-sm font-medium">Played with before</Text>
              {visiblePrevious.length === 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Nobody called &quot;{trimmedNewPlayer}&quot; yet. Tap Add to
                  add them.
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
                {Array.from({ length: maxCourts }, (_, index) => index + 1).map(
                  (count) => (
                    <OptionButton
                      key={count}
                      label={String(count)}
                      selected={count === courts}
                      onPress={() => setChosenCourts(count)}
                    />
                  ),
                )}
              </View>
              <Text className="text-sm text-muted-foreground">
                {sittingOut > 0
                  ? `${courts * 4} play at a time, ${sittingOut} ${sittingOut === 1 ? "sits" : "sit"} out each round.`
                  : "Everyone plays every round."}
                {maxCourts === 1 && " Add more players to use more courts."}
              </Text>
              {showCourtNames ? (
                <View className="gap-2">
                  {Array.from({ length: courts }, (_, index) => (
                    <Input
                      // biome-ignore lint/suspicious/noArrayIndexKey: courts are numbered
                      key={index}
                      value={courtNames[index] ?? ""}
                      onChangeText={(text) =>
                        setCourtNames((current) =>
                          Array.from(
                            { length: Math.max(current.length, index + 1) },
                            (_, i) => (i === index ? text : (current[i] ?? "")),
                          ),
                        )
                      }
                      placeholder={`Court ${index + 1}`}
                      maxLength={MAX_PADEL_COURT_NAME_LENGTH}
                      returnKeyType="done"
                      submitBehavior="blurAndSubmit"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  ))}
                </View>
              ) : (
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowCourtNames(true)}
                  className="active:opacity-50"
                >
                  <Text className="text-sm text-muted-foreground">
                    + Name the courts, like &quot;Court 7&quot;
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Add at least {MIN_PADEL_PLAYERS} players to choose the number of
              courts.
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
                setPoints(digits ? Number(digits) : DEFAULT_PADEL_POINTS);
              }}
              placeholder="Other"
              keyboardType="number-pad"
              returnKeyType="done"
              className={cn(
                "w-20 text-center",
                customPoints && "border-2 border-primary",
              )}
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

        {isMexicano && (
          <Section title="Rounds">
            <Stepper
              value={rounds}
              min={MIN_PADEL_ROUNDS}
              max={MAX_PADEL_ROUNDS}
              onChange={setChosenRounds}
            />
            <Text className="text-sm text-muted-foreground">
              The first round is random, the rest are drawn from the leaderboard
              as you play: 1st & 3rd against 2nd & 4th. You can add or remove
              rounds later.
            </Text>
          </Section>
        )}

        {hasEnoughPlayers && extraSitOuts > 0 && (
          <Section
            title="Who sits out more"
            aside={`${chosenSitOut.length} / ${extraSitOuts}`}
          >
            <Text className="text-sm text-muted-foreground">
              {isMexicano
                ? `With ${players.length} players and ${rounds} rounds, ${extraSitOuts} ${extraSitOuts === 1 ? "player sits" : "players sit"} out one round more than the others.`
                : `With ${players.length} players, two players can't be partners. They play one match less, so they sit out one round more than the others, and get their average score for the missing match.`}{" "}
              Choose who, or leave it to chance.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {players.map((player) => {
                const isChosen = chosenSitOut.includes(player);
                return (
                  <Chip
                    key={player}
                    label={player}
                    icon={isChosen ? Check : undefined}
                    selected={isChosen}
                    disabled={
                      !isChosen && chosenSitOut.length >= extraSitOuts
                    }
                    onPress={() =>
                      setSitOutMore(
                        (isChosen
                          ? chosenSitOut.filter((p) => p !== player)
                          : [...chosenSitOut, player]
                        ).map((p) => p.toLowerCase()),
                      )
                    }
                  />
                );
              })}
            </View>
          </Section>
        )}
      </ScrollView>

      {!isKeyboardVisible && (
        <View
          className="gap-3 border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Text className="text-center text-sm text-muted-foreground">
            {hasEnoughPlayers
              ? `${isMexicano ? rounds : estimate.rounds} rounds · ${matchesEach} matches each · ${courts} ${courts === 1 ? "court" : "courts"}`
              : `Add ${MIN_PADEL_PLAYERS - players.length} more ${
                  MIN_PADEL_PLAYERS - players.length === 1
                    ? "player"
                    : "players"
                } to start`}
          </Text>
          <Button
            size="lg"
            disabled={!hasEnoughPlayers || !pointsAreValid}
            isLoading={createGame.isPending}
            onPress={create}
          >
            Create game
          </Button>
        </View>
      )}
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
        {aside && (
          <Text className="text-sm text-muted-foreground">{aside}</Text>
        )}
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
