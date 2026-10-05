import { siteUrl } from "./_lib/http.js";

/** robots.txt pointing crawlers at the sitemap (served at /robots.txt). */
export function GET(request: Request): Response {
  const base = siteUrl(request);
  const body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /edit\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=86400" },
  });
}
