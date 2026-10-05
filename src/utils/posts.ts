import type { BlogPost } from "../types";

const WORDS_PER_MINUTE = 200;

/** Strips tags and collapses whitespace from rich-text HTML. */
export const htmlToText = (html: string): string =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const countWords = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

export const calculateReadingTime = (html: string): number =>
  Math.max(1, Math.ceil(countWords(htmlToText(html)) / WORDS_PER_MINUTE));

export const getReadingTime = (post: Pick<BlogPost, "content" | "readingTime">): number =>
  post.readingTime || calculateReadingTime(post.content ?? "");

/** Shortens text at a word boundary, adding an ellipsis only when cut. */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

export const getExcerpt = (
  post: Pick<BlogPost, "content" | "excerpt">,
  maxLength = 160
): string =>
  post.excerpt?.trim() || truncateText(htmlToText(post.content ?? ""), maxLength);

export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

/** Readable post URL; the ID stays first so older /blog/:id links keep working. */
export const postPath = (post: Pick<BlogPost, "id" | "title">): string => {
  const slug = slugify(post.title ?? "");
  return slug ? `/blog/${post.id}/${slug}` : `/blog/${post.id}`;
};

export const getLikeCount = (post: Pick<BlogPost, "likedBy" | "likes">): number =>
  post.likedBy?.length ?? post.likes ?? 0;

export interface HeadingInfo {
  id: string;
  text: string;
  level: number;
}

/**
 * Gives every h1–h3 a stable, unique id (for the table of contents and
 * shareable anchors) and returns the list of headings.
 */
export const addHeadingIds = (
  html: string
): { html: string; headings: HeadingInfo[] } => {
  const headings: HeadingInfo[] = [];
  const used = new Map<string, number>();

  const withIds = html.replace(
    /<h([1-3])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      const text = htmlToText(inner);
      if (!text) return `<h${level}${attrs}>${inner}</h${level}>`;
      const base = slugify(text) || "section";
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count ? `${base}-${count + 1}` : base;
      headings.push({ id, text, level: Number(level) });
      const cleanAttrs = attrs.replace(/\sid="[^"]*"/i, "");
      return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html: withIds, headings };
};
