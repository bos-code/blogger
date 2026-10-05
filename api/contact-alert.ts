import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, ownerEmail, sendMail } from "./_lib/mail.js";
import { errorResponse, json, readJson, siteUrl } from "./_lib/http.js";

const MAX_AGE_MS = 10 * 60 * 1000;

/**
 * Emails the site owner about a new contact-form message. Only messages
 * created in the last few minutes that haven't been alerted yet qualify,
 * so the endpoint can't be used to send arbitrary email.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isEmailConfigured() || !ownerEmail()) return json({ ok: false, reason: "email-not-configured" });
  const body = await readJson<{ messageId?: string }>(request);
  const id = body?.messageId ?? "";
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return errorResponse("Unknown message.");

  const ref = adminDb().collection("messages").doc(id);
  const alerted = await adminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const createdAt = snapshot.get("createdAt")?.toMillis?.() ?? 0;
    if (!snapshot.exists || snapshot.get("alertedAt") || Date.now() - createdAt > MAX_AGE_MS) return null;
    transaction.update(ref, { alertedAt: FieldValue.serverTimestamp() });
    return snapshot.data() as { name: string; email: string; message: string };
  });
  if (!alerted) return json({ ok: true, skipped: true });

  await sendMail({
    to: ownerEmail(),
    replyTo: alerted.email,
    subject: `New message from ${alerted.name}`,
    heading: `New message from ${alerted.name}`,
    paragraphs: [`From: ${alerted.name} <${alerted.email}>`, alerted.message],
    button: { label: "Open your inbox", url: `${siteUrl(request)}/admin` },
    footer: "Reply to this email to answer them directly.",
  });
  return json({ ok: true });
}
