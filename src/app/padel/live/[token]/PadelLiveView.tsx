"use client";

import type { PadelGameWithRounds } from "@/types/padel";
import { getPadelGameStatus, padelFormatLabel } from "@/utils/padel";
import { cn } from "@/utils/utils";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PadelGameSummary } from "../../_components/PadelGameSummary";
import { PadelLeaderboard } from "../../_components/PadelLeaderboard";
import { PadelRoundsList } from "../../_components/PadelRoundsList";
import { PadelUpNext } from "../../_components/PadelUpNext";

/** How often new scores are fetched while the page is open */
const REFRESH_MS = 5000;
const FINISHED_REFRESH_MS = 30000;

/** A read-only view of a shared game that keeps itself up to date */
export const PadelLiveView = ({ game }: { game: PadelGameWithRounds }) => {
  const router = useRouter();
  const status = getPadelGameStatus(game);
  const [view, setView] = useState<"rounds" | "standings">(
    status.isFinished ? "standings" : "rounds",
  );

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = setInterval(
      refresh,
      status.isFinished ? FINISHED_REFRESH_MS : REFRESH_MS,
    );
    // Phones pause the page when the screen locks
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, status.isFinished]);

  return (
    <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-10 space-y-8">
      <div className="space-y-4">
        <div>
          <p
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              status.isFinished
                ? "bg-muted text-muted-foreground"
                : "bg-green-500/15 text-green-700 dark:text-green-400",
            )}
          >
            {!status.isFinished && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            {status.isFinished ? "Finished" : "Live"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {game.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {padelFormatLabel(game.format)} · {game.players.length} players ·{" "}
            {game.courts} {game.courts === 1 ? "court" : "courts"} ·{" "}
            {game.pointsPerMatch} points per match
          </p>
        </div>
        <PadelGameSummary game={game} />
      </div>

      <PadelUpNext game={game} />

      <div className="flex bg-muted rounded-lg p-1 gap-1 lg:hidden">
        {(
          [
            ["rounds", "Rounds"],
            ["standings", "Leaderboard"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              view === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className={cn(view !== "rounds" && "hidden lg:block")}>
          <PadelRoundsList game={game} />
        </div>
        <aside
          className={cn(
            "space-y-3 lg:sticky lg:top-6",
            view !== "standings" && "hidden lg:block",
          )}
        >
          <h2 className="font-semibold flex items-center gap-1.5">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </h2>
          <PadelLeaderboard game={game} />
        </aside>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Updates by itself as scores are entered.
      </p>
    </div>
  );
};
