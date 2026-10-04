import { BackArrow } from "@/components/BackArrow/BackArrow";
import { getPreviousPadelPlayers } from "../actions";
import { NewPadelGameForm } from "./NewPadelGameForm";

export default async function NewPadelGamePage() {
  const previousPlayers = await getPreviousPadelPlayers();

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow href="/padel" label="All games" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New game</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Everyone partners with everyone once. The rounds are made when you
            create the game, and you can change their order later.
          </p>
        </div>
      </div>
      <NewPadelGameForm
        previousPlayers={previousPlayers.map((player) => player.name)}
      />
    </div>
  );
}
