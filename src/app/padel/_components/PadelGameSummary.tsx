import { Progress } from "@/components/ui/progress";
import type { PadelGameWithRounds } from "@/types/padel";
import { getPadelGameStatus, getPadelStandings } from "@/utils/padel";
import { Trophy } from "lucide-react";
import type { ReactNode } from "react";

interface PadelGameSummaryProps {
  game: PadelGameWithRounds;
  /** Shown next to the winner when the game is finished */
  finishedAction?: ReactNode;
}

/** The winner when the game is finished, otherwise how far it has come */
export const PadelGameSummary = ({
  game,
  finishedAction,
}: PadelGameSummaryProps) => {
  const status = getPadelGameStatus(game);

  if (status.isFinished) {
    const winner = getPadelStandings(game)[0];
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">{winner?.name}</span> won with{" "}
            {winner?.total} points
            {status.seriesCount > 1 ? " in total" : ""}!
          </p>
        </div>
        {finishedAction}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {status.seriesCount > 1 && `Series ${status.series} · `}
          Round {status.roundNumber} of {status.totalRounds}
        </span>
        <span>
          {status.matchesPlayed} of {status.matchesTotal} matches played
        </span>
      </div>
      <Progress
        value={(status.matchesPlayed / Math.max(1, status.matchesTotal)) * 100}
        className="h-2"
      />
    </div>
  );
};
