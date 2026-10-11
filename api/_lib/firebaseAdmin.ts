import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readAdminCredentials } from "./adminCredentials.js";

/**
 * Initialises the Admin SDK from the credentials in the environment (see
 * adminCredentials.ts). With FIRESTORE_EMULATOR_HOST set, the emulators are
 * used and no credentials are needed.
 */
const getApp = (): App => {
  const existing = getApps()[0];
  if (existing) return existing;

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "demo-blogger";
    return initializeApp({ projectId });
  }

  const credentials = readAdminCredentials(process.env);
  if (!credentials) {
    throw new Error(
      "Firebase Admin credentials are not configured (FIREBASE_SERVICE_ACCOUNT, or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)."
    );
  }
  return initializeApp({ credential: cert(credentials), projectId: credentials.projectId });
};

export const adminDb = () => getFirestore(getApp());
export const adminAuth = () => getAuth(getApp());

/** Verifies a Firebase ID token and returns the caller's uid and role. */
export const getCaller = async (request: Request): Promise<{ uid: string; role: string; verified: boolean } | null> => {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const profile = await adminDb().collection("users").doc(decoded.uid).get();
    return {
      uid: decoded.uid,
      role: String(profile.get("role") ?? "user"),
      verified: decoded.email_verified === true,
    };
  } catch {
    return null;
  }
};

export const isAdminRole = (role: string): boolean => role === "admin" || role === "super_admin";
