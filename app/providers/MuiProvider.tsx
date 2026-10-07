"use client";

import { useMemo, type ReactNode } from "react";
import { useTheme as useAppTheme } from "next-themes";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const cssToken = (name: string) => `hsl(var(--${name}))`;

// These fixed values mirror the existing light and dark tokens in globals.css.
// Preview themes use literal colors so neither panel follows the app's theme switch.
const fixedTokens = {
  light: {
    primary: "hsl(262.1, 83.3%, 57.8%)",
    "primary-foreground": "hsl(0, 0%, 98%)",
    secondary: "hsl(0, 0%, 96.1%)",
    "secondary-foreground": "hsl(0, 0%, 9%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(0, 0%, 3.9%)",
    card: "hsl(0, 0%, 100%)",
    "muted-foreground": "hsl(0, 0%, 45.1%)",
    border: "hsl(0, 0%, 89.8%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    "destructive-foreground": "hsl(0, 0%, 98%)",
  },
  dark: {
    primary: "hsl(263.4, 70%, 50.4%)",
    "primary-foreground": "hsl(0, 0%, 98%)",
    secondary: "hsl(0, 0%, 14.9%)",
    "secondary-foreground": "hsl(0, 0%, 98%)",
    background: "hsl(0, 0%, 3.9%)",
    foreground: "hsl(0, 0%, 98%)",
    card: "hsl(0, 0%, 3.9%)",
    "muted-foreground": "hsl(0, 0%, 63.9%)",
    border: "hsl(0, 0%, 14.9%)",
    destructive: "hsl(0, 62.8%, 30.6%)",
    "destructive-foreground": "hsl(0, 0%, 98%)",
  },
} as const;

export function createCrmMuiTheme(mode: "light" | "dark", fixedPreview = false) {
  const isDark = mode === "dark";
  const token = (name: keyof typeof fixedTokens.light) =>
    fixedPreview ? fixedTokens[mode][name] : cssToken(name);

  return createTheme({
    cssVariables: fixedPreview ? false : { nativeColor: true },
    palette: {
      mode,
      primary: {
        main: token("primary"),
        contrastText: token("primary-foreground"),
      },
      secondary: {
        main: token("secondary"),
        contrastText: token("secondary-foreground"),
      },
      background: {
        default: token("background"),
        paper: token("card"),
      },
      text: {
        primary: token("foreground"),
        secondary: token("muted-foreground"),
      },
      divider: token("border"),
      success: { main: isDark ? "#4ade80" : "#16a34a" },
      warning: { main: isDark ? "#facc15" : "#ca8a04" },
      info: { main: isDark ? "#60a5fa" : "#2563eb" },
      error: {
        main: isDark ? "#f87171" : token("destructive"),
        contrastText: isDark ? token("background") : token("destructive-foreground"),
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "var(--font-inter), Arial, sans-serif",
      h4: { fontWeight: 750, letterSpacing: "-0.035em" },
      h5: { fontWeight: 720, letterSpacing: "-0.025em" },
      h6: { fontWeight: 700, letterSpacing: "-0.015em" },
      button: { textTransform: "none", fontWeight: 650 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 6, textTransform: "none", fontWeight: 650 },
        },
      },
      MuiCard: {
        defaultProps: { variant: "outlined" },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 650 } },
      },
    },
  });
}

export function MuiProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useAppTheme();
  const theme = useMemo(
    () => createCrmMuiTheme(resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
