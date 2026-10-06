"use client";

import { LoadingButton } from "@/components/LoadingButton/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PadelGameWithRounds, PadelRoundWithMatches } from "@/types/padel";
import {
  getCurrentPadelSeries,
  getSittingOut,
  isPadelRoundPlayed,
  isPadelRoundStarted,
  movePadelRound,
  restPadelPlayerNext,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { ChevronDown, ChevronUp, Coffee, Lock } from "lucide-react";
import { useEffect, useState } from "react";

interface RoundOrderDialogProps {
  open: boolean;
  game: PadelGameWithRounds;
  isSaving: boolean;
  onSave: (roundIds: string[]) => void;
  onClose: () => void;
}

export const RoundOrderDialog = ({
  open,
  game,
  isSaving,
  onSave,
  onClose,
}: RoundOrderDialogProps) => {
  // Earlier series are finished, so only the current one can be reordered
  const seriesRounds = getCurrentPadelSeries(game.rounds).rounds;
  const [rounds, setRounds] = useState<PadelRoundWithMatches[]>(seriesRounds);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRounds(getCurrentPadelSeries(game.rounds).rounds);
      setHighlighted(null);
      setMessage(null);
    }
  }, [open, game.rounds]);

  const playerNames: Record<string, string> = {};
  for (const player of game.players) playerNames[player.id] = player.name;

  const originalNumber = (round: PadelRoundWithMatches) =>
    seriesRounds.indexOf(round) + 1;
  const isChanged = rounds.some(
    (round, index) => round.id !== seriesRounds[index]?.id,
  );
  const nextIndex = rounds.findIndex((round) => !isPadelRoundStarted(round));
  // With every player on court each round, nobody can get a break
  const someoneSitsOut = rounds.some(
    (round) =>
      !isPadelRoundStarted(round) &&
      getSittingOut(game.players, round).length > 0,
  );

  const move = (from: number, to: number) => {
    setRounds(movePadelRound(rounds, from, to));
    setMessage(null);
  };

  const giveBreak = (playerId: string) => {
    const name = playerNames[playerId];
    setHighlighted(playerId);
    const result = restPadelPlayerNext(rounds, playerId);
    if (!result) {
      setMessage(`${name} doesn't sit out any of the remaining rounds.`);
    } else if (result === rounds) {
      setMessage(`${name} already sits out round ${nextIndex + 1}.`);
    } else {
      setRounds(result);
      setMessage(`${name} now sits out round ${nextIndex + 1}.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order of rounds</DialogTitle>
          <DialogDescription>
            Move rounds up or down to change when they are played. Rounds that
            have a score stay where they are.
          </DialogDescription>
        </DialogHeader>

        {someoneSitsOut && (
          <div className="space-y-2 rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Coffee className="w-4 h-4" />
              Needs a break?
            </p>
            <p className="text-xs text-muted-foreground">
              Moves the next round the player sits out to be played next.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {game.players.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => giveBreak(player.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    highlighted === player.id
                      ? "border-amber-500 bg-amber-500/15"
                      : "border-border bg-background hover:border-foreground/30",
                  )}
                >
                  {player.name}
                </button>
              ))}
            </div>
            {message && <p className="text-sm">{message}</p>}
          </div>
        )}

        <ol className="space-y-2">
          {rounds.map((round, index) => {
            const started = isPadelRoundStarted(round);
            const resting = getSittingOut(game.players, round);
            const highlightRests = resting.some((p) => p.id === highlighted);
            const canMoveUp =
              movePadelRound(rounds, index, index - 1) !== rounds;
            const canMoveDown =
              movePadelRound(rounds, index, index + 1) !== rounds;
            const moved = originalNumber(round) !== index + 1;

            return (
              <li
                key={round.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  started ? "bg-muted/40 text-muted-foreground" : "bg-card",
                  highlightRests && "border-amber-500 bg-amber-500/10",
                )}
              >
                <div className="w-14 shrink-0">
                  <p className="text-sm font-semibold">Round {index + 1}</p>
                  {started ? (
                    <p className="text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {isPadelRoundPlayed(round) ? "Played" : "Started"}
                    </p>
                  ) : index === nextIndex ? (
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Next
                    </p>
                  ) : moved ? (
                    <p className="text-xs text-muted-foreground">
                      was {originalNumber(round)}
                    </p>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5 text-sm">
                  {round.matches.map((match) => (
                    <p key={match.id} className="truncate">
                      {round.matches.length > 1 && (
                        <span className="text-muted-foreground">
                          {match.court}:{" "}
                        </span>
                      )}
                      <PlayerNames
                        ids={match.team1}
                        names={playerNames}
                        highlighted={highlighted}
                      />
                      <span className="text-muted-foreground"> vs </span>
                      <PlayerNames
                        ids={match.team2}
                        names={playerNames}
                        highlighted={highlighted}
                      />
                    </p>
                  ))}
                  {resting.length > 0 && (
                    <p
                      className={cn(
                        "text-xs flex items-center gap-1",
                        highlightRests
                          ? "text-amber-700 dark:text-amber-400 font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      <Coffee className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {resting.map((p) => p.name).join(", ")}
                      </span>
                    </p>
                  )}
                </div>
                {!started && (
                  <div className="flex flex-col shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      disabled={!canMoveUp}
                      onClick={() => move(index, index - 1)}
                      aria-label={`Move round ${index + 1} up`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      disabled={!canMoveDown}
                      onClick={() => move(index, index + 1)}
                      aria-label={`Move round ${index + 1} down`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex gap-2 justify-end sticky bottom-0 bg-background pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            type="button"
            disabled={!isChanged}
            isLoading={isSaving}
            onClick={() =>
              onSave(
                game.rounds
                  .filter((round) => seriesRounds.indexOf(round) === -1)
                  .concat(rounds)
                  .map((round) => round.id),
              )
            }
          >
            Save order
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PlayerNames = ({
  ids,
  names,
  highlighted,
}: {
  ids: string[];
  names: Record<string, string>;
  highlighted: string | null;
}) => (
  <>
    {ids.map((id, index) => (
      <span key={id}>
        {index > 0 && " & "}
        <span
          className={cn(id === highlighted && "font-semibold text-foreground")}
        >
          {names[id]}
        </span>
      </span>
    ))}
  </>
);
