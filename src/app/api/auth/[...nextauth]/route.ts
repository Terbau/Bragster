import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
// import GithubProvider from "next-auth/providers/github";

// if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
//   throw new Error("GITHUB_ID or GITHUB_SECRET not found in env.");
// }

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
