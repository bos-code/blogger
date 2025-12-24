import { useMutation } from "@tanstack/react-query";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "../stores/authStore";
import { useCreateUser } from "./useUsers";
import { useNotificationStore } from "../stores/notificationStore";
import type { User, UserRole } from "../types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthResult {
  user: FirebaseUser;
  role: UserRole;
}

// Login mutation
export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthError = useAuthStore((state) => state.setAuthError);
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation<AuthResult, Error, LoginCredentials>({
    mutationFn: async ({ email, password }) => {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      const userRole = (userData?.role as UserRole) || "user";

      setUser(
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        },
        userRole
      );

      return { user, role: userRole };
    },
    onError: (error: Error) => {
      setAuthError(error.message);
      showNotification({
        type: "error",
        title: "Login Failed",
        message: error.message,
      });
    },
  });
};

// Signup mutation
export const useSignup = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthError = useAuthStore((state) => state.setAuthError);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const createUser = useCreateUser();

  return useMutation<AuthResult, Error, SignupCredentials>({
    mutationFn: async ({ email, password, name }) => {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await updateProfile(user, { displayName: name });

      await createUser.mutateAsync({
        uid: user.uid,
        data: {
          email: user.email || "",
          name,
          role: "user",
        },
      });

      setUser(
        {
          uid: user.uid,
          email: user.email,
          name,
        },
        "user"
      );

      return { user, role: "user" };
    },
    onError: (error: Error) => {
      setAuthError(error.message);
      showNotification({
        type: "error",
        title: "Signup Failed",
        message: error.message,
      });
    },
  });
};

// Google sign in mutation
export const useGoogleSignIn = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthError = useAuthStore((state) => state.setAuthError);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const createUser = useCreateUser();

  return useMutation<AuthResult, Error, void>({
    mutationFn: async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      let role: UserRole = "user";
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = (userData.role as UserRole) || "user";
      } else {
        await createUser.mutateAsync({
          uid: user.uid,
          data: {
            email: user.email || "",
            name: user.displayName || "",
            photoURL: user.photoURL || "",
            role: "user",
          },
        });
      }

      setUser(
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
        },
        role
      );

      return { user, role };
    },
    onError: (error: Error) => {
      setAuthError(error.message);
      showNotification({
        type: "error",
        title: "Authentication Failed",
        message: error.message,
      });
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const signOut = useAuthStore((state) => state.signOut);
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await firebaseSignOut(auth);
      signOut();
    },
    onSuccess: () => {
      showNotification({
        type: "success",
        title: "Signed Out",
        message: "You have been signed out successfully.",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Sign Out Failed",
        message: "Error signing out. Please try again.",
      });
      console.error(error);
    },
  });
};


