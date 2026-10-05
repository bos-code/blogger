import { useEffect } from "react";

const SITE_NAME = "John Dera";
const DEFAULT_TITLE = "John Dera | Front-End Developer";
const DEFAULT_DESCRIPTION =
  "John Dera — front-end developer portfolio and blog. Projects, articles on React and the web, and ways to get in touch.";

interface DocumentMeta {
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
};

/**
 * Sets the page title, description, social-share and structured-data tags
 * for the current route, restoring the site defaults on unmount.
 */
export function useDocumentMeta({
  title,
  description,
  image,
  type = "website",
  noIndex = false,
  jsonLd = null,
}: DocumentMeta): void {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = window.location.origin + window.location.pathname;

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "robots", noIndex ? "noindex" : "index,follow");
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }
    setCanonical(url);

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:title", DEFAULT_TITLE);
      setMeta("property", "og:description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:type", "website");
      setMeta("name", "robots", "index,follow");
      document.head
        .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
        .forEach((tag) => tag.remove());
      script?.remove();
    };
  }, [title, description, image, type, noIndex, jsonLdText]);
}
