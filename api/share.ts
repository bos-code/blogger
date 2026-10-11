import { describePost, fetchPublicPost, fetchPublicProject, type PublicPost } from "./_lib/publicData.js";
import { EMAIL_PATTERN, errorResponse, escapeHtml, json, postUrl, readJson, siteUrl } from "./_lib/http.js";
import { adminDb, getCaller, isAdminRole } from "./_lib/firebaseAdmin.js";
import { isAdminConfigured } from "./_lib/adminCredentials.js";
import { isEmailConfigured, ownerEmail, sendMail } from "./_lib/mail.js";
import { OWNER_FIRST_NAME, TOKEN_PATTERN, absoluteUrl, firstName, projectPreviewImage } from "./_lib/share.js";

interface Preview {
  url: string;
  title: string;
  description: string;
  image: string;
  type: "article" | "website";
}

const previewPage = ({ url, title, description, image, type }: Preview): Response => {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(url);
  const i = escapeHtml(image);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${t} | John Dera</title>
<meta name="description" content="${d}">
<link rel="canonical" href="${u}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="John Dera">
<meta property="og:title" content="${t}"><meta property="og:description" content="${d}">
<meta property="og:url" content="${u}">${i ? `<meta property="og:image" content="${i}"><meta property="og:image:alt" content="${t}">` : ""}
<meta name="twitter:card" content="${i ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${t}"><meta name="twitter:description" content="${d}">${i ? `<meta name="twitter:image" content="${i}">` : ""}
<meta http-equiv="refresh" content="0;url=${u}">
</head><body><a href="${u}">${t}</a></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=600" },
  });
};

const projectPreview = async (base: string, slug: string): Promise<Response> => {
  const project = await fetchPublicProject(slug).catch(() => null);
  const url = `${base}/projects/${slug}`;
  if (!project) return Response.redirect(url, 302);
  return previewPage({
    url,
    title: project.title,
    description: project.summary ?? "",
    image: projectPreviewImage(base, project.imageUrl),
    type: "website",
  });
};

/** Link preview for a personal testimonial request (no private details). */
const requestPreview = async (base: string, token: string): Promise<Response> => {
  const url = `${base}/testimonial/${token}`;
  if (!TOKEN_PATTERN.test(token) || !isAdminConfigured(process.env)) return Response.redirect(url, 302);
  const snapshot = await adminDb().collection("testimonialRequests").doc(token).get().catch(() => null);
  if (!snapshot?.exists) return Response.redirect(url, 302);
  const title = String(snapshot.get("projectTitle"));
  return previewPage({
    url,
    title: `How was working on ${title}?`,
    description: `${OWNER_FIRST_NAME} would love a short testimonial from you. It takes about two minutes.`,
    image: projectPreviewImage(base, snapshot.get("projectImage")),
    type: "website",
  });
};

/**
 * Social-share previews. Link-preview bots (which don't run JavaScript) are
 * routed here by vercel.json and get Open Graph tags for a post (?id=), a
 * project (?project=) or a testimonial request (?request=); anyone else is
 * redirected to the page itself.
 */
export async function GET(request: Request): Promise<Response> {
  const base = siteUrl(request);
  const params = new URL(request.url).searchParams;
  if (params.has("project")) return projectPreview(base, params.get("project") ?? "");
  if (params.has("request")) return requestPreview(base, params.get("request") ?? "");

  const post = await fetchPublicPost(params.get("id") ?? "").catch(() => null);
  if (!post) return Response.redirect(`${base}/blog`, 302);
  return previewPage({
    url: postUrl(base, post),
    title: post.seoTitle || post.title,
    description: describePost(post, 200),
    image: absoluteUrl(base, post.coverImage),
    type: "article",
  });
}

interface SendBody {
  postId?: string;
  name?: string;
  email?: string;
  note?: string;
}

/** Admins: email a published post to one person, with a personal note. */
export async function POST(request: Request): Promise<Response> {
  if (!isAdminConfigured(process.env)) return errorResponse("Sending isn't set up on this deployment yet.", 503);
  const caller = await getCaller(request);
  if (!caller || !caller.verified || !isAdminRole(caller.role)) return errorResponse("Not allowed.", 403);
  if (!isEmailConfigured()) {
    return errorResponse("Email isn't set up on this deployment, so send it on WhatsApp or from your own email instead.", 503);
  }

  const body = await readJson<SendBody>(request);
  const postId = body?.postId ?? "";
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const note = body?.note?.trim() || null;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(postId)) return errorResponse("Unknown post.");
  if (name.length > 100) return errorResponse("That name is too long.");
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return errorResponse("Enter a valid email address.");
  if (note && note.length > 600) return errorResponse("Keep the personal note under 600 characters.");

  const db = adminDb();
  const snapshot = await db.collection("posts").doc(postId).get();
  if (!snapshot.exists || snapshot.get("status") !== "approved") return errorResponse("Only published posts can be sent.");
  const post = { id: postId, ...(snapshot.data() as Omit<PublicPost, "id">) };
  const base = siteUrl(request);
  const url = postUrl(base, post);
  const image = absoluteUrl(base, post.coverImage);

  try {
    await sendMail({
      to: email,
      ...(ownerEmail() ? { replyTo: ownerEmail() } : {}),
      subject: `${OWNER_FIRST_NAME} shared a post with you: ${post.title}`,
      image: image ? { url: image, alt: post.coverImageAlt || post.title, href: url } : undefined,
      heading: post.title,
      paragraphs: [
        ...(name ? [`Hi ${firstName(name)},`] : []),
        `I thought you'd enjoy this post I wrote.`,
        describePost(post, 280),
      ],
      note: note ? { text: note, from: OWNER_FIRST_NAME } : undefined,
      button: { label: "Read the post", url },
      footer: "Sent to you personally. You haven't been added to any mailing list.",
    });
  } catch {
    return errorResponse("The email couldn't be sent. Try WhatsApp or your own email instead.", 502);
  }
  return json({ ok: true, url });
}
