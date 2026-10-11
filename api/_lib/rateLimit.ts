import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin.js";

/** The caller's IP as reported by Vercel's edge, or null when unknown (e.g. local tests). */
export const clientIp = (request: Request): string | null => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
};

/**
 * Fixed-window rate limit shared across function instances, stored in
 * Firestore under a hash of the key (raw IPs are never stored). Returns
 * true when the call is allowed. Docs carry `expiresAt` so a Firestore TTL
 * policy can clean them up.
 */
export const rateLimit = async (scope: string, key: string, limit: number, windowMs: number): Promise<boolean> => {
  const id = createHash("sha256").update(`${scope}:${key}`).digest("hex").slice(0, 40);
  const ref = adminDb().collection("rateLimits").doc(id);
  const now = Date.now();
  return adminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const windowStart = snapshot.get("windowStart") ?? 0;
    const count = now - windowStart < windowMs ? (snapshot.get("count") ?? 0) : 0;
    if (count >= limit) return false;
    transaction.set(ref, {
      scope,
      count: count + 1,
      windowStart: count === 0 ? now : windowStart,
      expiresAt: Timestamp.fromMillis(now + windowMs),
    });
    return true;
  });
};
