import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User as FirebaseUser,
  type ActionCodeSettings,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import type { AuthState, User, UserRole } from "../types";

// AuthStore interface extends AuthState
type AuthStore = AuthState & {
  emailVerified: boolean;
  setEmailVerified: (verified: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  role: null,
  logStatus: false,
  authError: null,
  displayStatus: "loading",
  emailVerified: false,

  setUser: (user: User, role: UserRole) => {
    set({
      user,
      role,
      logStatus: true,
      displayStatus: "ready",
      authError: null,
    });
  },

  setEmailVerified: (verified: boolean) => {
    set({ emailVerified: verified });
  },

  setAuthError: (error: string) => {
    set({ authError: error, displayStatus: "error" });
  },

  clearAuthError: () => {
    set({ authError: null });
  },

  signOut: async () => {
    if (!auth) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await firebaseSignOut(auth as any);
      set({
        user: null,
        role: null,
        logStatus: false,
        authError: null,
        displayStatus: "ready",
      });
    } catch (error) {
      get().setAuthError((error as Error).message);
    }
  },

  initAuth: () => {
    if (!auth) {
      console.warn(
        "Firebase Auth not available. Authentication features disabled."
      );
      set({ displayStatus: "ready" });
      return () => {}; // Return no-op function
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsubscribe = onAuthStateChanged(
        auth as any,
        async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // Update email verification status
            get().setEmailVerified(firebaseUser.emailVerified);

            try {
              // Get user document from Firestore
              if (!db) throw new Error("Firestore not available");
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

              if (userDoc.exists()) {
                const userData = userDoc.data();
                const user: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || userData.name || null,
                  photoURL: firebaseUser.photoURL || userData.photoURL || null,
                };
                const role = (userData.role as UserRole) || "user";
                get().setUser(user, role);
              } else {
                // Create user document if it doesn't exist
                const newUser: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName || null,
                  photoURL: firebaseUser.photoURL || null,
                };

                await setDoc(doc(db, "users", firebaseUser.uid), {
                  ...newUser,
                  role: "user",
                  emailVerified: firebaseUser.emailVerified,
                  createdAt: serverTimestamp(),
                });

                get().setUser(newUser, "user");
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              console.error("Error fetching user data:", errorMessage);
              // Set user from Firebase Auth even if Firestore fails
              const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || null,
                photoURL: firebaseUser.photoURL || null,
              };
              get().setUser(user, "user");
              console.warn(
                "Using Firebase Auth data only. Firestore access failed."
              );
            }
          } else {
            set({
              user: null,
              role: null,
              logStatus: false,
              displayStatus: "ready",
              emailVerified: false,
            });
          }
        },
        (error) => {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Auth state error:", errorMessage);
          // Don't set error state if Firebase isn't configured
          if (
            errorMessage.includes("apiKey") ||
            errorMessage.includes("auth/invalid-api-key")
          ) {
            console.warn(
              "Firebase not configured. App will work in limited mode."
            );
            set({
              user: null,
              role: null,
              logStatus: false,
              displayStatus: "ready",
            });
          } else {
            get().setAuthError(errorMessage);
            set({ displayStatus: "error" });
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Failed to initialize auth:", errorMessage);
      // Return a no-op function if auth initialization fails
      return () => {};
    }
  },
}));

// Helper functions for authentication
export const signIn = async (
  email: string,
  password: string
): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await signInWithEmailAndPassword(auth as any, email, password);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<void> => {
  if (!auth || !db) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  try {
    if (!auth) throw new Error("Firebase Auth not available");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCredential = await createUserWithEmailAndPassword(
      auth as any,
      email,
      password
    );

    // Update Firebase Auth profile
    await updateProfile(userCredential.user, { displayName: name });

    // Send email verification immediately after signup
    await sendEmailVerification(userCredential.user);

    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name,
      photoURL: null,
      role: "user",
      emailVerified: false, // Will be updated when user verifies
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

// Forgot password - send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendPasswordResetEmail(auth as any, email);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

// Send email verification
export const sendVerificationEmail = async (): Promise<void> => {
  if (!auth || !auth.currentUser) {
    const error = new Error("No user is currently signed in.");
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendEmailVerification(auth.currentUser as any);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

// Reload user to check email verification status
export const reloadAuthUser = async (): Promise<void> => {
  if (!auth || !auth.currentUser) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (auth.currentUser as any).reload();
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      useAuthStore.getState().setEmailVerified(firebaseUser.emailVerified);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error reloading user:", errorMessage);
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  if (!db) {
    const error = new Error("Firestore is not configured.");
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  const provider = new GoogleAuthProvider();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await signInWithPopup(auth as any, provider);
    const user = result.user;

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || null,
        photoURL: user.photoURL || null,
        role: "user",
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
      });
    } else {
      // Update email verification status
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: user.emailVerified,
      });
    }

    // Update email verification in store
    useAuthStore.getState().setEmailVerified(user.emailVerified);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle user cancellation gracefully
    if (
      errorMessage.includes("auth/popup-closed-by-user") ||
      errorMessage.includes("auth/cancelled-popup-request")
    ) {
      // User closed the popup, don't show error
      return;
    }

    setAuthError(errorMessage);
    throw error;
  }
};

/**
 * Send email link (Magic Link) for passwordless sign-in
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 */
export const sendEmailLink = async (email: string): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();

  try {
    // Store email in localStorage for same-device completion
    localStorage.setItem("emailForSignIn", email);

    // Configure action code settings
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/complete-signin`,
      handleCodeInApp: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendSignInLinkToEmail(auth as any, email, actionCodeSettings);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

/**
 * Check if the current URL contains an email link for sign-in
 * @returns true if URL contains email link
 */
export const checkEmailLink = (): boolean => {
  if (!auth) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return isSignInWithEmailLink(auth as any, window.location.href);
  } catch {
    return false;
  }
};

/**
 * Complete sign-in with email link
 * @param email - User's email address (required for cross-device scenarios)
 * @returns Promise that resolves when sign-in is complete
 */
export const completeEmailLinkSignIn = async (
  email?: string
): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  if (!db) {
    const error = new Error("Firestore is not configured.");
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();

  try {
    // Get email from localStorage (same device) or parameter (cross device)
    const emailToUse = email || localStorage.getItem("emailForSignIn");

    if (!emailToUse) {
      throw new Error(
        "Email is required. Please enter the email address where you received the sign-in link."
      );
    }

    // Complete sign-in with email link
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCredential = await signInWithEmailLink(
      auth as any,
      emailToUse,
      window.location.href
    );

    // Clear stored email
    localStorage.removeItem("emailForSignIn");

    // Refresh auth token to ensure security rules evaluate correctly
    if (userCredential.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (userCredential.user as any).getIdToken(true);
    }

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

    if (!userDoc.exists()) {
      // Create user document for new users
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || null,
        photoURL: userCredential.user.photoURL || null,
        role: "user",
        emailVerified: userCredential.user.emailVerified, // Email link automatically verifies email
        createdAt: serverTimestamp(),
      });
    } else {
      // Update email verification status (email link automatically verifies)
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        emailVerified: userCredential.user.emailVerified,
      });
    }

    // Update email verification in store
    useAuthStore.getState().setEmailVerified(userCredential.user.emailVerified);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setAuthError(errorMessage);
    throw error;
  }
};

// Sign in with Apple
export const signInWithApple = async (): Promise<void> => {
  if (!auth) {
    const error = new Error(
      "Firebase is not configured. Please set up your Firebase credentials in a .env file. See FIREBASE_SETUP.md for instructions."
    );
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  if (!db) {
    const error = new Error("Firestore is not configured.");
    useAuthStore.getState().setAuthError(error.message);
    throw error;
  }

  const { setAuthError } = useAuthStore.getState();
  const provider = new OAuthProvider("apple.com");

  // Request additional scopes
  provider.addScope("email");
  provider.addScope("name");

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await signInWithPopup(auth as any, provider);
    const user = result.user;

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || null,
        photoURL: user.photoURL || null,
        role: "user",
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
      });
    } else {
      // Update email verification status
      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: user.emailVerified,
      });
    }

    // Update email verification in store
    useAuthStore.getState().setEmailVerified(user.emailVerified);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle user cancellation gracefully
    if (
      errorMessage.includes("auth/popup-closed-by-user") ||
      errorMessage.includes("auth/cancelled-popup-request")
    ) {
      // User closed the popup, don't show error
      return;
    }

    setAuthError(errorMessage);
    throw error;
  }
};
