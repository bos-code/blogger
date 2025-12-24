import { create } from "zustand";
import type { NotificationState, NotificationData } from "../types";

interface NotificationStore extends NotificationState {}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,

  showNotification: (notification: NotificationData | null) =>
    set({ notification }),

  hideNotification: () => set({ notification: null }),
}));

