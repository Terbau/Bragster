import type { PadelGameWithRounds, PadelRoundWithMatches } from "@/types/padel";
import {
  getPadelGameStatus,
  getPadelUpNext,
  getSittingOut,
  padelCourtName,
} from "@/utils/padel";
import { Button } from "@/components/ui/button";
import { Coffee, Flag } from "lucide-react";
import { PadelMatchRow, padelPlayerNames } from "./PadelRoundCard";

type Match = PadelRoundWithMatches["matches"][number];

interface PadelUpNextProps {
  game: PadelGameWithRounds;
  /** Without it, the scores can't be changed */
  onPressMatch?: (match: Match, roundNumber: number) => void;
  /** Without it, the round can't be ended early */
  onEndRound?: (round: PadelRoundWithMatches, roundNumber: number) => void;
}

/** Who plays where right now, and who plays in the round after */
export const PadelUpNext = ({
  game,
  onPressMatch,
  onEndRound,
}: PadelUpNextProps) => {
  const upNext = getPadelUpNext(game.rounds);
  if (!upNext) return null;
  const { round, number, next } = upNext;
  const status = getPadelGameStatus(game);
  const playerNames = padelPlayerNames(game);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");
  const resting = getSittingOut(game.players, round);
  const restingNext = next ? getSittingOut(game.players, next) : [];
  const showCourts = round.matches.length > 1 || game.courtNames.length > 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          Now playing · Round {number}
          <span className="font-normal text-muted-foreground">
            of {status.totalRounds}
          </span>
        </h2>
        {onEndRound && (
          <Button
            variant="ghost"
            size="sm"
            className="-my-1 h-8 text-muted-foreground"
            onClick={() => onEndRound(round, number)}
          >
            <Flag className="w-4 h-4 mr-1.5" />
            End round
          </Button>
        )}
      </div>
      <div className="-mx-1">
        {round.matches.map((match) => (
          <PadelMatchRow
            key={match.id}
            match={match}
            courtName={
              showCourts
                ? padelCourtName(game.courtNames, match.court)
                : undefined
            }
            playerNames={playerNames}
            onPress={onPressMatch && (() => onPressMatch(match, number))}
          />
        ))}
      </div>
      {resting.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          Sitting out: {resting.map((p) => p.name).join(", ")}
        </p>
      )}

      <div className="border-t border-border pt-3 space-y-1 text-sm">
        <p className="text-xs font-medium text-muted-foreground">
          {next ? `Up next · Round ${number + 1}` : "Up next"}
        </p>
        {next ? (
          <>
            {next.matches.map((match) => (
              <p key={match.id}>
                {showCourts && (
                  <span className="text-muted-foreground">
                    {padelCourtName(game.courtNames, match.court)}:{" "}
                  </span>
                )}
                {names(match.team1)}
                <span className="text-muted-foreground"> vs </span>
                {names(match.team2)}
              </p>
            ))}
            {restingNext.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coffee className="w-3.5 h-3.5 shrink-0" />
                {restingNext.map((p) => p.name).join(", ")}
              </p>
            )}
          </>
        ) : number < status.totalRounds ? (
          <p className="text-muted-foreground">
            Round {number + 1} is drawn from the leaderboard when this round is
            finished.
          </p>
        ) : (
          <p className="text-muted-foreground">
            This is the last round
            {status.seriesCount > 1 ? ` of series ${status.series}` : ""}.
          </p>
        )}
      </div>
    </section>
  );
};
