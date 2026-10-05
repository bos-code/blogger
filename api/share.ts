import { describePost, fetchPublicPost } from "./_lib/publicData.js";
import { escapeHtml, postUrl, siteUrl } from "./_lib/http.js";

/**
 * Social-share preview for a post. Link-preview bots (which don't run
 * JavaScript) are routed here by vercel.json and get Open Graph tags;
 * anyone else is redirected to the post.
 */
export async function GET(request: Request): Promise<Response> {
  const base = siteUrl(request);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const post = await fetchPublicPost(id).catch(() => null);
  if (!post) return Response.redirect(`${base}/blog`, 302);

  const url = postUrl(base, post);
  const title = escapeHtml(post.seoTitle || post.title);
  const description = escapeHtml(describePost(post, 200));
  const image = post.coverImage ? escapeHtml(post.coverImage) : "";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${title} | John Dera</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:site_name" content="John Dera">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">${image ? `<meta property="og:image" content="${image}">` : ""}
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
<meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">${image ? `<meta name="twitter:image" content="${image}">` : ""}
<meta http-equiv="refresh" content="0;url=${url}">
</head><body><a href="${url}">${title}</a></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=600" },
  });
}
