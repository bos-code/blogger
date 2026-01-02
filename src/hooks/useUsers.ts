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
import { useAuthStore } from "../stores/authStore";

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
  // Use auth store as single source of truth - never use auth.currentUser
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logStatus = useAuthStore((state) => state.logStatus);
  const displayStatus = useAuthStore((state) => state.displayStatus);
  const isAdmin = role === "admin";

  // Only enable query when:
  // 1. Auth has finished initializing (displayStatus === "ready")
  // 2. User is logged in (logStatus === true)
  // 3. User is an admin
  const isAuthReady = displayStatus === "ready";
  const shouldFetch = isAuthReady && logStatus && isAdmin && !!user;

  return useQuery<UserData[]>({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // Double-check using auth store (not auth.currentUser)
        if (!user || !user.uid) {
          throw new Error("You must be logged in to view users");
        }

        if (!isAdmin) {
          throw new Error("Only admins can view all users");
        }

        console.log("Fetching users from Firestore...");
        console.log("Current user (from store):", user.uid);
        console.log("User role:", role);
        console.log("Auth status:", { logStatus, displayStatus, isAuthReady });

        const snapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "users")
        );
        console.log("Users snapshot:", snapshot);
        console.log("Number of users:", snapshot.docs.length);

        const users = snapshot.docs.map((d) => {
          const data = d.data();
          console.log("User doc:", { id: d.id, data });
          return {
            id: d.id,
            ...data,
          };
        }) as UserData[];

        console.log("Processed users:", users);
        return users;
      } catch (error) {
        console.error("Error fetching users:", error);
        // Provide more helpful error message
        if (error instanceof Error && error.message.includes("permissions")) {
          throw new Error(
            "Permission denied. Please ensure:\n" +
              "1. You are logged in as an admin\n" +
              "2. Firestore security rules allow reading the 'users' collection\n" +
              "3. Your user document has 'role: admin' in Firestore"
          );
        }
        throw error;
      }
    },
    // Critical: Only enable when auth is fully ready and user is admin/superadmin
    enabled: shouldFetch,
    // User data changes less frequently
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Real-time users subscription
export const useUsersRealtime = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logStatus = useAuthStore((state) => state.logStatus);
  const displayStatus = useAuthStore((state) => state.displayStatus);
  const isAdmin = role === "admin";

  const isAuthReady = displayStatus === "ready";
  const shouldFetch = isAuthReady && logStatus && isAdmin && !!user;

  return useQuery<UserData[]>({
    queryKey: ["users", "realtime"],
    queryFn: () => {
      return new Promise<UserData[]>((resolve, reject) => {
        if (!user || !user.uid || !isAdmin) {
          reject(new Error("Unauthorized: Admin access required"));
          return;
        }

        const unsub = onSnapshot(
          collection(db, "users"),
          (snap) => {
            const users = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as UserData[];
            queryClient.setQueryData(["users"], users);
            resolve(users);
          },
          (error) => {
            console.error("Realtime users subscription error:", error);
            reject(error);
          }
        );

        // Return cleanup function
        return () => unsub();
      });
    },
    enabled: shouldFetch,
  });
};

// Get single user
export const useUser = (uid: string | undefined) => {
  const displayStatus = useAuthStore((state) => state.displayStatus);
  const isAuthReady = displayStatus === "ready";

  return useQuery<UserData | null>({
    queryKey: ["users", uid],
    queryFn: async () => {
      if (!uid) return null;

      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      console.log(userDoc);

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    },
    // Only enable when auth is ready and uid is provided
    enabled: isAuthReady && !!uid,
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<UpdateUserData, Error, UpdateUserData>({
    mutationFn: async ({ uid, data }) => {
      await updateDoc(doc(db, "users", uid), data);
      return { uid, data };
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
      return { uid, data };
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
