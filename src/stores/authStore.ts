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
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import type { AuthState, User, UserRole } from "../types";
import { getAuthErrorMessage, isPopupCancellation } from "../utils/authErrors";

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
    try {
      await firebaseSignOut(auth);
      set({
        user: null,
        role: null,
        logStatus: false,
        authError: null,
        displayStatus: "ready",
        emailVerified: false,
      });
    } catch (error) {
      get().setAuthError((error as Error).message);
    }
  },

  initAuth: () => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // Route guards wait while the profile and role are loaded so a
            // fresh sign-in or hard refresh is not treated as signed out.
            if (get().user?.uid !== firebaseUser.uid) {
              set({ displayStatus: "loading" });
            }
            await loadUserProfile(firebaseUser);
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


const profileFromAuth = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  name: firebaseUser.displayName || null,
  photoURL: firebaseUser.photoURL || null,
});

/**
 * Loads the Firestore profile and role for a signed-in Firebase user and
 * publishes it to the store. Unverified accounts cannot read their profile
 * under the security rules, so they fall back to Auth data with the "user"
 * role until they verify.
 */
const loadUserProfile = async (firebaseUser: FirebaseUser): Promise<void> => {
  const { setUser, setEmailVerified } = useAuthStore.getState();
  setEmailVerified(firebaseUser.emailVerified);

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUser(
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData.name || null,
          photoURL: firebaseUser.photoURL || userData.photoURL || null,
          nickname: userData.nickname || null,
        },
        (userData.role as UserRole) || "user"
      );
      return;
    }

    const newUser = profileFromAuth(firebaseUser);
    await setDoc(userRef, {
      ...newUser,
      role: "user",
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
    });
    setUser(newUser, "user");
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Using Firebase Auth profile; Firestore profile unavailable:", error);
    }
    setUser(profileFromAuth(firebaseUser), "user");
  }
};

/**
 * Creates the Firestore profile for a first-time OAuth or email-link sign-in.
 * Existing profiles are left untouched: the security rules only let owners
 * change their display fields, so rewriting other fields would fail.
 */
const ensureUserDocument = async (firebaseUser: FirebaseUser): Promise<void> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) return;
  } catch {
    // Unverified accounts cannot read their profile; creating it is still allowed.
  }

  try {
    await setDoc(userRef, {
      ...profileFromAuth(firebaseUser),
      role: "user",
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // The auth listener may have created the profile first; sign-in still succeeded.
    if (import.meta.env.DEV) {
      console.warn("Could not create user profile:", error);
    }
  }
};

// Helper functions for authentication
export const signIn = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    useAuthStore.getState().setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update Firebase Auth profile
    await updateProfile(userCredential.user, { displayName: name });

    // The auth listener may already have published the profile without a name.
    const { user, role, setUser } = useAuthStore.getState();
    if (user?.uid === userCredential.user.uid) {
      setUser({ ...user, name }, role ?? "user");
    }

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

    // Send email verification immediately after signup
    await sendEmailVerification(userCredential.user);
  } catch (error) {
    useAuthStore.getState().setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

// Forgot password - send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    useAuthStore.getState().setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

// Send email verification
export const sendVerificationEmail = async (): Promise<void> => {
  const { setAuthError } = useAuthStore.getState();
  if (!auth.currentUser) {
    const error = new Error("No user is currently signed in.");
    setAuthError(error.message);
    throw error;
  }

  try {
    await sendEmailVerification(auth.currentUser);
  } catch (error) {
    setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

/**
 * Reloads the signed-in user and reports whether their email is verified.
 * Once verified, the ID token is refreshed so security rules see the new
 * email_verified claim, and the Firestore profile/role is (re)loaded.
 */
export const reloadAuthUser = async (): Promise<boolean> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return false;

  try {
    await firebaseUser.reload();
    const refreshedUser = auth.currentUser ?? firebaseUser;
    if (refreshedUser.emailVerified) {
      await refreshedUser.getIdToken(true);
      await loadUserProfile(refreshedUser);
    } else {
      useAuthStore.getState().setEmailVerified(false);
    }
    return refreshedUser.emailVerified;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error reloading user:", error);
    }
    return useAuthStore.getState().emailVerified;
  }
};

/**
 * Shared popup sign-in for OAuth providers.
 * @returns true when the user signed in, false when they closed the popup.
 */
const signInWithProvider = async (
  provider: GoogleAuthProvider | OAuthProvider
): Promise<boolean> => {
  const { setAuthError } = useAuthStore.getState();

  try {
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user);
    useAuthStore.getState().setEmailVerified(result.user.emailVerified);
    return true;
  } catch (error) {
    if (isPopupCancellation(error)) {
      return false;
    }

    setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<boolean> =>
  signInWithProvider(new GoogleAuthProvider());

/**
 * Send email link (Magic Link) for passwordless sign-in
 * @param email - User's email address
 * @returns Promise that resolves when email is sent
 */
export const sendEmailLink = async (email: string): Promise<void> => {
  const { setAuthError } = useAuthStore.getState();

  try {
    // Configure action code settings
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/complete-signin`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Store email for same-device completion once the link was actually sent.
    try {
      localStorage.setItem("emailForSignIn", email);
    } catch {
      // Cross-device completion still works by asking for the email.
    }
  } catch (error) {
    setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

/**
 * Check if the current URL contains an email link for sign-in
 * @returns true if URL contains email link
 */
export const checkEmailLink = (): boolean => {
  try {
    return isSignInWithEmailLink(auth, window.location.href);
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
  const { setAuthError } = useAuthStore.getState();

  try {
    // Get email from localStorage (same device) or parameter (cross device)
    let storedEmail: string | null = null;
    try {
      storedEmail = localStorage.getItem("emailForSignIn");
    } catch {
      storedEmail = null;
    }
    const emailToUse = email || storedEmail;

    if (!emailToUse) {
      throw new Error(
        "Email is required. Please enter the email address where you received the sign-in link."
      );
    }

    // Complete sign-in with email link
    const userCredential = await signInWithEmailLink(
      auth,
      emailToUse,
      window.location.href
    );

    try {
      localStorage.removeItem("emailForSignIn");
    } catch {
      // Nothing to clean up when storage is unavailable.
    }

    // Refresh auth token to ensure security rules evaluate correctly
    await userCredential.user.getIdToken(true);
    await ensureUserDocument(userCredential.user);
    useAuthStore.getState().setEmailVerified(userCredential.user.emailVerified);
  } catch (error) {
    setAuthError(getAuthErrorMessage(error));
    throw error;
  }
};

// Sign in with Apple
export const signInWithApple = async (): Promise<boolean> => {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return signInWithProvider(provider);
};
