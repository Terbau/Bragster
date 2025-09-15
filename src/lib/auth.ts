import {
  getServerSession,
  type Account,
  type AuthOptions,
  type Profile,
  type Session,
  type User,
} from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import type { AdapterUser } from "next-auth/adapters";
import { prisma } from "@/prisma";

if (
  !process.env.AUTH0_CLIENT_ID ||
  !process.env.AUTH0_CLIENT_SECRET ||
  !process.env.AUTH0_ISSUER
) {
  throw new Error("AUTH0 environment variables not found");
}

export const authOptions: AuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async signIn({
      user,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile | undefined;
    }) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email ?? "",
          avatarUrl: user.image,
        },
        create: {
          id: user.id,
          email: user.email ?? "",
          avatarUrl: user.image,
        },
      });

      return true;
    },
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    async session({ session, token }: any): Promise<Session> {
      const userId = token.sub;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { admin: true, avatarUrl: true, createdAt: true },
      });

      session.user.id = userId;
      session.user.admin = user?.admin ?? false;
      session.user.avatarUrl = user?.avatarUrl ?? null;
      session.user.createdAt = user?.createdAt;

      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);
