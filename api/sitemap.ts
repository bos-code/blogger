import { fetchApprovedPosts, fetchProjectSlugs } from "./_lib/publicData.js";
import { postUrl, siteUrl } from "./_lib/http.js";

/** XML sitemap of public pages, posts and project case studies (served at /sitemap.xml). */
export async function GET(request: Request): Promise<Response> {
  const base = siteUrl(request);
  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${base}/` },
    { loc: `${base}/blog` },
    { loc: `${base}/privacy` },
    { loc: `${base}/terms` },
  ];
  try {
    const [posts, projects] = await Promise.all([fetchApprovedPosts(), fetchProjectSlugs()]);
    for (const post of posts) {
      urls.push({ loc: postUrl(base, post), lastmod: (post.updatedAt ?? post.createdAt)?.slice(0, 10) });
    }
    for (const slug of projects) urls.push({ loc: `${base}/projects/${slug}` });
  } catch {
    // Fall back to the static pages.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `<url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
