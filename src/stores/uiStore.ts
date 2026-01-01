import { create } from "zustand";
import type { UIState, BlogPost } from "../types";

interface UIStore extends UIState {}

export const useUIStore = create<UIStore>((set) => ({
  dashboardScreen: "home",
  openModal: false,
  selectedBlog: null,

  setDashboardScreen: (screen: UIState["dashboardScreen"]) =>
    set({ dashboardScreen: screen }),

  openApprovalModal: (blog: BlogPost) =>
    set({ selectedBlog: blog, openModal: true }),

  closeModal: () => set({ selectedBlog: null, openModal: false }),
}));









