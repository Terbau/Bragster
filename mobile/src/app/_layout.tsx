import "../../global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { focusManager, type Query, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { ApiError } from "@/lib/api";
import { AuthProvider, useAuth } from "@/lib/auth";
import { startBusTracking } from "@/lib/bus-tracking";
import { startJourneys } from "@/lib/journey";
import { loadThemePreference, useColors } from "@/lib/color-scheme";
import { startSendingPendingScores } from "@/lib/pending-scores";
import { NAV_THEME } from "@/lib/theme";
import { Toaster } from "@/lib/toast";

void SplashScreen.preventAutoHideAsync();

// A link into the app, like from the Lock Screen, opens on top of the tabs
export const unstable_settings = { initialRouteName: "(tabs)" };

/** How long padel data is kept on the phone, to open games without signal */
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      // Kept as long as it's stored, or it's gone before it can be stored
      gcTime: CACHE_MAX_AGE,
      // Retrying client errors (401, 403, 404, ...) won't help
      retry: (failureCount, error) =>
        !(
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) && failureCount < 2,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "bragster.query-cache",
  throttleTime: 1000,
});

const persistOptions = {
  persister,
  maxAge: CACHE_MAX_AGE,
  // Data stored by another version may have another shape
  buster: `1-${Constants.expoConfig?.version ?? ""}`,
  dehydrateOptions: {
    // Padel games, spaces and stats, for the courts without signal
    shouldDehydrateQuery: (query: Query) =>
      query.state.status === "success" &&
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].startsWith("padel-"),
    // Scores are kept by `pending-scores.ts` instead
    shouldDehydrateMutation: () => false,
  },
};

export default function RootLayout() {
  useEffect(() => startSendingPendingScores(queryClient), []);
  // Keeps the bus on the Lock Screen up to date, from any screen
  useEffect(() => startBusTracking(), []);
  useEffect(() => startJourneys(), []);

  useEffect(() => {
    // Refetch stale data when the app comes back to the foreground
    const subscription = AppState.addEventListener("change", (status) =>
      focusManager.setFocused(status === "active"),
    );
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const { setColorScheme } = useColorScheme();
  const { isDark, colors } = useColors();
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    void loadThemePreference(setColorScheme).finally(() =>
      setThemeLoaded(true),
    );
  }, [setColorScheme]);

  const isReady = themeLoaded && status !== "loading";
  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  const modalOptions = {
    presentation: "modal",
    headerLeft: () => null,
    headerRight: () => <ModalCloseButton />,
  } as const;

  return (
    <ThemeProvider value={NAV_THEME[isDark ? "dark" : "light"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: "minimal",
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="scan"
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />
        <Stack.Screen
          name="receipt/[receiptId]/index"
          options={{ title: "Receipt" }}
        />
        <Stack.Screen
          name="receipt/[receiptId]/edit"
          options={{
            title: "Edit receipt",
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/index"
          options={{ title: "Smart Receipt" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/assign"
          options={{ ...modalOptions, title: "Assign Users" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/payments"
          options={{ ...modalOptions, title: "Calculated Payments" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/properties"
          options={{ ...modalOptions, title: "Properties" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/users"
          options={{ ...modalOptions, title: "Manage Users" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/invite"
          options={{ ...modalOptions, title: "Invite Users" }}
        />
        <Stack.Screen
          name="smart-receipt/[smartReceiptId]/setup"
          options={{ ...modalOptions, title: "Quick Setup" }}
        />
        <Stack.Screen
          name="padel/spaces/new"
          options={{ ...modalOptions, title: "Space" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/index"
          options={{ title: "Space" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/settings"
          options={{ ...modalOptions, title: "Settings" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/new"
          options={{ ...modalOptions, title: "New game" }}
        />
        <Stack.Screen name="padel/[gameId]/index" options={{ title: "Game" }} />
        <Stack.Screen
          name="padel/[gameId]/order"
          options={{ presentation: "modal", title: "Order of rounds" }}
        />
        <Stack.Screen
          name="padel/[gameId]/edit"
          options={{ presentation: "modal", title: "Edit game" }}
        />
        <Stack.Screen
          name="padel/[gameId]/share"
          options={{ ...modalOptions, title: "Share" }}
        />
        <Stack.Screen
          name="padel/[gameId]/results"
          options={{ ...modalOptions, title: "Results" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/players/index"
          options={{ title: "Players" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/players/[playerKey]"
          options={{ title: "Player" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/compare"
          options={{ title: "Compare" }}
        />
        <Stack.Screen
          name="padel/spaces/[spaceId]/share"
          options={{ ...modalOptions, title: "Share the players" }}
        />
        <Stack.Screen name="bus/[stopId]" options={{ title: "Stop" }} />
        <Stack.Screen name="bus/trip" options={{ title: "Bus" }} />
        <Stack.Screen name="bus/journey" options={{ title: "Trip" }} />
        <Stack.Screen name="bus/place" options={{ title: "Where to?" }} />
        <Stack.Screen name="bus/history" options={{ title: "Trip history" }} />
        <Stack.Screen name="bus/settings" options={{ title: "Bus settings" }} />
      </Stack>
      <Toaster />
    </ThemeProvider>
  );
}
