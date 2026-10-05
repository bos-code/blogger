import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export type ImageSize = "small" | "medium" | "full";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFigure: {
      setFigure: (attrs: {
        src: string;
        alt?: string;
        caption?: string;
        size?: ImageSize;
      }) => ReturnType;
      updateFigure: (attrs: Partial<{ alt: string; caption: string; size: ImageSize }>) => ReturnType;
    };
  }
}

/**
 * Block image rendered as <figure><img><figcaption></figure>, with alt text,
 * an optional caption and a display size. Plain <img> tags (older posts) are
 * still parsed.
 */
export const ImageFigure = Image.extend({
  name: "image",
  inline: false,
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: "",
        parseHTML: (element) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent ?? "",
      },
      size: {
        default: "full",
        parseHTML: (element) =>
          element.closest("figure")?.getAttribute("data-size") ?? "full",
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure.image-figure img[src]" }, { tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, size, ...imageAttributes } = HTMLAttributes as Record<string, string>;
    const img = [
      "img",
      mergeAttributes(imageAttributes, { loading: "lazy", decoding: "async" }),
    ];
    return caption
      ? ["figure", { class: "image-figure", "data-size": size || "full" }, img, ["figcaption", {}, caption]]
      : ["figure", { class: "image-figure", "data-size": size || "full" }, img];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
      updateFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});
