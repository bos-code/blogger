import { describePost, fetchApprovedPosts } from "./_lib/publicData.js";
import { escapeHtml, postUrl, siteUrl } from "./_lib/http.js";

/** RSS 2.0 feed of published posts (served at /rss.xml). */
export async function GET(request: Request): Promise<Response> {
  const base = siteUrl(request);
  let items = "";
  try {
    const posts = (await fetchApprovedPosts()).slice(0, 50);
    items = posts
      .map((post) => {
        const url = postUrl(base, post);
        const date = new Date(post.scheduledFor ?? post.createdAt ?? Date.now()).toUTCString();
        const categories = [post.category, ...(post.tags ?? [])]
          .filter(Boolean)
          .map((category) => `<category>${escapeHtml(String(category))}</category>`)
          .join("");
        return `<item><title>${escapeHtml(post.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate><description>${escapeHtml(describePost(post, 400))}</description>${post.authorName ? `<dc:creator>${escapeHtml(post.authorName)}</dc:creator>` : ""}${categories}</item>`;
      })
      .join("");
  } catch {
    items = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>John Dera — Blog</title>
<link>${base}/blog</link>
<atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
<description>Articles on front-end development, React, TypeScript and building for the web.</description>
<language>en</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
