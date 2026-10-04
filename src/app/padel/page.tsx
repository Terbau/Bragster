import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { padelGameInclude } from "@/types/padel";
import { formatDate } from "@/utils/date";
import { getPadelProgress, getPadelStandings } from "@/utils/padel";
import { ChevronRight, Plus, Trophy, Volleyball } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PadelPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect("/auth/sign-in");
  }

  const games = await prisma.padelGame.findMany({
    where: { userId: user.id },
    include: padelGameInclude,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Padel Americano
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Everyone partners with everyone once, and the points are added up.
            </p>
          </div>
          <Button asChild>
            <Link href="/padel/new">
              <Plus className="w-4 h-4 mr-1" />
              New game
            </Link>
          </Button>
        </div>

        {games.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
              <Volleyball className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No games yet</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add the players, pick the number of courts and points per match,
                and the rounds are made for you.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {games.map((game) => {
              const progress = getPadelProgress(game);
              const leader = progress.played
                ? getPadelStandings(game)[0]
                : undefined;
              return (
                <li key={game.id}>
                  <Link
                    href={`/padel/${game.id}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-foreground/20 hover:shadow-sm transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {progress.isFinished ? (
                        <Trophy className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Volleyball className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {game.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(game.createdAt)} · {game.players.length}{" "}
                        players ·{" "}
                        {progress.isFinished
                          ? `Won by ${leader?.name}`
                          : progress.currentRoundIndex >= 0
                            ? `Round ${progress.currentRoundIndex + 1} of ${game.rounds.length}`
                            : `${game.rounds.length} rounds`}
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
    </div>
  );
}
