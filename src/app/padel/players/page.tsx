import { BackArrow } from "@/components/BackArrow/BackArrow";
import { Users } from "lucide-react";
import { PadelPlayersTable } from "../_components/PadelPlayersTable";
import { getPadelPlayerSummaries } from "../actions";
import { SharePlayersButton } from "./SharePlayersButton";

export default async function PadelPlayersPage() {
  const players = await getPadelPlayerSummaries();

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All games" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Players</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Everyone you have played with, by rating. Winning more of the
              points than expected against the other team raises the rating, and
              beating a stronger team counts the most.
            </p>
          </div>
          <SharePlayersButton />
        </div>
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No players yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ratings and stats show up here once a match has a score.
            </p>
          </div>
        </div>
      ) : (
        <PadelPlayersTable players={players} basePath="/padel/players" />
      )}
    </div>
  );
}
