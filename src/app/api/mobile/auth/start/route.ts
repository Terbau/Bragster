import { authOptions } from "@/lib/auth";
import {
  createMobileAuthCode,
  isAllowedMobileRedirectUri,
  isValidCodeChallenge,
} from "@/lib/mobileAuth";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Opened by the mobile app in an in-app browser. Signs the user in through the
 * regular web flow if needed, then redirects back to the app with a one-time
 * code that the app exchanges for a token using its PKCE code verifier.
 */
export async function GET(request: NextRequest) {
  const { searchParams, pathname, search, origin } = request.nextUrl;
  const codeChallenge = searchParams.get("code_challenge");
  const redirectUri = searchParams.get("redirect_uri");

  if (
    !codeChallenge ||
    !isValidCodeChallenge(codeChallenge) ||
    !redirectUri ||
    !isAllowedMobileRedirectUri(redirectUri)
  ) {
    return new NextResponse("Invalid sign in request", { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const signInUrl = new URL("/auth/sign-in", origin);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  const code = await createMobileAuthCode(session.user.id, codeChallenge);
  const appUrl = new URL(redirectUri);
  appUrl.searchParams.set("code", code);

  return NextResponse.redirect(appUrl.toString());
}
