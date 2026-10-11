/**
 * Reads Firebase Admin credentials from the environment. Two ways to set them:
 *
 * 1. FIREBASE_SERVICE_ACCOUNT: the whole service-account JSON file, or
 * 2. three separate values copied from that file (easier to paste on a phone):
 *    FIREBASE_CLIENT_EMAIL  ("client_email")
 *    FIREBASE_PRIVATE_KEY   ("private_key", the -----BEGIN … END----- text)
 *    FIREBASE_PROJECT_ID    ("project_id"; VITE_FIREBASE_PROJECT_ID also works)
 */
export interface AdminCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

type Env = Record<string, string | undefined>;

/** Undoes common copy-paste damage: wrapping quotes, literal "\n", stray spaces. */
export const normalizePrivateKey = (raw: string): string => {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
  const match = key.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!match) return key;
  // Rebuild the PEM so missing or extra line breaks in the body don't matter.
  const body = match[1].replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----\n`;
};

const clean = (value: string | undefined): string =>
  (value ?? "").trim().replace(/^["']|["']$/g, "").trim();

export const readAdminCredentials = (env: Env): AdminCredentials | null => {
  const json = env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: normalizePrivateKey(parsed.private_key),
        };
      }
    } catch {
      // Fall through to the separate variables.
    }
  }
  const clientEmail = clean(env.FIREBASE_CLIENT_EMAIL);
  const privateKey = env.FIREBASE_PRIVATE_KEY ? normalizePrivateKey(env.FIREBASE_PRIVATE_KEY) : "";
  const projectId = clean(env.FIREBASE_PROJECT_ID) || clean(env.VITE_FIREBASE_PROJECT_ID);
  if (clientEmail && privateKey.includes("PRIVATE KEY") && projectId) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
};

/** True when the server can talk to Firestore (real credentials or the emulator). */
export const isAdminConfigured = (env: Env): boolean =>
  Boolean(env.FIRESTORE_EMULATOR_HOST) || readAdminCredentials(env) !== null;
