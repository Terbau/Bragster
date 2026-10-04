"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import {
  estimatePadelGame,
  MAX_PADEL_PLAYERS,
  MAX_PADEL_POINTS,
  MIN_PADEL_PLAYERS,
  MIN_PADEL_POINTS,
  maxPadelCourts,
  PADEL_POINT_PRESETS,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { Check, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { createPadelGame } from "../actions";

const defaultGameName = () =>
  `Americano ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date())}`;

interface NewPadelGameFormProps {
  /** Names from earlier games, the most recent first */
  previousPlayers: string[];
}

export const NewPadelGameForm = ({
  previousPlayers,
}: NewPadelGameFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  // Set after mount, so server and browser render the same
  const [namePlaceholder, setNamePlaceholder] = useState("Americano");
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [chosenCourts, setChosenCourts] = useState<number | null>(null);
  const [points, setPoints] = useState(24);
  const [customPoints, setCustomPoints] = useState("");
  const [showAllPrevious, setShowAllPrevious] = useState(false);

  useEffect(() => setNamePlaceholder(defaultGameName()), []);

  const maxCourts = maxPadelCourts(players.length);
  // Until a number is picked, use as many courts as the players can fill
  const courts = Math.min(chosenCourts ?? maxCourts, maxCourts);
  const hasEnoughPlayers = players.length >= MIN_PADEL_PLAYERS;
  const isFull = players.length >= MAX_PADEL_PLAYERS;
  const estimate = estimatePadelGame(players.length, courts);
  const sittingOut = players.length - courts * 4;
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
          name: name.trim() || defaultGameName(),
          playerNames: players,
          courts,
          pointsPerMatch: points,
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

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        {hasEnoughPlayers ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat value={estimate.rounds} label="rounds" />
            <Stat
              value={
                estimate.hasUnpairedPlayers
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
        {hasEnoughPlayers && estimate.hasUnpairedPlayers && (
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
