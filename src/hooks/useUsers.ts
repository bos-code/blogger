import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useNotificationStore } from "../stores/notificationStore";
import type { User } from "../types";

interface UserData {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  photoURL?: string;
  [key: string]: any;
}

interface CreateUserData {
  uid: string;
  data: {
    email?: string;
    name?: string;
    role?: string;
    photoURL?: string;
    [key: string]: any;
  };
}

interface UpdateUserData {
  uid: string;
  data: Partial<UserData>;
}

// Fetch all users
export const useUsers = () => {
  return useQuery<UserData[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        collection(db, "users")
      );
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserData[];
    },
  });
};

// Real-time users subscription
export const useUsersRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery<UserData[]>({
    queryKey: ["users", "realtime"],
    queryFn: () => {
      return new Promise<UserData[]>((resolve) => {
        const unsub = onSnapshot(collection(db, "users"), (snap) => {
          const users = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as UserData[];
          queryClient.setQueryData(["users"], users);
          resolve(users);
        });
        return () => unsub();
      });
    },
    enabled: true,
  });
};

// Get single user
export const useUser = (uid: string | undefined) => {
  return useQuery<UserData | null>({
    queryKey: ["users", uid],
    queryFn: async () => {
      if (!uid) return null;
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    },
    enabled: !!uid,
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation<UpdateUserData, Error, UpdateUserData>({
    mutationFn: async ({ uid, data }) => {
      await updateDoc(doc(db, "users", uid), data);
      return { uid, ...data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", data.uid] });
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
        message: "There was an error updating the user. Please try again.",
      });
      console.error(error);
    },
  });
};

// Create user document (for signup)
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateUserData, Error, CreateUserData>({
    mutationFn: async ({ uid, data }) => {
      await setDoc(doc(db, "users", uid), data);
      return { uid, ...data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", data.uid] });
    },
    onError: (error: Error) => {
      console.error("Failed to create user document:", error);
    },
  });
};










