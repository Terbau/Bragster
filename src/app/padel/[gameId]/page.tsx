import { BackArrow } from "@/components/BackArrow/BackArrow";
import { prisma } from "@/prisma";
import { padelPlayersPath, padelSpacePath } from "../_components/padelFormat";
import {
  getViewableGame,
  type PadelGameForUser,
  requireUser,
} from "../_lib/server";
import { getPadelMatchRatings } from "../actions";
import { PadelLiveView } from "../live/[token]/PadelLiveView";
import { PadelGameView } from "./PadelGameView";

interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function PadelGamePage({ params }: Params) {
  const { gameId } = await params;
  const user = await requireUser();
  const game = await getViewableGame(gameId, user.id).catch(
    (): PadelGameForUser | null => null,
  );

  if (!game) {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href="/padel" label="All spaces" />
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  const [space, matchRatings] = await Promise.all([
    prisma.padelSpace.findUniqueOrThrow({
      where: { id: game.spaceId },
      select: { id: true, name: true },
    }),
    getPadelMatchRatings(game.id),
  ]);
  const back = { href: padelSpacePath(space.id), label: space.name };

  // Linked players can follow the game, but not change it
  if (game.role === "PLAYER") {
    return (
      <PadelLiveView
        game={game}
        back={back}
        playersPath={padelPlayersPath(space.id)}
        matchRatings={matchRatings}
      />
    );
  }
  return (
    <PadelGameView
      game={game}
      back={back}
      playersPath={padelPlayersPath(space.id)}
      matchRatings={matchRatings}
    />
  );
}
