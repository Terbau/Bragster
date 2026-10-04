import type { PadelGameWithRounds } from "@/types/padel";
import { getPadelProgress, getPadelStandings } from "@/utils/padel";
import { cn } from "@/utils/utils";

const medalClasses: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-800",
  3: "bg-orange-300 text-orange-950",
};

export const PadelLeaderboard = ({ game }: { game: PadelGameWithRounds }) => {
  const standings = getPadelStandings(game);
  const { isFinished, played } = getPadelProgress(game);
  const hasCompensation = standings.some((s) => s.compensation > 0);
  const unevenGames = standings.some(
    (s) => s.scheduled !== standings[0].scheduled,
  );

  return (
    <div className="space-y-3">
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
