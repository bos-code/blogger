import { randomBytes, createHash } from "node:crypto";

export const newToken = (): string => randomBytes(24).toString("base64url");

/** Subscriber documents are keyed by a hash of the email, so lookups need no index. */
export const subscriberId = (email: string): string =>
  createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 40);

export const RESEND_COOLDOWN_MS = 10 * 60 * 1000;
