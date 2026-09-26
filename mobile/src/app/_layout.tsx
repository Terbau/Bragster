import "../../global.css";

import { ThemeProvider } from "@react-navigation/native";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
import { loadThemePreference, useColors } from "@/lib/color-scheme";
import { NAV_THEME } from "@/lib/theme";
import { Toaster } from "@/lib/toast";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      // Retrying client errors (401, 403, 404, ...) won't help
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
        failureCount < 2,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Refetch stale data when the app comes back to the foreground
    const subscription = AppState.addEventListener("change", (status) =>
      focusManager.setFocused(status === "active"),
    );
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const { setColorScheme } = useColorScheme();
  const { isDark, colors } = useColors();
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    void loadThemePreference(setColorScheme).finally(() => setThemeLoaded(true));
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
          name="receipt/[receiptId]/edit-item"
          options={{ ...modalOptions, title: "Edit item" }}
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
      </Stack>
      <Toaster />
    </ThemeProvider>
  );
}
