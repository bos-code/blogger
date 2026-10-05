import { create } from "zustand";
import type { UIState } from "../types";

export const useUIStore = create<UIState>((set) => ({
  dashboardScreen: "home",
  setDashboardScreen: (screen: UIState["dashboardScreen"]) =>
    set({ dashboardScreen: screen }),
}));
