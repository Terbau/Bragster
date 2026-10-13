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
import { Input } from "@/components/ui/input";
import type { PadelGameWithRounds, UpdatePadelGameInput } from "@/types/padel";
import {
  isPadelRoundStarted,
  MAX_PADEL_COURT_NAME_LENGTH,
  MAX_PADEL_ROUNDS,
} from "@/utils/padel";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePadelGame } from "../actions";

interface EditGameDialogProps {
  open: boolean;
  game: PadelGameWithRounds;
  onSaved: (game: PadelGameWithRounds) => void;
  onClose: () => void;
}

const courtNamesOf = (game: PadelGameWithRounds) =>
  Array.from({ length: game.courts }, (_, i) => game.courtNames[i] ?? "");

export const EditGameDialog = ({
  open,
  game,
  onSaved,
  onClose,
}: EditGameDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(game.name);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [courtNames, setCourtNames] = useState(courtNamesOf(game));
  const [rounds, setRounds] = useState(game.plannedRounds ?? 0);
  const isMexicano = game.format === "MEXICANO";
  const minRounds = Math.max(1, game.rounds.filter(isPadelRoundStarted).length);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on open only
  useEffect(() => {
    if (open) {
      setName(game.name);
      setPlayerNames(
        Object.fromEntries(game.players.map((p) => [p.id, p.name])),
      );
      setCourtNames(courtNamesOf(game));
      setRounds(game.plannedRounds ?? 0);
    }
  }, [open]);

  const trimmed = (id: string) => (playerNames[id] ?? "").trim();
  const playerError = (id: string) => {
    const value = trimmed(id);
    if (!value) return "Enter a name";
    if (value.length > 30) return "Use at most 30 characters";
    const isTaken = game.players.some(
      (other) =>
        other.id !== id &&
        trimmed(other.id).toLowerCase() === value.toLowerCase(),
    );
    return isTaken ? "Two players have this name" : null;
  };
  const hasErrors =
    !name.trim() || game.players.some((player) => playerError(player.id));

  const save = () => {
    const changes: UpdatePadelGameInput = {};
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
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    startTransition(async () => {
      try {
        onSaved(await updatePadelGame(game.id, changes));
        toast.success("Game updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit game</DialogTitle>
          <DialogDescription>
            Fix a name that was spelled wrong, or give the courts the names they
            have where you play.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!hasErrors) save();
          }}
        >
          <section className="space-y-2">
            <label htmlFor="edit-game-name" className="text-sm font-semibold">
              Name
            </label>
            <Input
              id="edit-game-name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Players</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {game.players.map((player, index) => {
                const error = playerError(player.id);
                return (
                  <div key={player.id} className="space-y-1">
                    <Input
                      value={playerNames[player.id] ?? ""}
                      maxLength={30}
                      aria-label={`Player ${index + 1}`}
                      aria-invalid={!!error}
                      className={error ? "border-destructive" : undefined}
                      onChange={(event) =>
                        setPlayerNames((current) => ({
                          ...current,
                          [player.id]: event.target.value,
                        }))
                      }
                    />
                    {error && (
                      <p className="text-xs text-destructive">{error}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Court names</h3>
            <div className="grid grid-cols-2 gap-2">
              {courtNames.map((court, index) => (
                <Input
                  // biome-ignore lint/suspicious/noArrayIndexKey: courts are numbered
                  key={index}
                  value={court}
                  maxLength={MAX_PADEL_COURT_NAME_LENGTH}
                  placeholder={`Court ${index + 1}`}
                  aria-label={`Name of court ${index + 1}`}
                  onChange={(event) =>
                    setCourtNames((current) =>
                      current.map((c, i) =>
                        i === index ? event.target.value : c,
                      ),
                    )
                  }
                />
              ))}
            </div>
          </section>

          {isMexicano && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Rounds</h3>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={rounds <= minRounds}
                  onClick={() => setRounds(rounds - 1)}
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
                  onClick={() => setRounds(rounds + 1)}
                  aria-label="More rounds"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Rounds that have been played can&apos;t be removed.
              </p>
            </section>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              disabled={hasErrors}
              isLoading={isPending}
            >
              Save
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
