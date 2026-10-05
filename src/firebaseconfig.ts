import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration
// Replace these with your actual Firebase config values
// You can get these from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
};

const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

const hasValidConfig =
  useEmulators ||
  firebaseConfig.apiKey !== "your-api-key" &&
  firebaseConfig.authDomain !== "your-auth-domain" &&
  firebaseConfig.projectId !== "your-project-id";

if (!hasValidConfig && import.meta.env.DEV) {
  console.warn(
    "⚠️ Firebase config not set. Add your credentials to a .env file.\n" +
      "Firebase-backed features will remain unavailable until then.\n" +
      "See FIREBASE_SETUP.md for instructions."
  );
}

// Firebase service objects can be created before a network connection exists.
// Keeping them non-optional gives every consumer one consistent contract; any
// missing credentials surface when a Firebase operation is attempted.
const app = getApps()[0] ?? initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Local development and end-to-end tests run against the Firebase emulators.
if (useEmulators) {
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
}

export { db, auth, storage };
export default app;
