import DOMPurify from "dompurify";
import { isAllowedEmbedSrc } from "./embedAllowlist";

// Only embeds from known providers survive; other iframes are removed.
DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe" && !isAllowedEmbedSrc((node as Element).getAttribute("src"))) {
    node.parentNode?.removeChild(node);
  }
});

// Links that open a new tab can't reach back into this page.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export const sanitizeRichText = (html: string): string =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
  });
