import { create } from "zustand";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import type { User, UserRole, AuthState } from "../types";

interface AuthStore extends AuthState {}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  logStatus: false,
  authError: null,
  displayStatus: "loading",

  // Set user data
  setUser: (user: User, role: UserRole) =>
    set({
      user,
      role,
      logStatus: true,
      authError: null,
    }),

  // Set auth error
  setAuthError: (error: string) => set({ authError: error }),

  // Clear auth error
  clearAuthError: () => set({ authError: null }),

  // Sign out
  signOut: () =>
    set({
      user: null,
      role: null,
      logStatus: false,
      authError: null,
    }),

  // Initialize auth state listener
  initAuth: () => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          const userData = snap.exists() ? snap.data() : {};

          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: (userData.name as string) || firebaseUser.displayName || null,
              photoURL: (userData.photoURL as string) || firebaseUser.photoURL || null,
            },
            role: (userData.role as UserRole) || "user",
            logStatus: true,
            authError: null,
            displayStatus: "ready",
          });
        } catch (err) {
          console.error(err);
          const error = err as Error;
          set({ authError: error.message, displayStatus: "error" });
        }
      } else {
        set({
          user: null,
          role: null,
          logStatus: false,
          displayStatus: "ready",
        });
      }
    });

    return unsub;
  },
}));












