import type { PadelGameWithRounds, PadelRoundWithMatches } from "@/types/padel";
import {
  getCurrentPadelSeries,
  getPadelGameStatus,
  getPadelProgress,
  getPadelSeriesNumbers,
} from "@/utils/padel";
import type { PadelMatchRating } from "@/utils/padelStats";
import { ChevronRight, Shuffle } from "lucide-react";
import { PadelRoundCard } from "./PadelRoundCard";

type Match = PadelRoundWithMatches["matches"][number];

interface PadelRoundsListProps {
  game: PadelGameWithRounds;
  /** Without it, the scores can't be changed */
  onPressMatch?: (match: Match, roundNumber: number) => void;
  /** Links to the videos of filmed matches, by match id */
  videoHrefs?: Record<string, string>;
  /** The ratings in played matches, by match id */
  matchRatings?: Record<string, PadelMatchRating>;
}

/** Every round, grouped by series. Finished series are folded away. */
export const PadelRoundsList = ({
  game,
  onPressMatch,
  videoHrefs,
  matchRatings,
}: PadelRoundsListProps) => {
  const seriesNumbers = getPadelSeriesNumbers(game.rounds);
  const current = getCurrentPadelSeries(game.rounds);
  const { currentRoundIndex } = getPadelProgress(game);
  const status = getPadelGameStatus(game);
  // Mexicano rounds are drawn one at a time
  const roundsToDraw = status.totalRounds - current.rounds.length;

  return (
    <div className="space-y-6">
      {seriesNumbers.map((series) => {
        const rounds = game.rounds.filter((r) => r.series === series);
        const list = (
          <ol key={series} className="space-y-3">
            {rounds.map((round, index) => (
              <li key={round.id}>
                <PadelRoundCard
                  game={game}
                  round={round}
                  title={`Round ${index + 1}`}
                  isCurrent={game.rounds.indexOf(round) === currentRoundIndex}
                  onPressMatch={
                    onPressMatch && ((match) => onPressMatch(match, index + 1))
                  }
                  videoHrefs={videoHrefs}
                  matchRatings={matchRatings}
                />
              </li>
            ))}
            {series === current.series && roundsToDraw > 0 && (
              <li className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                <Shuffle className="w-4 h-4 shrink-0" />
                {roundsToDraw === 1
                  ? `Round ${current.rounds.length + 1} is drawn from the leaderboard when the round before it is finished.`
                  : `Rounds ${current.rounds.length + 1}–${status.totalRounds} are drawn from the leaderboard, one at a time.`}
              </li>
            )}
          </ol>
        );

        if (seriesNumbers.length === 1) return <div key={series}>{list}</div>;
        return series === current.series ? (
          <section key={series} className="space-y-3">
            <h2 className="font-semibold">Series {series}</h2>
            {list}
          </section>
        ) : (
          <details key={series} className="group space-y-3">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold">
              <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
              Series {series}
              <span className="text-sm font-normal text-muted-foreground">
                · {rounds.length} rounds played
              </span>
            </summary>
            {list}
          </details>
        );
      })}
    </div>
  );
};
