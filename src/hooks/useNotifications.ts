import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import type { Notification } from "../types";

interface CreateNotificationData {
  type: string;
  message: string;
  blogId?: string;
  userId?: string;
}

// Fetch notifications
export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery<Notification[]>({
    queryKey: ["notifications", user?.uid],
    queryFn: async () => {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        collection(db, "notifications")
      );
      const allNotifications = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];
      return allNotifications.filter(
        (n) => n.userId === "all" || n.userId === user?.uid
      );
    },
    enabled: !!user,
  });
};

// Real-time notifications subscription
export const useNotificationsRealtime = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useQuery<Notification[]>({
    queryKey: ["notifications", "realtime", user?.uid],
    queryFn: () => {
      return new Promise<Notification[]>((resolve) => {
        const unsub = onSnapshot(collection(db, "notifications"), (snap) => {
          const notes = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Notification[];
          const filtered = notes.filter(
            (n) => n.userId === "all" || n.userId === user?.uid
          );
          queryClient.setQueryData(["notifications", user?.uid], filtered);
          resolve(filtered);
        });
        return () => unsub();
      });
    },
    enabled: !!user,
  });
};

// Create notification mutation
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateNotificationData & { id: string },
    Error,
    CreateNotificationData
  >({
    mutationFn: async ({ type, message, blogId, userId = "all" }) => {
      const ref = await addDoc(collection(db, "notifications"), {
        userId,
        type,
        message,
        blogId,
        createdAt: serverTimestamp(),
      });
      return { id: ref.id, userId, type, message, blogId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      console.error("Notification Error:", error);
    },
  });
};



















