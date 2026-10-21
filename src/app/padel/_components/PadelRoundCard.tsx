import type { PadelGameWithRounds, PadelRoundWithMatches } from "@/types/padel";
import {
  getSittingOut,
  isPadelMatchPlayed,
  isPadelMatchSkipped,
  isPadelRoundPlayed,
  padelCourtName,
} from "@/utils/padel";
import { cn } from "@/utils/utils";
import { Check, Coffee, Video } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Match = PadelRoundWithMatches["matches"][number];

export type PadelGameInfo = Pick<PadelGameWithRounds, "players" | "courtNames">;

/** Player names by id */
export const padelPlayerNames = (game: Pick<PadelGameInfo, "players">) => {
  const names: Record<string, string> = {};
  for (const player of game.players) names[player.id] = player.name;
  return names;
};

interface PadelRoundCardProps {
  game: PadelGameInfo;
  round: PadelRoundWithMatches;
  title: ReactNode;
  isCurrent?: boolean;
  /** Without it, the scores can't be changed */
  onPressMatch?: (match: Match) => void;
  /** Links to the videos of filmed matches, by match id */
  videoHrefs?: Record<string, string>;
  className?: string;
}

export const PadelRoundCard = ({
  game,
  round,
  title,
  isCurrent = false,
  onPressMatch,
  videoHrefs,
  className,
}: PadelRoundCardProps) => {
  const isPlayed = isPadelRoundPlayed(round);
  const isEndedEarly = round.matches.some(isPadelMatchSkipped);
  const resting = getSittingOut(game.players, round);
  const playerNames = padelPlayerNames(game);

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 space-y-1",
        isCurrent ? "border-foreground/40 shadow-sm" : "border-border",
        isPlayed && "opacity-75",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-1 pb-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {isPlayed ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            {isEndedEarly && (
              <span className="text-xs text-muted-foreground">Ended early</span>
            )}
          </>
        ) : (
          isCurrent && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
              Now
            </span>
          )
        )}
      </div>
      {round.matches.map((match) => {
        const row = (
          <PadelMatchRow
            key={match.id}
            match={match}
            courtName={
              round.matches.length > 1 || game.courtNames.length > 0
                ? padelCourtName(game.courtNames, match.court)
                : undefined
            }
            playerNames={playerNames}
            onPress={onPressMatch && (() => onPressMatch(match))}
          />
        );
        const videoHref = videoHrefs?.[match.id];
        return videoHref ? (
          <div key={match.id} className="flex items-center gap-1">
            <div className="flex-1 min-w-0">{row}</div>
            <Link
              href={videoHref}
              aria-label="Watch the video"
              title="Watch the video"
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Video className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          row
        );
      })}
      {resting.length > 0 && (
        <p className="flex items-center gap-1.5 px-1 pt-1 text-xs text-muted-foreground">
          <Coffee className="w-3.5 h-3.5 shrink-0" />
          Sitting out: {resting.map((p) => p.name).join(", ")}
        </p>
      )}
    </div>
  );
};

export const PadelMatchRow = ({
  match,
  courtName,
  playerNames,
  onPress,
}: {
  match: Match;
  courtName?: string;
  playerNames: Record<string, string>;
  onPress?: () => void;
}) => {
  const isPlayed = isPadelMatchPlayed(match);
  const isSkipped = isPadelMatchSkipped(match);
  const team1Won =
    isPlayed && (match.team1Score ?? 0) > (match.team2Score ?? 0);
  const team2Won =
    isPlayed && (match.team2Score ?? 0) > (match.team1Score ?? 0);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");

  const content = (
    <>
      {courtName && (
        <span className="block text-[11px] text-muted-foreground text-center mb-1">
          {courtName}
        </span>
      )}
      <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span
          className={cn(
            "text-right",
            team1Won && "font-semibold",
            (team2Won || isSkipped) && "text-muted-foreground",
          )}
        >
          {names(match.team1)}
        </span>
        <span
          className={cn(
            "min-w-[4.5rem] rounded-md px-2 py-1 text-center tabular-nums font-semibold",
            isPlayed
              ? "bg-muted"
              : "border border-dashed border-border text-muted-foreground font-normal",
            !isPlayed && onPress && "group-hover:border-foreground/40",
          )}
        >
          {isPlayed
            ? `${match.team1Score} – ${match.team2Score}`
            : isSkipped
              ? "Not played"
              : onPress
                ? "Score"
                : "–"}
        </span>
        <span
          className={cn(
            team2Won && "font-semibold",
            (team1Won || isSkipped) && "text-muted-foreground",
          )}
        >
          {names(match.team2)}
        </span>
      </span>
    </>
  );

  return onPress ? (
    <button
      type="button"
      onClick={onPress}
      className="w-full rounded-lg px-1 py-2 text-sm hover:bg-accent transition-colors text-left group"
    >
      {content}
    </button>
  ) : (
    <div className="w-full px-1 py-2 text-sm">{content}</div>
  );
};
