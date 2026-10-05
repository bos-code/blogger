import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getCaller, isAdminRole } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, sendMail } from "./_lib/mail.js";
import { errorResponse, json, postUrl, readJson, siteUrl } from "./_lib/http.js";
import { describePost, type PublicPost } from "./_lib/publicData.js";

const BATCH_SIZE = 5;

/**
 * Emails a published post to confirmed subscribers (admins only). A post is
 * emailed once automatically; `force` resends it.
 */
export async function POST(request: Request): Promise<Response> {
  const caller = await getCaller(request);
  if (!caller || !caller.verified || !isAdminRole(caller.role)) return errorResponse("Not allowed.", 403);
  if (!isEmailConfigured()) return errorResponse("Email isn't set up on this deployment.", 503);

  const body = await readJson<{ postId?: string; force?: boolean }>(request);
  const postId = body?.postId ?? "";
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(postId)) return errorResponse("Unknown post.");

  const db = adminDb();
  const postRef = db.collection("posts").doc(postId);
  const snapshot = await postRef.get();
  if (!snapshot.exists || snapshot.get("status") !== "approved") return errorResponse("Only published posts can be emailed.");
  const scheduled = snapshot.get("scheduledFor")?.toMillis?.();
  if (scheduled && scheduled > Date.now()) return errorResponse("This post is scheduled; email it after it goes live.");
  if (snapshot.get("emailedAt") && !body?.force) return json({ sent: 0, alreadySent: true });

  const post = { id: postId, ...(snapshot.data() as Omit<PublicPost, "id">) };
  const base = siteUrl(request);
  const url = postUrl(base, post);
  const subscribers = await db.collection("subscribers").where("status", "==", "confirmed").get();

  let sent = 0;
  const docs = subscribers.docs;
  for (let index = 0; index < docs.length; index += BATCH_SIZE) {
    const results = await Promise.allSettled(
      docs.slice(index, index + BATCH_SIZE).map((subscriber) => {
        const unsubscribeUrl = `${base}/unsubscribe?token=${subscriber.get("token")}`;
        const oneClickUrl = `${base}/api/unsubscribe?token=${subscriber.get("token")}`;
        return sendMail({
          to: String(subscriber.get("email")),
          subject: `New post: ${post.title}`,
          heading: post.title,
          paragraphs: [describePost(post, 280)],
          button: { label: "Read the post", url },
          footer: `You're receiving this because you subscribed to new posts. <a href="${unsubscribeUrl}">Unsubscribe</a>.`,
          headers: {
            "List-Unsubscribe": `<${oneClickUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
      })
    );
    sent += results.filter((result) => result.status === "fulfilled").length;
  }

  await postRef.update({ emailedAt: FieldValue.serverTimestamp() });
  return json({ sent, total: docs.length });
}
