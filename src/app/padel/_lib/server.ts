import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { type PadelGameWithRounds, padelGameInclude } from "@/types/padel";
import { redirect } from "next/navigation";

export const requireUser = async () => {
  const session = await getSession();
  if (!session?.user) {
    return redirect("/auth/sign-in");
  }
  return session.user;
};

export const getOwnedGame = async (
  gameId: string,
  userId: string,
): Promise<PadelGameWithRounds> => {
  const game = await prisma.padelGame.findUnique({
    where: { id: gameId },
    include: padelGameInclude,
  });
  // Other users' games are reported as missing
  if (!game || game.userId !== userId) {
    throw new Error("Game not found");
  }
  return game;
};
