import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setAccessToken, setUnauthorizedHandler } from "./api";
import { API_URL, AUTH_REDIRECT_URI } from "./config";
import type { User } from "./types";

const TOKEN_KEY = "bragster.accessToken";

type AuthStatus = "loading" | "signedIn" | "signedOut";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Resolves `false` if the user cancelled */
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const base64UrlEncode = (base64: string) =>
  base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const createCodeVerifier = () => {
  const bytes = Crypto.getRandomBytes(32);
  return base64UrlEncode(btoa(String.fromCharCode(...bytes)));
};

const createCodeChallenge = async (verifier: string) =>
  base64UrlEncode(
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
      encoding: Crypto.CryptoEncoding.BASE64,
    }),
  );

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // `undefined` while the stored token is being read
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .catch(() => null)
      .then((storedToken) => {
        setAccessToken(storedToken);
        setToken(storedToken);
      });
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAccessToken(null);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<User>("/api/mobile/me"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const signIn = useCallback(async () => {
    const codeVerifier = createCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const startUrl = `${API_URL}/api/mobile/auth/start?code_challenge=${codeChallenge}&redirect_uri=${encodeURIComponent(AUTH_REDIRECT_URI)}`;

    // Signs in through the website (Auth0). Shares cookies with Safari, so
    // it is instant if you are already signed in on bragster.vercel.app.
    const result = await WebBrowser.openAuthSessionAsync(
      startUrl,
      AUTH_REDIRECT_URI,
    );
    if (result.type !== "success") {
      return false;
    }

    const code = Linking.parse(result.url).queryParams?.code;
    if (typeof code !== "string") {
      throw new Error("Sign in failed. Please try again.");
    }

    const response = await api<{ token: string; user: User }>(
      "/api/mobile/auth/token",
      { method: "POST", body: { code, codeVerifier } },
    );

    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    setAccessToken(response.token);
    queryClient.setQueryData(["me"], response.user);
    setToken(response.token);
    return true;
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status:
        token === undefined ? "loading" : token ? "signedIn" : "signedOut",
      user: token ? (user ?? null) : null,
      signIn,
      signOut,
    }),
    [token, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
