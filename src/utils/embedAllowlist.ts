/**
 * Iframe sources allowed in post content. Anything else is stripped when
 * content is sanitised, so a post can't frame arbitrary sites.
 */
const ALLOWED_EMBEDS: Array<{ host: string; path: RegExp }> = [
  { host: "www.youtube.com", path: /^\/embed\/[\w-]+$/ },
  { host: "youtube.com", path: /^\/embed\/[\w-]+$/ },
  { host: "www.youtube-nocookie.com", path: /^\/embed\/[\w-]+$/ },
  { host: "codepen.io", path: /^\/[\w-]+\/embed\/[\w-]+$/ },
  { host: "codesandbox.io", path: /^\/embed\/[\w-]+$/ },
];

export const isAllowedEmbedSrc = (src: string | null | undefined): boolean => {
  if (!src) return false;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  return ALLOWED_EMBEDS.some(({ host, path }) => url.hostname === host && path.test(url.pathname));
};
