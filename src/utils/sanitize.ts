import DOMPurify from "dompurify";

export const sanitizeRichText = (html: string): string =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
    ],
  });
