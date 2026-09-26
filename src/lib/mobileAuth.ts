import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

// Tokens for the Expo app. The app signs in through the regular NextAuth/Auth0
// flow in an in-app browser, receives a short-lived code bound to a PKCE
// challenge, and exchanges it for a long-lived bearer token.

const ISSUER = "bragster";
const ACCESS_TOKEN_AUDIENCE = "bragster-mobile";
const AUTH_CODE_AUDIENCE = "bragster-mobile-code";
const ACCESS_TOKEN_TTL = "180d";
const AUTH_CODE_TTL = "2m";

export const MOBILE_REDIRECT_URI_PREFIX = "bragster://";

const getSigningKey = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET not found in env variables");
  }

  // Derive a separate key so mobile tokens can never be mistaken for NextAuth's
  // own tokens.
  return createHash("sha256").update(`bragster-mobile:${secret}`).digest();
};

const sha256Base64Url = (value: string) =>
  createHash("sha256").update(value).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
};

export const isValidCodeChallenge = (challenge: string) =>
  /^[A-Za-z0-9_-]{43}$/.test(challenge);

export const isAllowedMobileRedirectUri = (uri: string) =>
  uri.startsWith(MOBILE_REDIRECT_URI_PREFIX);

export const createMobileAuthCode = (userId: string, codeChallenge: string) =>
  new SignJWT({ challenge: codeChallenge })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUTH_CODE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(AUTH_CODE_TTL)
    .sign(getSigningKey());

/**
 * Verifies an auth code together with the PKCE code verifier that only the
 * requesting app knows. Returns the user id the code was issued for.
 */
export const verifyMobileAuthCode = async (
  code: string,
  codeVerifier: string,
): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(code, getSigningKey(), {
      issuer: ISSUER,
      audience: AUTH_CODE_AUDIENCE,
      algorithms: ["HS256"],
    });

    if (
      typeof payload.challenge !== "string" ||
      !payload.sub ||
      !safeEqual(sha256Base64Url(codeVerifier), payload.challenge)
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
};

export const createMobileAccessToken = (userId: string) =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(ACCESS_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSigningKey());

export const verifyMobileAccessToken = async (
  token: string,
): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
      algorithms: ["HS256"],
    });

    return payload.sub ?? null;
  } catch {
    return null;
  }
};
