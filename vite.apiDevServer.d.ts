import type { Plugin } from "vite";
/**
 * Serves the Vercel functions in /api during `vite dev`, so features that
 * use them (subscriptions, previews, RSS…) work locally. In emulator mode
 * the functions talk to the Firebase emulators, and without Gmail
 * credentials emails are logged instead of sent.
 */
export declare const apiDevServer: (mode: string) => Plugin;
