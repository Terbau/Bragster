import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { THEME } from "./theme";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "bragster.theme";

let currentPreference: ThemePreference = "system";
const listeners = new Set<(preference: ThemePreference) => void>();

/** Reads the stored preference and applies it. Call once on startup. */
export async function loadThemePreference(
  apply: (preference: ThemePreference) => void,
) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  if (stored === "light" || stored === "dark" || stored === "system") {
    currentPreference = stored;
  }
  apply(currentPreference);
}

/** Light/dark/system, persisted like the website's theme switcher */
export function useThemePreference() {
  const { setColorScheme } = useNativewindColorScheme();
  const [preference, setPreferenceState] = useState(currentPreference);

  useEffect(() => {
    listeners.add(setPreferenceState);
    return () => {
      listeners.delete(setPreferenceState);
    };
  }, []);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      currentPreference = next;
      setColorScheme(next);
      for (const listener of listeners) {
        listener(next);
      }
      void AsyncStorage.setItem(STORAGE_KEY, next);
    },
    [setColorScheme],
  );

  return { preference, setPreference };
}

/** The resolved color scheme and matching theme colors */
export function useColors() {
  const { colorScheme } = useNativewindColorScheme();
  const isDark = colorScheme === "dark";
  return { isDark, colors: isDark ? THEME.dark : THEME.light };
}
