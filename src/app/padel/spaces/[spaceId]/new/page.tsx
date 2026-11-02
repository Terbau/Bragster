import { padelSpacePath } from "@/app/padel/_components/padelFormat";
import { SpaceNotFound } from "@/app/padel/_components/SpaceNotFound";
import {
  getPadelGame,
  getPadelPlayerSummaries,
  getPadelSpace,
  getPreviousPadelPlayers,
} from "@/app/padel/actions";
import { BackArrow } from "@/components/BackArrow/BackArrow";
import type { CreatePadelGameInput } from "@/types/padel";
import { isDefaultPadelGameName } from "@/utils/padel";
import { NewPadelGameForm } from "./NewPadelGameForm";

interface Props {
  params: Promise<{ spaceId: string }>;
  /** `from` is a game to play again with the same players and settings */
  searchParams: Promise<{ from?: string }>;
}

export default async function NewPadelGamePage({
  params,
  searchParams,
}: Props) {
  const [{ spaceId }, { from }] = await Promise.all([params, searchParams]);
  const space = await getPadelSpace(spaceId).catch(() => null);
  if (!space) return <SpaceNotFound />;
  if (space.role === "PLAYER") {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href={padelSpacePath(spaceId)} label={space.name} />
        <p className="text-muted-foreground">
          Only hosts can create games in {space.name}. Ask the owner to make you
          a host.
        </p>
      </div>
    );
  }

  const [previousPlayers, summaries, found] = await Promise.all([
    getPreviousPadelPlayers(spaceId),
    getPadelPlayerSummaries(spaceId),
    from ? getPadelGame(from).catch(() => null) : null,
  ]);
  const template = found?.spaceId === spaceId ? found : null;
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
          href={template ? `/padel/${template.id}` : padelSpacePath(spaceId)}
          label={template ? template.name : space.name}
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {template ? "Play again" : "New game"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {template
              ? "Same players and settings as last time. Change anything before you start."
              : `In ${space.name}. Add the players and choose how to play. The rounds are made for you.`}
          </p>
        </div>
      </div>
      <NewPadelGameForm
        spaceId={spaceId}
        previousPlayers={previousPlayers.map((player) => player.name)}
        ratings={Object.fromEntries(
          summaries.map((summary) => [summary.key, summary.rating]),
        )}
        initial={initial}
      />
    </div>
  );
}
