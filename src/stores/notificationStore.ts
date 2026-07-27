import { create } from "zustand";
import type { NotificationState, NotificationData } from "../types";

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,

  showNotification: (notification: NotificationData | null) =>
    set({ notification }),

  hideNotification: () => set({ notification: null }),
}));
