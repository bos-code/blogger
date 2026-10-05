import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, sendMail } from "./_lib/mail.js";
import { EMAIL_PATTERN, errorResponse, json, readJson, siteUrl } from "./_lib/http.js";
import { newToken, RESEND_COOLDOWN_MS, subscriberId } from "./_lib/subscribers.js";

/** Starts a newsletter subscription and emails a confirmation link (double opt-in). */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson<{ email?: string }>(request);
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return errorResponse("Enter a valid email address.");
  if (!isEmailConfigured()) return errorResponse("Email subscriptions aren't set up yet.", 503);

  const ref = adminDb().collection("subscribers").doc(subscriberId(email));
  const existing = await ref.get();

  if (existing.exists && existing.get("status") === "confirmed") {
    // Don't reveal whether an address is subscribed; just report success.
    return json({ ok: true });
  }
  const lastSent = existing.get("confirmationSentAt")?.toMillis?.() ?? 0;
  if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
    return json({ ok: true });
  }

  const token = newToken();
  await ref.set(
    {
      email,
      status: "pending",
      token,
      createdAt: existing.exists ? existing.get("createdAt") : FieldValue.serverTimestamp(),
      confirmationSentAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const base = siteUrl(request);
  try {
    await sendMail({
      to: email,
      subject: "Confirm your subscription",
      heading: "Confirm your subscription",
      paragraphs: [
        "Thanks for subscribing to new posts. Click the button below to confirm your email address.",
        "If you didn't ask for this, you can ignore this email — you won't be subscribed.",
      ],
      button: { label: "Confirm subscription", url: `${base}/subscribe/confirm?token=${token}` },
    });
  } catch {
    return errorResponse("We couldn't send the confirmation email. Please try again later.", 502);
  }

  return json({ ok: true });
}
