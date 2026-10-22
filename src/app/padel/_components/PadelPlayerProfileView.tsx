import { BackArrow } from "@/components/BackArrow/BackArrow";
import { formatDate } from "@/utils/date";
import { padelFormatLabel } from "@/utils/padel";
import type {
  PadelMatchOutcome,
  PadelPlayerRelation,
} from "@/utils/padelStats";
import {
  LONG_RALLY_SECONDS,
  type PadelPlayerVideoStats,
  SHORT_RALLY_SECONDS,
} from "@/utils/padelVideo";
import { cn } from "@/utils/utils";
import { Trophy, Video } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  differencePerMatch,
  formatPlayTime,
  formatRallyLength,
  ordinal,
  percent,
  playerHref,
  pointShare,
  signed,
  videoHref,
} from "./padelFormat";
import type { PadelPlayerProfileWithVideo } from "../_lib/players";
import { RatingChange } from "./RatingChange";

/**
 * A player's rating and stats. `basePath` is where the players list is, so
 * links to other players stay on the same (private or shared) pages.
 * `isPublic` leaves out links to the owner's games and videos.
 */
export const PadelPlayerProfileView = ({
  profile,
  basePath,
  isPublic = false,
}: {
  profile: PadelPlayerProfileWithVideo;
  basePath: string;
  isPublic?: boolean;
}) => {
  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-10">
      <div className="space-y-4">
        <BackArrow href={basePath} label="All players" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ordinal(profile.ratingRank)} of {profile.playerCount} by rating ·
              Last played {formatDate(new Date(profile.lastPlayedAt))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-5xl font-semibold tracking-tight">
              {profile.rating}
            </p>
            <RatingChange
              rating={profile.rating}
              history={profile.history.map((game) => ({
                createdAt: game.createdAt,
                ratingBefore: game.ratingBefore,
                ratingChange: game.ratingChange,
              }))}
            />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          label="Games"
          value={profile.games}
          detail={`${profile.gamesWon} won`}
        />
        <StatTile
          label="Matches"
          value={profile.matches}
          detail={`${profile.wins} W · ${profile.draws} D · ${profile.losses} L`}
        />
        <StatTile
          label="Matches won"
          value={percent(profile.wins, profile.matches)}
        />
        <StatTile
          label="Points won"
          value={pointShare(profile)}
          detail={`${differencePerMatch(profile)} per match`}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-semibold">Form</h2>
          <p className="text-xs text-muted-foreground">
            Last {profile.form.length} matches, newest first
          </p>
        </div>
        <FormStrip form={profile.form} />
      </section>

      {(profile.bestPartner ||
        profile.toughestOpponent ||
        profile.favouriteOpponent) && (
        <section className="grid sm:grid-cols-3 gap-3">
          {profile.bestPartner && (
            <Highlight
              basePath={basePath}
              label="Best partner"
              relation={profile.bestPartner}
              detail="together"
            />
          )}
          {profile.favouriteOpponent && (
            <Highlight
              basePath={basePath}
              label="Favourite opponent"
              relation={profile.favouriteOpponent}
              detail="against"
            />
          )}
          {profile.toughestOpponent && (
            <Highlight
              basePath={basePath}
              label="Toughest opponent"
              relation={profile.toughestOpponent}
              detail="against"
            />
          )}
        </section>
      )}

      {profile.video && (
        <VideoStats video={profile.video} showVideoLink={!isPublic} />
      )}

      <section className="grid md:grid-cols-2 gap-8">
        <RelationTable
          title="Partners"
          relations={profile.partners}
          basePath={basePath}
        />
        <RelationTable
          title="Opponents"
          relations={profile.opponents}
          basePath={basePath}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Games</h2>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {profile.history.map((game) => (
            <li key={game.gameId}>
              <MaybeLink
                href={isPublic ? null : `/padel/${game.gameId}`}
                className="flex items-center gap-4 px-4 py-3"
              >
                <div className="w-9 shrink-0 text-center">
                  {game.isFinished && game.rank === 1 ? (
                    <Trophy
                      className="w-5 h-5 mx-auto text-amber-500"
                      aria-label="Won"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {ordinal(game.rank)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{game.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(game.createdAt))} ·{" "}
                    {padelFormatLabel(game.format)} · {ordinal(game.rank)} of{" "}
                    {game.playerCount}
                    {game.isFinished ? "" : " so far"} · {game.total} points
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    game.ratingChange > 0
                      ? "text-green-700 dark:text-green-400"
                      : game.ratingChange < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-muted-foreground",
                  )}
                  title="Change in rating"
                >
                  {signed(game.ratingChange)}
                </span>
              </MaybeLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

/** A link, or the same without one */
const MaybeLink = ({
  href,
  className,
  children,
}: {
  href: string | null;
  className: string;
  children: ReactNode;
}) =>
  href ? (
    <Link
      href={href}
      className={cn(className, "hover:bg-accent/50 transition-colors")}
    >
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );

const StatTile = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-semibold mt-0.5">{value}</p>
    {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
  </div>
);

const outcomeStyles: Record<
  PadelMatchOutcome,
  { label: string; className: string }
> = {
  W: {
    label: "Won",
    className: "bg-green-600 text-white dark:bg-green-500 dark:text-green-950",
  },
  D: { label: "Draw", className: "bg-muted text-muted-foreground" },
  L: {
    label: "Lost",
    className: "bg-red-600 text-white dark:bg-red-500 dark:text-red-950",
  },
};

const FormStrip = ({ form }: { form: PadelMatchOutcome[] }) => (
  <ol className="flex flex-wrap gap-1.5">
    {form.map((outcome, index) => (
      <li
        // biome-ignore lint/suspicious/noArrayIndexKey: matches in order
        key={index}
        title={outcomeStyles[outcome].label}
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold",
          outcomeStyles[outcome].className,
        )}
      >
        {outcome}
      </li>
    ))}
  </ol>
);

const Highlight = ({
  basePath,
  label,
  relation,
  detail,
}: {
  basePath: string;
  label: string;
  relation: PadelPlayerRelation;
  detail: string;
}) => (
  <Link
    href={playerHref(relation.key, basePath)}
    className="rounded-xl border border-border bg-card px-4 py-3 hover:border-foreground/20 transition-colors"
  >
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-semibold mt-0.5 truncate">{relation.name}</p>
    <p className="text-xs text-muted-foreground mt-0.5">
      {pointShare(relation)} of the points {detail} · {relation.matches} matches
    </p>
  </Link>
);

const RelationTable = ({
  title,
  relations,
  basePath,
}: {
  title: string;
  relations: PadelPlayerRelation[];
  basePath: string;
}) => (
  <div className="space-y-3">
    <h2 className="font-semibold">{title}</h2>
    {relations.length === 0 ? (
      <p className="text-sm text-muted-foreground">Nobody yet.</p>
    ) : (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="py-2 pl-3 pr-1 text-left font-medium">Player</th>
              <th className="py-2 px-1 text-right font-medium" title="Matches">
                M
              </th>
              <th className="py-2 px-1 text-right font-medium">W-D-L</th>
              <th
                className="py-2 pl-1 pr-3 text-right font-medium"
                title="Points won minus lost, per match"
              >
                +/-
              </th>
            </tr>
          </thead>
          <tbody>
            {relations.map((relation) => (
              <tr
                key={relation.key}
                className="border-b border-border last:border-0"
              >
                <td className="py-2 pl-3 pr-1 font-medium">
                  <Link
                    href={playerHref(relation.key, basePath)}
                    className="hover:underline underline-offset-2"
                  >
                    {relation.name}
                  </Link>
                </td>
                <td className="py-2 px-1 text-right tabular-nums text-muted-foreground">
                  {relation.matches}
                </td>
                <td className="py-2 px-1 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                  {relation.wins}-{relation.draws}-{relation.losses}
                </td>
                <td className="py-2 pl-1 pr-3 text-right tabular-nums">
                  {differencePerMatch(relation)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const VideoStats = ({
  video,
  showVideoLink,
}: {
  video: PadelPlayerVideoStats;
  showVideoLink: boolean;
}) => (
  <section className="space-y-3">
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-semibold flex items-center gap-1.5">
        <Video className="w-4 h-4" />
        From the videos
      </h2>
      <p className="text-xs text-muted-foreground">
        {video.matches} filmed {video.matches === 1 ? "match" : "matches"}
      </p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatTile
        label="Rallies"
        value={video.rallies}
        detail={`${formatPlayTime(video.playTime)} in play`}
      />
      <StatTile
        label="Average rally"
        value={formatRallyLength(video.averageRally)}
        detail={
          video.longestRally
            ? `Longest ${formatRallyLength(video.longestRally.duration)}`
            : undefined
        }
      />
      <StatTile
        label="Long rallies won"
        value={percent(video.longWon, video.longDecided)}
        detail={`${formatRallyLength(LONG_RALLY_SECONDS)} or more`}
      />
      <StatTile
        label="Quick points won"
        value={percent(video.shortWon, video.shortDecided)}
        detail={`Under ${formatRallyLength(SHORT_RALLY_SECONDS)}`}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      Who won is known for {video.decided} of the {video.rallies} rallies.
      {showVideoLink && video.longestRallyWon && (
        <>
          {" "}
          <Link
            href={videoHref(
              video.longestRallyWon.gameId,
              video.longestRallyWon.recordingId,
              { rallyId: video.longestRallyWon.rallyId },
            )}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Watch the longest rally won (
            {formatRallyLength(video.longestRallyWon.duration)})
          </Link>
        </>
      )}
    </p>
  </section>
);
