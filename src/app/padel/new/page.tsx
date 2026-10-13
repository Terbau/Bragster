import { BackArrow } from "@/components/BackArrow/BackArrow";
import type { CreatePadelGameInput } from "@/types/padel";
import { isDefaultPadelGameName } from "@/utils/padel";
import { getPadelGame, getPreviousPadelPlayers } from "../actions";
import { NewPadelGameForm } from "./NewPadelGameForm";

interface Props {
  /** `from` is a game to play again with the same players and settings */
  searchParams: Promise<{ from?: string }>;
}

export default async function NewPadelGamePage({ searchParams }: Props) {
  const { from } = await searchParams;
  const [previousPlayers, template] = await Promise.all([
    getPreviousPadelPlayers(),
    from ? getPadelGame(from).catch(() => null) : null,
  ]);
  const initial: Partial<CreatePadelGameInput> | undefined = template
    ? {
        // A dated default name gets today's date instead
        name: isDefaultPadelGameName(template.name) ? "" : template.name,
        format: template.format,
        playerNames: template.players.map((player) => player.name),
        courts: template.courts,
        courtNames: template.courtNames,
        pointsPerMatch: template.pointsPerMatch,
        plannedRounds: template.plannedRounds ?? undefined,
      }
    : undefined;

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="space-y-4">
        <BackArrow
          href={template ? `/padel/${template.id}` : "/padel"}
          label={template ? template.name : "All games"}
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {template ? "Play again" : "New game"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {template
              ? "Same players and settings as last time. Change anything before you start."
              : "Add the players and choose how to play. The rounds are made for you."}
          </p>
        </div>
      </div>
      <NewPadelGameForm
        previousPlayers={previousPlayers.map((player) => player.name)}
        initial={initial}
      />
    </div>
  );
}
