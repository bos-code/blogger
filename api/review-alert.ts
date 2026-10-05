import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getCaller } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, ownerEmail, sendMail } from "./_lib/mail.js";
import { errorResponse, json, readJson, siteUrl } from "./_lib/http.js";

/** Emails the site owner when a writer submits a post for review (once per submission). */
export async function POST(request: Request): Promise<Response> {
  if (!isEmailConfigured() || !ownerEmail()) return json({ ok: false, reason: "email-not-configured" });
  const caller = await getCaller(request);
  if (!caller?.verified) return errorResponse("Not allowed.", 403);

  const body = await readJson<{ postId?: string }>(request);
  const id = body?.postId ?? "";
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return errorResponse("Unknown post.");

  const ref = adminDb().collection("posts").doc(id);
  const post = await adminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("authorId") !== caller.uid || snapshot.get("status") !== "pending") return null;
    const updatedAt = snapshot.get("updatedAt")?.toMillis?.() ?? 0;
    const alertedAt = snapshot.get("reviewAlertedAt")?.toMillis?.() ?? 0;
    if (alertedAt && alertedAt >= updatedAt - 1000) return null;
    transaction.update(ref, { reviewAlertedAt: FieldValue.serverTimestamp() });
    return snapshot.data() as { title: string; authorName?: string };
  });
  if (!post) return json({ ok: true, skipped: true });

  await sendMail({
    to: ownerEmail(),
    subject: `Review needed: ${post.title}`,
    heading: "A post is waiting for review",
    paragraphs: [`${post.authorName || "A writer"} submitted "${post.title}".`],
    button: { label: "Review it", url: `${siteUrl(request)}/admin` },
  });
  return json({ ok: true });
}
