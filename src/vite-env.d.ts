/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_HUGGINGFACE_API_KEY?: string;
  readonly VITE_HUGGINGFACE_MODEL?: string;
  /** Base URL of the serverless API (Vercel functions). Defaults to same origin. */
  readonly VITE_API_BASE_URL?: string;
  /** "true" connects to the local Firebase emulators (development and tests). */
  readonly VITE_USE_FIREBASE_EMULATORS?: string;
  readonly VITE_FIREBASE_EMULATOR_HOST?: string;
  /** Optional Sentry DSN for production error monitoring. */
  readonly VITE_SENTRY_DSN?: string;
}
