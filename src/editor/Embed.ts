import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (attrs: { src: string; title?: string }) => ReturnType;
    };
  }
}

/**
 * Converts a CodePen or CodeSandbox share URL into its embeddable URL.
 * Returns null for unsupported links.
 */
export const toEmbedUrl = (rawUrl: string): string | null => {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  if (url.hostname === "codepen.io") {
    // https://codepen.io/{user}/pen/{id} -> https://codepen.io/{user}/embed/{id}
    const match = url.pathname.match(/^\/([^/]+)\/(?:pen|embed)\/([^/]+)/);
    return match
      ? `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result`
      : null;
  }

  if (url.hostname === "codesandbox.io") {
    // https://codesandbox.io/s/{id} or /p/sandbox/{id} -> /embed/{id}
    const match = url.pathname.match(/^\/(?:s|embed|p\/sandbox|p\/devbox)\/([^/?]+)/);
    return match ? `https://codesandbox.io/embed/${match[1]}` : null;
  }

  return null;
};

/** Responsive iframe for CodePen / CodeSandbox demos. */
export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Embedded demo" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.embed-frame iframe[src]",
        getAttrs: (element) => ({
          src: (element as HTMLElement).getAttribute("src"),
          title: (element as HTMLElement).getAttribute("title"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "embed-frame" },
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          loading: "lazy",
          allowfullscreen: "true",
          frameborder: "0",
          sandbox: "allow-scripts allow-same-origin allow-popups allow-forms",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
