"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import type { CreatePadelGameInput } from "@/types/padel";
import {
  defaultMexicanoRounds,
  defaultPadelGameName,
  estimatePadelGame,
  MAX_PADEL_COURT_NAME_LENGTH,
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MAX_PADEL_ROUNDS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
  MIN_PADEL_ROUNDS,
  maxPadelCourts,
  PADEL_POINT_PRESETS,
  type PadelFormatName,
  padelFormatLabel,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { Check, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { createPadelGame } from "../actions";

const FORMATS: { format: PadelFormatName; description: string }[] = [
  {
    format: "AMERICANO",
    description:
      "Everyone partners with everyone once. All rounds are made at the start.",
  },
  {
    format: "MEXICANO",
    description:
      "Each round is drawn from the leaderboard: 1st & 3rd against 2nd & 4th, so the matches stay even.",
  },
];

interface NewPadelGameFormProps {
  /** Names from earlier games, the most recent first */
  previousPlayers: string[];
  /** Settings of a game to play again */
  initial?: Partial<CreatePadelGameInput>;
}

export const NewPadelGameForm = ({
  previousPlayers,
  initial,
}: NewPadelGameFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [format, setFormat] = useState<PadelFormatName>(
    initial?.format ?? "AMERICANO",
  );
  // Set after mount, so server and browser render the same
  const [today, setToday] = useState<Date | null>(null);
  const [players, setPlayers] = useState<string[]>(initial?.playerNames ?? []);
  const [newPlayer, setNewPlayer] = useState("");
  const [chosenCourts, setChosenCourts] = useState<number | null>(
    initial?.courts ?? null,
  );
  const [courtNames, setCourtNames] = useState<string[]>(
    initial?.courtNames ?? [],
  );
  const [showCourtNames, setShowCourtNames] = useState(
    (initial?.courtNames?.length ?? 0) > 0,
  );
  const initialPoints = initial?.pointsPerMatch ?? 24;
  const [points, setPoints] = useState(initialPoints);
  const [customPoints, setCustomPoints] = useState(
    PADEL_POINT_PRESETS.includes(initialPoints) ? "" : String(initialPoints),
  );
  const [chosenRounds, setChosenRounds] = useState<number | null>(
    initial?.plannedRounds ?? null,
  );
  const [showAllPrevious, setShowAllPrevious] = useState(false);

  useEffect(() => setToday(new Date()), []);

  const isMexicano = format === "MEXICANO";
  const namePlaceholder = today
    ? defaultPadelGameName(format, today)
    : padelFormatLabel(format);
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
      : trimmedNewPlayer.length > 30
        ? "Use at most 30 characters"
        : null;

  const addPlayer = (playerName: string) => {
    const trimmed = playerName.trim();
    if (!trimmed || trimmed.length > 30 || hasPlayer(trimmed) || isFull) {
      return false;
    }
    setPlayers((current) => [...current, trimmed]);
    return true;
  };

  const removePlayer = (playerName: string) =>
    setPlayers((current) =>
      current.filter((p) => p.toLowerCase() !== playerName.toLowerCase()),
    );

  const onAddPlayer = (event: FormEvent) => {
    event.preventDefault();
    if (addPlayer(newPlayer)) {
      setNewPlayer("");
    }
  };

  const query = trimmedNewPlayer.toLowerCase();
  const matchingPrevious = previousPlayers.filter((p) =>
    p.toLowerCase().includes(query),
  );
  const visiblePrevious =
    showAllPrevious || query ? matchingPrevious : matchingPrevious.slice(0, 16);

  const create = () =>
    startTransition(async () => {
      try {
        const { id } = await createPadelGame({
          name: name.trim() || defaultPadelGameName(format),
          format,
          playerNames: players,
          courts,
          courtNames: courtNames.slice(0, courts),
          pointsPerMatch: points,
          plannedRounds: isMexicano ? rounds : undefined,
        });
        router.push(`/padel/${id}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create the game",
        );
      }
    });

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <label htmlFor="game-name" className="font-semibold">
          Name
        </label>
        <Input
          id="game-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={namePlaceholder}
          maxLength={60}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Format</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {FORMATS.map((option) => (
            <button
              key={option.format}
              type="button"
              aria-pressed={format === option.format}
              onClick={() => setFormat(option.format)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-colors",
                format === option.format
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <span className="font-medium">
                {padelFormatLabel(option.format)}
              </span>
              <span className="block text-sm text-muted-foreground mt-0.5">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-semibold">Players</h2>
          <span className="text-sm text-muted-foreground">
            {players.length} / {MAX_PADEL_PLAYERS}
          </span>
        </div>

        <form onSubmit={onAddPlayer} className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={newPlayer}
              onChange={(event) => setNewPlayer(event.target.value)}
              placeholder={isFull ? "The game is full" : "Add a player by name"}
              disabled={isFull}
              autoComplete="off"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={!trimmedNewPlayer || !!newPlayerError || isFull}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          {newPlayerError && (
            <p className="text-sm text-destructive">{newPlayerError}</p>
          )}
        </form>

        {players.length > 0 && (
          <ol className="flex flex-wrap gap-2">
            {players.map((player, index) => (
              <li
                key={player}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-3 pr-1.5 py-1 text-sm"
              >
                <span className="text-xs text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                {player}
                <button
                  type="button"
                  onClick={() => removePlayer(player)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${player}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>
        )}

        {previousPlayers.length > 0 && (
          <div className="space-y-2 rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Played with before</p>
            {visiblePrevious.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nobody called &quot;{trimmedNewPlayer}&quot; yet. Press Add to
                add them.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {visiblePrevious.map((player) => {
                  const isAdded = hasPlayer(player);
                  return (
                    <button
                      key={player}
                      type="button"
                      disabled={!isAdded && isFull}
                      onClick={() => {
                        if (isAdded) {
                          removePlayer(player);
                        } else if (addPlayer(player) && query) {
                          setNewPlayer("");
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-50",
                        isAdded
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-foreground/30",
                      )}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      {player}
                    </button>
                  );
                })}
              </div>
            )}
            {!query && matchingPrevious.length > visiblePrevious.length && (
              <button
                type="button"
                onClick={() => setShowAllPrevious(true)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Show all {matchingPrevious.length}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Courts</h2>
        {hasEnoughPlayers ? (
          <>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxCourts }, (_, index) => index + 1).map(
                (count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={count === courts ? "default" : "outline"}
                    className="w-12"
                    onClick={() => setChosenCourts(count)}
                  >
                    {count}
                  </Button>
                ),
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {sittingOut > 0
                ? `${courts * 4} play at a time, ${sittingOut} ${sittingOut === 1 ? "sits" : "sit"} out each round.`
                : "Everyone plays every round."}
              {maxCourts === 1 && " Add more players to use more courts."}
            </p>
            {showCourtNames ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: courts }, (_, index) => (
                  <Input
                    // biome-ignore lint/suspicious/noArrayIndexKey: courts are numbered
                    key={index}
                    value={courtNames[index] ?? ""}
                    maxLength={MAX_PADEL_COURT_NAME_LENGTH}
                    placeholder={`Court ${index + 1}`}
                    aria-label={`Name of court ${index + 1}`}
                    onChange={(event) => {
                      const next = courtNames.slice();
                      next[index] = event.target.value;
                      setCourtNames(
                        Array.from(
                          { length: next.length },
                          (_, i) => next[i] ?? "",
                        ),
                      );
                    }}
                  />
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCourtNames(true)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                + Name the courts, like &quot;Court 7&quot;
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add at least {MIN_PADEL_PLAYERS} players to choose the number of
            courts.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Points per match</h2>
        <div className="flex flex-wrap items-center gap-2">
          {PADEL_POINT_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={
                preset === points && !customPoints ? "default" : "outline"
              }
              className="w-12"
              onClick={() => {
                setPoints(preset);
                setCustomPoints("");
              }}
            >
              {preset}
            </Button>
          ))}
          <Input
            type="number"
            inputMode="numeric"
            min={MIN_PADEL_POINTS}
            max={MAX_PADEL_POINTS}
            placeholder="Other"
            value={customPoints}
            onChange={(event) => {
              setCustomPoints(event.target.value);
              setPoints(event.target.value ? Number(event.target.value) : 24);
            }}
            className={cn(
              "w-24",
              customPoints && "border-primary ring-1 ring-primary",
            )}
          />
        </div>
        <p
          className={cn(
            "text-sm",
            pointsAreValid ? "text-muted-foreground" : "text-destructive",
          )}
        >
          {pointsAreValid
            ? `The two teams' points add up to ${points}, e.g. ${Math.ceil(points / 2) + 2}–${points - Math.ceil(points / 2) - 2}. Each player gets their team's points.`
            : `Choose between ${MIN_PADEL_POINTS} and ${MAX_PADEL_POINTS} points.`}
        </p>
      </section>

      {isMexicano && (
        <section className="space-y-3">
          <h2 className="font-semibold">Rounds</h2>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={rounds <= MIN_PADEL_ROUNDS}
              onClick={() => setChosenRounds(rounds - 1)}
              aria-label="Fewer rounds"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center text-lg font-semibold tabular-nums">
              {rounds}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={rounds >= MAX_PADEL_ROUNDS}
              onClick={() => setChosenRounds(rounds + 1)}
              aria-label="More rounds"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The first round is random, the rest are drawn from the leaderboard
            as you play. You can add or remove rounds later.
          </p>
        </section>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        {hasEnoughPlayers ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat
              value={isMexicano ? rounds : estimate.rounds}
              label="rounds"
            />
            <Stat
              value={
                isMexicano
                  ? Number.isInteger(mexicanoMatches)
                    ? mexicanoMatches
                    : `${Math.floor(mexicanoMatches)}–${Math.ceil(mexicanoMatches)}`
                  : estimate.hasUnpairedPlayers
                    ? `${estimate.gamesPerPlayer - 1}–${estimate.gamesPerPlayer}`
                    : estimate.gamesPerPlayer
              }
              label="matches each"
            />
            <Stat value={courts} label={courts === 1 ? "court" : "courts"} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Add {MIN_PADEL_PLAYERS - players.length} more{" "}
            {MIN_PADEL_PLAYERS - players.length === 1 ? "player" : "players"} to
            start.
          </p>
        )}
        {hasEnoughPlayers && !isMexicano && estimate.hasUnpairedPlayers && (
          <p className="text-xs text-muted-foreground text-center">
            With {players.length} players, two players can&apos;t be partners
            and play one match less. They get their average score for it at the
            end.
          </p>
        )}
        <LoadingButton
          className="w-full"
          size="lg"
          disabled={!hasEnoughPlayers || !pointsAreValid}
          isLoading={isPending}
          onClick={create}
        >
          Create game
        </LoadingButton>
      </div>
    </div>
  );
};

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <div>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);
