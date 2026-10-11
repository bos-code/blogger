/** Helpers for share messages, previews and emails. */

export const OWNER_FIRST_NAME = process.env.OWNER_FIRST_NAME || "Chidera";

export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
export const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;
export const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

/** Makes a site-relative path ("/project-images/x.webp") absolute. */
export const absoluteUrl = (base: string, value?: string | null): string => {
  if (!value) return "";
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return `${base}${value}`;
  return "";
};

/**
 * Preview image for a project. Built-in mockups have a 1200x630 JPEG copy
 * (public/project-images/og), which link previews and email clients handle
 * better than WebP.
 */
export const projectPreviewImage = (base: string, imageUrl?: string | null): string => {
  const builtIn = imageUrl?.match(/^\/project-images\/([a-z0-9-]+)\.webp$/);
  if (builtIn) return `${base}/project-images/og/${builtIn[1]}.jpg`;
  return absoluteUrl(base, imageUrl);
};

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? "";
