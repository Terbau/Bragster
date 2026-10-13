import { prisma } from "@/prisma";
import { padelGameInclude } from "@/types/padel";
import { Radio } from "lucide-react";
import type { Metadata } from "next";
import { cache } from "react";
import { PadelLiveView } from "./PadelLiveView";

interface Params {
  params: Promise<{ token: string }>;
}

// Anyone with the link can see the game, so no sign in is needed. Cached
// so the title and the page share one query.
const getSharedGame = cache((token: string) =>
  prisma.padelGame.findUnique({
    where: { shareToken: token },
    include: padelGameInclude,
  }),
);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const game = await getSharedGame(token);
  return {
    title: game ? `${game.name} · Live` : "Padel",
    robots: { index: false, follow: false },
  };
}

export default async function PadelLivePage({ params }: Params) {
  const { token } = await params;
  const game = await getSharedGame(token);

  if (!game) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-3">
        <div className="w-11 h-11 mx-auto rounded-xl bg-muted flex items-center justify-center">
          <Radio className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">This game isn&apos;t shared</h1>
        <p className="text-sm text-muted-foreground">
          The link may have been turned off. Ask the person keeping score for a
          new one.
        </p>
      </div>
    );
  }

  // Who made the game stays private
  return <PadelLiveView game={{ ...game, userId: "" }} />;
}
