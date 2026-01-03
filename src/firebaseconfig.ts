import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

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

// Check if Firebase is already initialized
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  // Initialize Firebase only if not already initialized
  if (getApps().length === 0) {
    // Validate config before initializing
    const hasValidConfig =
      firebaseConfig.apiKey !== "your-api-key" &&
      firebaseConfig.authDomain !== "your-auth-domain" &&
      firebaseConfig.projectId !== "your-project-id";

    if (!hasValidConfig) {
      console.warn(
        "⚠️ Firebase config not set. Please create a .env file with your Firebase credentials.\n" +
          "The app will work but Firebase features (auth, database) will not function.\n" +
          "See FIREBASE_SETUP.md for instructions."
      );
    }

    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize services only if app was successfully created
  if (app) {
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("❌ Firebase initialization error:", errorMessage);

  // Don't throw - allow app to work in limited mode
  // The auth functions will handle the errors gracefully
  console.warn(
    "⚠️ Firebase services may not work. Please configure Firebase in .env file.\n" +
      "See FIREBASE_SETUP.md for instructions."
  );

  // Set to undefined so components can check and handle gracefully
  app = undefined;
  db = undefined;
  auth = undefined;
}

// Export with type assertions - components will handle undefined cases
export { db, auth };
export default app;
