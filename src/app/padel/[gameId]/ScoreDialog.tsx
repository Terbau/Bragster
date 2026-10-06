"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PadelGameWithRounds } from "@/types/padel";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";

type Match = PadelGameWithRounds["rounds"][number]["matches"][number];

interface ScoreDialogProps {
  match: Match | null;
  roundNumber: number;
  pointsPerMatch: number;
  playerNames: Record<string, string>;
  onSave: (score: {
    team1Score: number | null;
    team2Score: number | null;
  }) => void;
  onClose: () => void;
}

/**
 * Pick one team's points, the other team gets the rest of the points of
 * the match.
 */
export const ScoreDialog = ({
  match,
  roundNumber,
  pointsPerMatch,
  playerNames,
  onSave,
  onClose,
}: ScoreDialogProps) => {
  const [team, setTeam] = useState<1 | 2>(1);
  const [team1Score, setTeam1Score] = useState<number | null>(null);

  useEffect(() => {
    if (match) {
      setTeam(1);
      setTeam1Score(match.team1Score);
    }
  }, [match]);

  const team2Score = team1Score === null ? null : pointsPerMatch - team1Score;
  const pointOptions = Array.from(
    { length: pointsPerMatch + 1 },
    (_, points) => points,
  );
  const selectedScore = team === 1 ? team1Score : team2Score;

  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");

  return (
    <Dialog open={match !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Round {roundNumber} · Court {match?.court}
          </DialogTitle>
          <DialogDescription>
            Tap a team, then its points. The other team gets the rest of the{" "}
            {pointsPerMatch}, and the score is saved.
          </DialogDescription>
        </DialogHeader>

        {match && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([1, 2] as const).map((side) => {
                const score = side === 1 ? team1Score : team2Score;
                const other = side === 1 ? team2Score : team1Score;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setTeam(side)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors",
                      team === side
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30",
                    )}
                  >
                    <span className="text-sm font-medium text-center leading-snug">
                      {names(side === 1 ? match.team1 : match.team2)}
                    </span>
                    <span
                      className={cn(
                        "text-4xl font-bold tabular-nums",
                        score === null && "text-muted-foreground",
                        score !== null &&
                          other !== null &&
                          score > other &&
                          "text-green-600 dark:text-green-500",
                      )}
                    >
                      {score ?? "–"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {pointOptions.map((points) => (
                <Button
                  key={points}
                  type="button"
                  variant={points === selectedScore ? "default" : "outline"}
                  size="sm"
                  className="px-0 tabular-nums"
                  onClick={() => {
                    // Picking the points finishes the match
                    const score1 =
                      team === 1 ? points : pointsPerMatch - points;
                    onSave({
                      team1Score: score1,
                      team2Score: pointsPerMatch - score1,
                    });
                  }}
                >
                  {points}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              {match.team1Score !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onSave({ team1Score: null, team2Score: null })}
                >
                  Clear score
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="ml-auto"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
