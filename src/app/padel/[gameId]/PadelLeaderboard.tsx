"use client";

import type { PadelGameWithRounds } from "@/types/padel";
import {
  getPadelProgress,
  getPadelSeriesNumbers,
  getPadelStandings,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { useState } from "react";

const medalClasses: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-800",
  3: "bg-orange-300 text-orange-950",
};

export const PadelLeaderboard = ({ game }: { game: PadelGameWithRounds }) => {
  const seriesNumbers = getPadelSeriesNumbers(game.rounds);
  // `null` adds up every series
  const [scope, setScope] = useState<number | null>(null);
  const rounds =
    scope === null || !seriesNumbers.includes(scope)
      ? game.rounds
      : game.rounds.filter((round) => round.series === scope);
  const results = { players: game.players, rounds };
  const standings = getPadelStandings(results);
  const { isFinished, played } = getPadelProgress(results);
  const hasCompensation = standings.some((s) => s.compensation > 0);
  const unevenGames = standings.some(
    (s) => s.scheduled !== standings[0].scheduled,
  );

  return (
    <div className="space-y-3">
      {seriesNumbers.length > 1 && (
        <div className="flex flex-wrap bg-muted rounded-lg p-1 gap-1">
          {[null, ...seriesNumbers].map((option) => (
            <button
              key={option ?? "total"}
              type="button"
              onClick={() => setScope(option)}
              className={cn(
                "flex-1 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                (scope ?? null) === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === null ? "All series" : `Series ${option}`}
            </button>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pl-3 pr-1 text-left font-medium w-8">#</th>
              <th className="py-2 px-1 text-left font-medium">Player</th>
              <th
                className="py-2 px-1 text-right font-medium"
                title="Matches played"
              >
                Pl
              </th>
              <th className="py-2 px-1 text-right font-medium" title="Wins">
                W
              </th>
              <th
                className="py-2 px-1 text-right font-medium"
                title="Points won minus points lost"
              >
                +/-
              </th>
              <th className="py-2 pl-1 pr-3 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing) => (
              <tr
                key={standing.playerId}
                className="border-b border-border last:border-0"
              >
                <td className="py-2 pl-3 pr-1">
                  <span
                    className={cn(
                      "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                      played > 0 && medalClasses[standing.rank]
                        ? medalClasses[standing.rank]
                        : "text-muted-foreground",
                    )}
                  >
                    {standing.rank}
                  </span>
                </td>
                <td className="py-2 px-1 font-medium break-all">
                  {standing.name}
                </td>
                <td className="py-2 px-1 text-right tabular-nums text-muted-foreground">
                  {standing.played}
                  {unevenGames || !isFinished ? `/${standing.scheduled}` : ""}
                </td>
                <td className="py-2 px-1 text-right tabular-nums text-muted-foreground">
                  {standing.wins}
                </td>
                <td className="py-2 px-1 text-right tabular-nums text-muted-foreground">
                  {standing.difference > 0
                    ? `+${standing.difference}`
                    : standing.difference}
                </td>
                <td className="py-2 pl-1 pr-3 text-right tabular-nums font-semibold">
                  {standing.total}
                  {standing.compensation > 0 && "*"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {unevenGames && (
        <p className="text-xs text-muted-foreground">
          {hasCompensation ? "* " : ""}Players with one match less get their
          average score for it once they have played all their matches.
        </p>
      )}
    </div>
  );
};
