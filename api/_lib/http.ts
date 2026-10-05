/** Small helpers shared by the serverless functions. */

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

export const errorResponse = (message: string, status = 400): Response => json({ error: message }, status);

/** Reads a small JSON body; returns null for invalid or oversized input. */
export const readJson = async <T>(request: Request, maxBytes = 10_000): Promise<T | null> => {
  const text = await request.text();
  if (!text || text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const siteUrl = (request?: Request): string => {
  const configured = process.env.SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (request) return new URL(request.url).origin;
  return "http://localhost:5173";
};

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

export const postUrl = (base: string, post: { id: string; title: string }): string => {
  const slug = slugify(post.title);
  return slug ? `${base}/blog/${post.id}/${slug}` : `${base}/blog/${post.id}`;
};
