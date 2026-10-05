import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import type { Notification } from "../types";
import { queryKeys } from "../utils/queryClient";
import { toTimestamp } from "../utils/date";

const isAdminRole = (role: string | null) =>
  role === "admin" || role === "super_admin";

export const isNotificationRead = (
  notification: Notification,
  userId: string | undefined
): boolean => {
  if (!userId) return true;
  if (notification.userId === userId) return Boolean(notification.read);
  return notification.readBy?.includes(userId) ?? false;
};

/** Notifications addressed to the signed-in user, "all" users, and (for admins) "admins". */
export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const audiences = useMemo(
    () =>
      user?.uid
        ? ["all", user.uid, ...(isAdminRole(role) ? ["admins"] : [])]
        : [],
    [user?.uid, role]
  );

  return useQuery<Notification[]>({
    queryKey: [...queryKeys.notifications.all(user?.uid), audiences.join(",")],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, "notifications"), where("userId", "in", audiences))
      );
      return snapshot.docs
        .map((notificationDoc) => ({
          id: notificationDoc.id,
          ...notificationDoc.data(),
        }))
        .sort(
          (a, b) =>
            toTimestamp((b as Notification).createdAt) -
            toTimestamp((a as Notification).createdAt)
        )
        .slice(0, 30) as Notification[];
    },
    enabled: Boolean(user && emailVerified && audiences.length),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
};

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation<void, Error, Notification[]>({
    mutationFn: async (notifications) => {
      if (!user?.uid) return;
      const unread = notifications.filter(
        (notification) => !isNotificationRead(notification, user.uid)
      );
      if (unread.length === 0) return;

      const batch = writeBatch(db);
      for (const notification of unread) {
        const ref = doc(db, "notifications", notification.id);
        if (notification.userId === user.uid) {
          batch.update(ref, { read: true });
        } else {
          batch.update(ref, { readBy: arrayUnion(user.uid) });
        }
      }
      await batch.commit();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

interface NewNotification {
  userId: string;
  type: string;
  message: string;
  blogId?: string;
  link?: string;
}

/**
 * Best-effort notification write: a failure here must never break the action
 * that triggered it (publishing, approving, commenting...).
 */
export const createNotification = async (
  notification: NewNotification
): Promise<void> => {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      readBy: [],
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Could not create notification:", error);
    }
  }
};
