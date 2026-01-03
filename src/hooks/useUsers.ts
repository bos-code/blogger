import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useNotificationStore } from "../stores/notificationStore";
import { queryKeys } from "../utils/queryClient";
import type { User, UserRole } from "../types";

interface UserWithId extends User {
  id: string;
  role?: UserRole;
}

interface UpdateUserData {
  uid: string;
  data: Partial<User & { role?: UserRole }>;
}

// Fetch all users
export const useUsers = () => {
  return useQuery<UserWithId[]>({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      try {
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "users")
        );
        return snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserWithId[];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users. Please try again later.");
      }
    },
    // Only fetch users if user has admin role (can be enhanced with auth check)
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("permission")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<UserWithId, Error, UpdateUserData>({
    mutationFn: async ({ uid, data }) => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      await updateDoc(doc(db, "users", uid), data);
      return { id: uid, ...data } as UserWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showNotification({
        type: "success",
        title: "User Updated",
        message: "User information has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Update User",
        message:
          "There was an error updating the user. Please try again.",
      });
      console.error(error);
    },
  });
};
