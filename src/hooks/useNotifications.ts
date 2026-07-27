import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import type { Notification } from "../types";
import { queryKeys } from "../utils/queryClient";

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
    queryKey: queryKeys.notifications.all(user?.uid),
    queryFn: async () => {
      if (!user?.uid) return [];

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        query(
          collection(db, "notifications"),
          where("userId", "in", ["all", user.uid])
        )
      );
      return snapshot.docs.map((notificationDocument) => ({
        id: notificationDocument.id,
        ...notificationDocument.data(),
      })) as Notification[];
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





















