import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

// Same values as the CSS variables in global.css, for places where a class
// name can't be used (navigation, native switches, icons passed as props).
export const THEME = {
  light: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    card: "#ffffff",
    primary: "#171717",
    primaryForeground: "#fafafa",
    secondary: "#f5f5f5",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    border: "#e5e5e5",
    destructive: "#ef4444",
    success: "#16a34a",
  },
  dark: {
    background: "#0a0a0a",
    foreground: "#fafafa",
    card: "#0a0a0a",
    primary: "#fafafa",
    primaryForeground: "#171717",
    secondary: "#262626",
    muted: "#262626",
    mutedForeground: "#a3a3a3",
    border: "#262626",
    destructive: "#d03232",
    success: "#22c55e",
  },
} as const;

export type ThemeColors = (typeof THEME)["light" | "dark"];

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
