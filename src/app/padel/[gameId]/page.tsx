import { BackArrow } from "@/components/BackArrow/BackArrow";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { padelGameInclude } from "@/types/padel";
import { redirect } from "next/navigation";
import { PadelGameView } from "./PadelGameView";

interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function PadelGamePage({ params }: Params) {
  const { gameId } = await params;
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect("/auth/sign-in");
  }

  const game = await prisma.padelGame.findUnique({
    where: { id: gameId },
    include: padelGameInclude,
  });

  if (!game || game.userId !== user.id) {
    return (
      <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
        <BackArrow href="/padel" label="All games" />
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  return <PadelGameView game={game} />;
}
