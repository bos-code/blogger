import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "default" | "ocean" | "forest" | "sunset";
export type ThemeMode = "dark" | "light" | "system";

const DARK_THEME = "johndark";
const LIGHT_THEME = "johnlight";

interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    base100: string;
    base200: string;
    base300: string;
    baseContent: string;
  };
}

/** Dark-mode colour palettes. "default" uses the brand theme as defined in CSS. */
export const themes: Record<ThemeName, Theme> = {
  default: {
    name: "default",
    displayName: "Default",
    colors: {
      primary: "#12f7d6",
      secondary: "#98faec",
      accent: "#e54f26",
      base100: "#292f36",
      base200: "#1f242a",
      base300: "#3a4048",
      baseContent: "#f5f7fa",
    },
  },
  ocean: {
    name: "ocean",
    displayName: "Ocean Blue",
    colors: {
      primary: "#7DA0CA",
      secondary: "#C1E8FF",
      accent: "#5483B3",
      base100: "#021024",
      base200: "#03183a",
      base300: "#052659",
      baseContent: "#E6F4FF",
    },
  },
  forest: {
    name: "forest",
    displayName: "Forest Green",
    colors: {
      primary: "#00DF81",
      secondary: "#2CC295",
      accent: "#2FA98C",
      base100: "#03211f",
      base200: "#021614",
      base300: "#03624C",
      baseContent: "#F1F7F6",
    },
  },
  sunset: {
    name: "sunset",
    displayName: "Sunset",
    colors: {
      primary: "#FFA586",
      secondary: "#F4C7B8",
      accent: "#B51A2B",
      base100: "#161E2F",
      base200: "#101726",
      base300: "#384358",
      baseContent: "#FBE9E3",
    },
  },
};

const PALETTE_VARS: Array<[keyof Theme["colors"], string]> = [
  ["primary", "--color-primary"],
  ["secondary", "--color-secondary"],
  ["accent", "--color-accent"],
  ["base100", "--color-base-100"],
  ["base200", "--color-base-200"],
  ["base300", "--color-base-300"],
  ["baseContent", "--color-base-content"],
];

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches !== false;

export const resolveMode = (mode: ThemeMode): "dark" | "light" =>
  mode === "system" ? (prefersDark() ? "dark" : "light") : mode;

/** Applies the colour mode and (in dark mode) the selected palette to <html>. */
export const applyTheme = (themeName: ThemeName, mode: ThemeMode = "dark"): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveMode(mode);

  root.setAttribute("data-theme", resolved === "dark" ? DARK_THEME : LIGHT_THEME);

  const theme = themes[themeName] ?? themes.default;
  const usePalette = resolved === "dark" && theme.name !== "default";
  for (const [key, cssVar] of PALETTE_VARS) {
    if (usePalette) root.style.setProperty(cssVar, theme.colors[key]);
    else root.style.removeProperty(cssVar);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", resolved === "dark" ? theme.colors.base100 : "#ffffff");
};

interface ThemeState {
  currentTheme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: "default",
      mode: "dark",
      setTheme: (theme) => {
        set({ currentTheme: theme });
        applyTheme(theme, get().mode);
      },
      setMode: (mode) => {
        set({ mode });
        applyTheme(get().currentTheme, mode);
      },
      toggleMode: () => {
        const next = resolveMode(get().mode) === "dark" ? "light" : "dark";
        get().setMode(next);
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.currentTheme, state.mode);
      },
    }
  )
);

// Apply the saved (or default) theme as soon as this module loads.
if (typeof window !== "undefined") {
  const { currentTheme, mode } = useThemeStore.getState();
  applyTheme(currentTheme, mode);
  window
    .matchMedia?.("(prefers-color-scheme: dark)")
    .addEventListener?.("change", () => {
      const state = useThemeStore.getState();
      if (state.mode === "system") applyTheme(state.currentTheme, "system");
    });
}
