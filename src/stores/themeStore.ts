import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "default" | "ocean" | "forest" | "sunset";

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

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: "default",
    displayName: "Default",
    colors: {
      primary: "#12f7d6",
      secondary: "#98faec",
      accent: "#e54f26",
      base100: "#292f36",
      base200: "#1a1e23",
      base300: "#43454d",
      baseContent: "#ffffff",
    },
  },
  ocean: {
    name: "ocean",
    displayName: "Ocean Blue",
    colors: {
      primary: "#5483B3",
      secondary: "#7DA0CA",
      accent: "#C1E8FF",
      base100: "#021024",
      base200: "#052659",
      base300: "#5483B3",
      baseContent: "#C1E8FF",
    },
  },
  forest: {
    name: "forest",
    displayName: "Forest Green",
    colors: {
      primary: "#00DF81",
      secondary: "#2CC295",
      accent: "#2FA9SC",
      base100: "#021024",
      base200: "#032221",
      base300: "#03624C",
      baseContent: "#F1F7F6",
    },
  },
  sunset: {
    name: "sunset",
    displayName: "Sunset",
    colors: {
      primary: "#FFA586",
      secondary: "#B51A2B",
      accent: "#541A2E",
      base100: "#161E2F",
      base200: "#242F49",
      base300: "#384358",
      baseContent: "#FFA586",
    },
  },
};

interface ThemeState {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  getCurrentTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: "default",
      setTheme: (theme: ThemeName) => {
        set({ currentTheme: theme });
        applyTheme(theme);
      },
      getCurrentTheme: () => themes[get().currentTheme],
    }),
    {
      name: "theme-storage",
    }
  )
);

// Apply theme to document root
export const applyTheme = (themeName: ThemeName): void => {
  const theme = themes[themeName];
  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-base-100", theme.colors.base100);
  root.style.setProperty("--color-base-200", theme.colors.base200);
  root.style.setProperty("--color-base-300", theme.colors.base300);
  root.style.setProperty("--color-base-content", theme.colors.baseContent);
};

// Initialize theme on load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("theme-storage");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.currentTheme) {
        applyTheme(parsed.state.currentTheme);
      }
    } catch {
      applyTheme("default");
    }
  } else {
    applyTheme("default");
  }
}

