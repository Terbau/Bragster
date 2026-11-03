import type { Metadata } from "next";
import { cache } from "react";
import { LiveRefresh } from "../../../_components/LiveRefresh";
import { PadelPlayersByDay } from "../../../_components/PadelPlayersByDay";
import { padelPlayersLivePath } from "../../../_components/padelFormat";
import {
  findSharedPadelSpace,
  loadPadelPlayerSummaries,
} from "../../../_lib/players";
import { NotShared } from "./NotShared";

interface Params {
  params: Promise<{ token: string }>;
}

// Cached so the title and the page share one query
const getSpace = cache(findSharedPadelSpace);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const space = await getSpace((await params).token);
  return {
    title: space ? `${space.name} · Players` : "Padel players",
    robots: { index: false, follow: false },
  };
}

/** The players and their ratings, for anyone with the link */
export default async function PadelPlayersLivePage({ params }: Params) {
  const { token } = await params;
  const space = await getSpace(token);
  if (!space) return <NotShared />;
  const players = await loadPadelPlayerSummaries(space.id);

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <LiveRefresh />
      <div>
        <p className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Players</h1>
        <p className="text-sm font-medium mt-1">{space.name}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Everyone by rating. Winning more of the points than expected against
          the other team raises the rating, and beating a stronger team counts
          the most. Open a player to see their form, partners and opponents.
        </p>
      </div>
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ratings show up here once a match has a score.
        </p>
      ) : (
        <PadelPlayersByDay
          players={players}
          basePath={padelPlayersLivePath(token)}
        />
      )}
    </div>
  );
}
