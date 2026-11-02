import {
  padelPlayersPath,
  padelSpacePath,
} from "@/app/padel/_components/padelFormat";
import { padelRoleDescription } from "@/app/padel/_components/padelRoles";
import { SpaceNotFound } from "@/app/padel/_components/SpaceNotFound";
import { getPadelSpace, getPadelSpaceGames } from "@/app/padel/actions";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import {
  getPadelGameStatus,
  getPadelStandings,
  padelFormatLabel,
} from "@/utils/padel";
import {
  ChevronRight,
  Plus,
  Settings,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

interface Params {
  params: Promise<{ spaceId: string }>;
}

export const metadata: Metadata = { title: "Padel" };

export default async function PadelSpacePage({ params }: Params) {
  const { spaceId } = await params;
  const space = await getPadelSpace(spaceId).catch(() => null);
  if (!space) return <SpaceNotFound />;
  const games = await getPadelSpaceGames(spaceId);
  const canHost = space.role !== "PLAYER";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All spaces" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight break-words">
              {space.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {padelRoleDescription(space.role, space.owner.email)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Settings" asChild>
              <Link href={`${padelSpacePath(spaceId)}/settings`}>
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={padelPlayersPath(spaceId)}>
                <Users className="w-4 h-4 mr-1.5" />
                Players
              </Link>
            </Button>
            {canHost && (
              <Button asChild>
                <Link href={`${padelSpacePath(spaceId)}/new`}>
                  <Plus className="w-4 h-4 mr-1" />
                  New game
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Volleyball className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No games yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              {canHost
                ? "Add the players, pick the number of courts and points per match, and the rounds are made for you."
                : "The games show up here once a host has created one."}
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {games.map((game) => {
            const status = getPadelGameStatus(game);
            const winner = status.isFinished
              ? getPadelStandings(game)[0]
              : undefined;
            return (
              <li key={game.id}>
                <Link
                  href={`/padel/${game.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {winner ? (
                      <Trophy className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Volleyball className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{game.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(game.createdAt)} ·{" "}
                      {padelFormatLabel(game.format)} · {game.players.length}{" "}
                      players ·{" "}
                      {winner
                        ? `Won by ${winner.name}`
                        : `${status.seriesCount > 1 ? `Series ${status.series} · ` : ""}Round ${status.roundNumber} of ${status.totalRounds}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
