import { BackArrow } from "@/components/BackArrow/BackArrow";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { percent, playerHref } from "../_components/padelFormat";
import { getPadelPlayerSummaries } from "../actions";

export default async function PadelPlayersPage() {
  const players = await getPadelPlayerSummaries();

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All games" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Everyone you have played with, by rating. Winning more of the points
            than expected against the other team raises the rating, and beating
            a stronger team counts the most.
          </p>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No players yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ratings and stats show up here once a match has a score.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 pl-4 pr-1 text-left font-medium w-10">#</th>
                <th className="py-2 px-1 text-left font-medium">Player</th>
                <th className="py-2 px-2 text-right font-medium">Rating</th>
                <th className="py-2 px-2 text-right font-medium hidden sm:table-cell">
                  Matches
                </th>
                <th className="py-2 px-2 text-right font-medium">Wins</th>
                <th className="py-2 px-2 text-right font-medium hidden sm:table-cell">
                  Games won
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.key}
                  className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors relative"
                >
                  <td className="py-3 pl-4 pr-1 tabular-nums text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-3 px-1 font-medium">
                    {/* The link covers the whole row */}
                    <Link
                      href={playerHref(player.key)}
                      className="after:absolute after:inset-0"
                    >
                      {player.name}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums font-semibold">
                    {player.rating}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                    {player.matches}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                    {percent(player.wins, player.matches)}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                    {player.gamesWon}
                  </td>
                  <td className="py-3 pr-3">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
