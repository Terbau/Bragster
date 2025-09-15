"use server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export const searchUsers = async (query: string) => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return redirect("/auth/sign-in");
  }

  if (!query || query.length < 2) {
    return [];
  }

  const userId = user.id;

  const users = await prisma.user.findMany({
    where: {
      email: { contains: query, mode: "insensitive" },
      id: { not: userId },
    },
  });

  return users;
};
