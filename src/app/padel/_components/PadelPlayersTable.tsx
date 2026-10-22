import type { PadelPlayerSummary } from "@/utils/padelStats";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { percent, playerHref } from "./padelFormat";
import { TodayRatingChange } from "./TodayRatingChange";

/**
 * Everyone, highest rating first. `basePath` is where the players list is, so
 * the links stay on the same (private or shared) pages.
 */
export const PadelPlayersTable = ({
  players,
  basePath,
}: {
  players: PadelPlayerSummary[];
  basePath: string;
}) => (
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
                href={playerHref(player.key, basePath)}
                className="after:absolute after:inset-0"
              >
                {player.name}
              </Link>
            </td>
            <td className="py-3 px-2 text-right tabular-nums font-semibold whitespace-nowrap">
              <TodayRatingChange
                rating={player.rating}
                recentGames={player.recentGames}
              />{" "}
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
);
