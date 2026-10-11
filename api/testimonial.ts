import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, getCaller, isAdminRole } from "./_lib/firebaseAdmin.js";
import { isEmailConfigured, ownerEmail, sendMail } from "./_lib/mail.js";
import { EMAIL_PATTERN, errorResponse, json, readJson, siteUrl } from "./_lib/http.js";
import { clientIp, rateLimit } from "./_lib/rateLimit.js";
import { isAdminConfigured } from "./_lib/adminCredentials.js";
import {
  OWNER_FIRST_NAME,
  PHONE_PATTERN,
  SLUG_PATTERN,
  TOKEN_PATTERN,
  absoluteUrl,
  firstName,
  projectPreviewImage,
} from "./_lib/share.js";

/** Submissions allowed per IP address per hour. */
const IP_LIMIT = 3;
const IP_WINDOW_MS = 60 * 60 * 1000;

interface Body {
  name?: string;
  contact?: string;
  authorTitle?: string;
  projectSlug?: string | null;
  rating?: number | null;
  content?: string;
  /** Honeypot: hidden from people, often filled in by bots. */
  website?: string;
  /** Set when the client is answering a personal request (see requestTestimonial). */
  requestToken?: string;
  action?: "request";
}

interface RequestBody {
  projectSlug?: string;
  projectTitle?: string;
  projectImage?: string | null;
  clientName?: string;
  email?: string;
  phone?: string;
  note?: string;
  sendEmail?: boolean;
}

const unavailable = () =>
  errorResponse("Testimonials can't be submitted on this site yet. Please send yours to me on WhatsApp instead.", 503);

const requestPath = (token: string): string => `/testimonial/${token}`;

/**
 * Public details of a testimonial request, for the client's personal page.
 * The token in the link is the only key, so anyone holding the link (the
 * client) can open it.
 */
export async function GET(request: Request): Promise<Response> {
  if (!isAdminConfigured(process.env)) return unavailable();
  const token = new URL(request.url).searchParams.get("request") ?? "";
  if (!TOKEN_PATTERN.test(token)) return errorResponse("This link isn't valid.", 404);
  const ref = adminDb().collection("testimonialRequests").doc(token);
  const snapshot = await ref.get();
  if (!snapshot.exists) return errorResponse("This link isn't valid any more.", 404);
  const data = snapshot.data()!;
  if (data.status === "sent") {
    await ref.update({ status: "opened", openedAt: FieldValue.serverTimestamp() }).catch(() => undefined);
  }
  return json({
    clientName: data.clientName,
    contact: data.email || data.phone || "",
    projectSlug: data.projectSlug,
    projectTitle: data.projectTitle,
    projectImage: data.projectImage ?? null,
    note: data.note ?? null,
    from: OWNER_FIRST_NAME,
    completed: data.status === "completed",
  });
}

/** Admins: create a personal testimonial request for a client and project. */
const createRequest = async (request: Request, body: RequestBody): Promise<Response> => {
  const caller = await getCaller(request);
  if (!caller || !caller.verified || !isAdminRole(caller.role)) return errorResponse("Not allowed.", 403);

  const clientName = body.clientName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() || null;
  const phone = body.phone?.trim() || null;
  const note = body.note?.trim() || null;
  const projectSlug = body.projectSlug ?? "";
  const projectTitle = body.projectTitle?.trim() ?? "";
  const projectImage = body.projectImage?.trim() || null;

  if (clientName.length < 2 || clientName.length > 100) return errorResponse("Enter your client's name.");
  if (!SLUG_PATTERN.test(projectSlug) || !projectTitle || projectTitle.length > 120) return errorResponse("Choose a project.");
  if (email && (!EMAIL_PATTERN.test(email) || email.length > 254)) return errorResponse("That email address doesn't look right.");
  if (phone && !PHONE_PATTERN.test(phone)) return errorResponse("That phone number doesn't look right.");
  if (note && note.length > 600) return errorResponse("Keep the personal note under 600 characters.");
  if (projectImage && (projectImage.length > 500 || !absoluteUrl("https://x", projectImage))) {
    return errorResponse("Invalid project image.");
  }

  const token = randomBytes(16).toString("base64url");
  const base = siteUrl(request);
  const url = `${base}${requestPath(token)}`;
  const ref = adminDb().collection("testimonialRequests").doc(token);
  await ref.set({
    clientName,
    email,
    phone,
    note,
    projectSlug,
    projectTitle,
    projectImage,
    status: "sent",
    createdBy: caller.uid,
    createdAt: FieldValue.serverTimestamp(),
    emailedAt: null,
    openedAt: null,
    completedAt: null,
    testimonialId: null,
  });

  let emailed = false;
  let emailError: string | null = null;
  if (email && body.sendEmail !== false) {
    if (!isEmailConfigured()) {
      emailError = "Email isn't set up on this deployment, so send it on WhatsApp or from your own email instead.";
    } else {
      try {
        await sendMail({
          to: email,
          ...(ownerEmail() ? { replyTo: ownerEmail() } : {}),
          subject: `${OWNER_FIRST_NAME} would love your feedback on ${projectTitle}`,
          image: projectImage
            ? { url: projectPreviewImage(base, projectImage), alt: projectTitle, href: url }
            : undefined,
          heading: `How was working on ${projectTitle}?`,
          paragraphs: [
            `Hi ${firstName(clientName)},`,
            `Thank you for trusting me with ${projectTitle}. Would you share a few words about how it went? It takes about two minutes, and with your permission it will appear on my portfolio.`,
          ],
          note: note ? { text: note, from: OWNER_FIRST_NAME } : undefined,
          button: { label: "Write your testimonial", url },
          footer: "You're receiving this one-off email because we worked together. Just reply if you have any questions.",
        });
        emailed = true;
        await ref.update({ emailedAt: FieldValue.serverTimestamp() });
      } catch {
        emailError = "The email couldn't be sent. Send the request on WhatsApp or from your own email instead.";
      }
    }
  }

  return json({ id: token, url, emailed, emailError });
};

/**
 * Accepts a testimonial from anyone (no account needed). It is saved as
 * pending for the owner to approve; the contact details are stored
 * separately in an admin-only collection so they are never made public.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isAdminConfigured(process.env)) return unavailable();
  const body = await readJson<Body & RequestBody>(request);
  if (!body) return errorResponse("Invalid request.");
  if (body.action === "request") return createRequest(request, body);
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

  const db = adminDb();
  // A personal request link stands in for the rate limit: it works once.
  const requestToken = body.requestToken ?? "";
  const requestRef = requestToken && TOKEN_PATTERN.test(requestToken) ? db.collection("testimonialRequests").doc(requestToken) : null;
  const requestDoc = requestRef ? await requestRef.get() : null;
  if (requestToken && !requestDoc?.exists) return errorResponse("This testimonial link isn't valid any more.", 404);
  if (requestDoc?.get("status") === "completed") return errorResponse("You've already sent your testimonial. Thank you!", 409);

  const ip = clientIp(request);
  if (!requestDoc && ip && !(await rateLimit("testimonial", ip, IP_LIMIT, IP_WINDOW_MS))) {
    return errorResponse("Too many testimonials from this connection. Please try again later.", 429);
  }

  // Signed-in visitors are linked to their account (so they can see it while pending).
  const caller = await getCaller(request);
  const ref = db.collection("testimonials").doc();
  const batch = db.batch();
  batch.set(ref, {
    authorId: caller?.verified ? caller.uid : null,
    authorName: name,
    authorAvatar: null,
    authorTitle,
    projectSlug: requestDoc ? String(requestDoc.get("projectSlug")) : projectSlug,
    rating,
    content,
    status: "pending",
    requestId: requestDoc ? requestToken : null,
    createdAt: FieldValue.serverTimestamp(),
  });
  if (requestRef) {
    batch.update(requestRef, { status: "completed", completedAt: FieldValue.serverTimestamp(), testimonialId: ref.id });
  }
  batch.set(db.collection("testimonialContacts").doc(ref.id), {
    contact,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(db.collection("notifications").doc(), {
    userId: "admins",
    type: "pending_testimonial",
    message: requestDoc
      ? `${name} sent the testimonial you asked for (${requestDoc.get("projectTitle")})`
      : `${name} left a testimonial waiting for your approval`,
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
