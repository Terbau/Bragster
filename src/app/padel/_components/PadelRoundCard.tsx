import type { PadelGameWithRounds, PadelRoundWithMatches } from "@/types/padel";
import {
  getSittingOut,
  isPadelMatchPlayed,
  isPadelMatchSkipped,
  isPadelRoundPlayed,
  padelCourtName,
} from "@/utils/padel";
import {
  PADEL_UPSET_CHANCE,
  type PadelMatchRating,
  padelWinChances,
} from "@/utils/padelStats";
import { cn } from "@/utils/utils";
import { Check, Coffee } from "lucide-react";
import type { ReactNode } from "react";
import { chancePercent, changeClass, signed } from "./padelFormat";

type Match = PadelRoundWithMatches["matches"][number];

export type PadelGameInfo = Pick<
  PadelGameWithRounds,
  "players" | "courtNames" | "pointsPerMatch"
>;

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
  /** The ratings in the matches, by match id */
  matchRatings?: Record<string, PadelMatchRating>;
  className?: string;
}

export const PadelRoundCard = ({
  game,
  round,
  title,
  isCurrent = false,
  onPressMatch,
  matchRatings,
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
      {round.matches.map((match) => (
        <PadelMatchRow
          key={match.id}
          match={match}
          courtName={
            round.matches.length > 1 || game.courtNames.length > 0
              ? padelCourtName(game.courtNames, match.court)
              : undefined
          }
          playerNames={playerNames}
          rating={matchRatings?.[match.id]}
          pointsPerMatch={game.pointsPerMatch}
          onPress={onPressMatch && (() => onPressMatch(match))}
        />
      ))}
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
  rating,
  pointsPerMatch,
  onPress,
}: {
  match: Match;
  courtName?: string;
  playerNames: Record<string, string>;
  /**
   * Shown under the teams, with how the ratings changed once the match is
   * played, and each team's chance to win before
   */
  rating?: PadelMatchRating;
  /** The scores add up to this, needed for the chances */
  pointsPerMatch: number;
  onPress?: () => void;
}) => {
  const isPlayed = isPadelMatchPlayed(match);
  const isSkipped = isPadelMatchSkipped(match);
  const team1Won =
    isPlayed && (match.team1Score ?? 0) > (match.team2Score ?? 0);
  const team2Won =
    isPlayed && (match.team2Score ?? 0) > (match.team1Score ?? 0);
  const names = (ids: string[]) => ids.map((id) => playerNames[id]).join(" & ");
  const chances =
    rating && !isSkipped
      ? padelWinChances(rating.team1Rating, rating.team2Rating, pointsPerMatch)
      : null;
  const winnerChance = team1Won
    ? chances?.team1
    : team2Won
      ? chances?.team2
      : undefined;
  const isUpset =
    winnerChance !== undefined && winnerChance < PADEL_UPSET_CHANCE;

  const content = (
    <>
      {courtName && (
        <span className="block text-[11px] text-muted-foreground text-center mb-1">
          {courtName}
        </span>
      )}
      <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-0.5">
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
        {isPlayed && rating && (
          <>
            <TeamRating
              team={match.team1}
              teamRating={rating.team1Rating}
              rating={rating}
              playerNames={playerNames}
              className="text-right"
            />
            {isUpset && winnerChance !== undefined ? (
              <span
                className="justify-self-center rounded-full bg-amber-100 px-1.5 text-[11px] font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-300"
                title={`${names(team1Won ? match.team1 : match.team2)} had a ${chancePercent(winnerChance)} chance to win`}
              >
                Upset
              </span>
            ) : (
              <span />
            )}
            <TeamRating
              team={match.team2}
              teamRating={rating.team2Rating}
              rating={rating}
              playerNames={playerNames}
            />
          </>
        )}
        {!isPlayed && rating && chances && (
          <>
            <WinChance
              teamRating={rating.team1Rating}
              chance={chances.team1}
              className="text-right"
            />
            <span className="text-center text-xs text-muted-foreground tabular-nums">
              {chances.draw >= 0.005 && `${chancePercent(chances.draw)} draw`}
            </span>
            <WinChance teamRating={rating.team2Rating} chance={chances.team2} />
          </>
        )}
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

/** The team's average rating now, and its chance to win from the ratings */
const WinChance = ({
  teamRating,
  chance,
  className,
}: {
  teamRating: number;
  chance: number;
  className?: string;
}) => (
  <span className={cn("text-xs text-muted-foreground tabular-nums", className)}>
    {teamRating} avg · {chancePercent(chance)} to win
  </span>
);

/**
 * The team's average rating when the match was played, and how much each
 * player's rating changed. Partners always change by the same amount.
 */
const TeamRating = ({
  team,
  teamRating,
  rating,
  playerNames,
  className,
}: {
  team: string[];
  teamRating: number;
  rating: PadelMatchRating;
  playerNames: Record<string, string>;
  className?: string;
}) => {
  const players = team.flatMap((id) =>
    rating.players[id]
      ? [{ name: playerNames[id], ...rating.players[id] }]
      : [],
  );
  const isSame = players.every((p) => p.change === players[0]?.change);
  return (
    <span
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      title={players
        .map((p) => `${p.name}: ${p.before} → ${p.before + p.change}`)
        .join("\n")}
    >
      {teamRating} avg ·{" "}
      {isSame && players.length > 0 ? (
        <span className={changeClass(players[0].change)}>
          {signed(players[0].change)} each
        </span>
      ) : (
        players.map((p, index) => (
          <span key={p.name}>
            {index > 0 && ", "}
            {p.name}{" "}
            <span className={changeClass(p.change)}>{signed(p.change)}</span>
          </span>
        ))
      )}
    </span>
  );
};
