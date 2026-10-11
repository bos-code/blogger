import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getCaller } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, ownerEmail, sendMail } from "./_lib/mail.js";
import { EMAIL_PATTERN, errorResponse, json, readJson, siteUrl } from "./_lib/http.js";
import { clientIp, rateLimit } from "./_lib/rateLimit.js";

/** Submissions allowed per IP address per hour. */
const IP_LIMIT = 3;
const IP_WINDOW_MS = 60 * 60 * 1000;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;

interface Body {
  name?: string;
  contact?: string;
  authorTitle?: string;
  projectSlug?: string | null;
  rating?: number | null;
  content?: string;
  /** Honeypot: hidden from people, often filled in by bots. */
  website?: string;
}

/**
 * Accepts a testimonial from anyone (no account needed). It is saved as
 * pending for the owner to approve; the contact details are stored
 * separately in an admin-only collection so they are never made public.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson<Body>(request);
  if (!body) return errorResponse("Invalid request.");
  // Bots that fill the hidden field get a normal-looking success and nothing is saved.
  if (body.website) return json({ ok: true });

  const name = body.name?.trim() ?? "";
  const contact = body.contact?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  const authorTitle = body.authorTitle?.trim() || null;
  const projectSlug = body.projectSlug || null;
  const rating = body.rating ?? null;

  if (name.length < 2 || name.length > 100) return errorResponse("Please enter your name.");
  if (!EMAIL_PATTERN.test(contact) && !PHONE_PATTERN.test(contact)) {
    return errorResponse("Please enter a valid email address or phone number.");
  }
  if (contact.length > 254) return errorResponse("That contact is too long.");
  if (content.length < 20) return errorResponse("Please write at least 20 characters.");
  if (content.length > 1000) return errorResponse("Testimonials can be at most 1000 characters.");
  if (authorTitle && authorTitle.length > 100) return errorResponse("Role and company can be at most 100 characters.");
  if (projectSlug !== null && (typeof projectSlug !== "string" || !SLUG_PATTERN.test(projectSlug))) {
    return errorResponse("Unknown project.");
  }
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return errorResponse("Rating must be between 1 and 5.");
  }

  const ip = clientIp(request);
  if (ip && !(await rateLimit("testimonial", ip, IP_LIMIT, IP_WINDOW_MS))) {
    return errorResponse("Too many testimonials from this connection. Please try again later.", 429);
  }

  // Signed-in visitors are linked to their account (so they can see it while pending).
  const caller = await getCaller(request);
  const db = adminDb();
  const ref = db.collection("testimonials").doc();
  const batch = db.batch();
  batch.set(ref, {
    authorId: caller?.verified ? caller.uid : null,
    authorName: name,
    authorAvatar: null,
    authorTitle,
    projectSlug,
    rating,
    content,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("testimonialContacts").doc(ref.id), {
    contact,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("notifications").doc(), {
    userId: "admins",
    type: "pending_testimonial",
    message: `${name} left a testimonial waiting for your approval`,
    link: "/admin",
    read: false,
    readBy: [],
    createdAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  if (isEmailConfigured() && ownerEmail()) {
    try {
      await sendMail({
        to: ownerEmail(),
        ...(EMAIL_PATTERN.test(contact) ? { replyTo: contact } : {}),
        subject: `New testimonial from ${name}`,
        heading: "A testimonial is waiting for approval",
        paragraphs: [`From: ${name}${authorTitle ? `, ${authorTitle}` : ""} (${contact})`, content],
        button: { label: "Review it", url: `${siteUrl(request)}/admin` },
      });
    } catch {
      // The testimonial is saved; the email is a courtesy.
    }
  }

  return json({ ok: true, id: ref.id });
}
