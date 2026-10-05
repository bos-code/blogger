import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialises the Admin SDK from FIREBASE_SERVICE_ACCOUNT (the service
 * account JSON). With FIRESTORE_EMULATOR_HOST set, the emulators are used
 * and no credentials are needed.
 */
const getApp = (): App => {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "demo-blogger";

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId });
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured.");
  }
  const serviceAccount = JSON.parse(raw) as { project_id: string; client_email: string; private_key: string };
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
    projectId: serviceAccount.project_id,
  });
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
