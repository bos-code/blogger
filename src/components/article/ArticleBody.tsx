import { useEffect, useRef } from "react";

interface ArticleBodyProps {
  /** Sanitized HTML (with heading ids already applied). */
  html: string;
  className?: string;
}

export const ARTICLE_PROSE =
  "prose prose-base max-w-none sm:prose-lg prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-base-content prose-a:text-primary prose-a:underline-offset-2 prose-strong:text-base-content prose-code:rounded prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:p-4 prose-blockquote:border-l-primary prose-blockquote:text-base-content/80 prose-img:rounded-xl prose-li:marker:text-primary prose-th:text-base-content prose-figcaption:text-base-content/60";

/** Renders post HTML with reading typography and copy buttons on code blocks. */
export default function ArticleBody({ html, className = "" }: ArticleBodyProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const buttons: HTMLButtonElement[] = [];

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".code-copy-button")) return;
      pre.style.position = "relative";
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "code-copy-button btn btn-xs absolute right-2 top-2 border-base-300 bg-base-100/90 font-sans";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code");
      button.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
        } catch {
          button.textContent = "Copy failed";
        }
        window.setTimeout(() => (button.textContent = "Copy"), 1600);
      });
      pre.appendChild(button);
      buttons.push(button);
    });

    root.querySelectorAll<HTMLAnchorElement>("a[target='_blank']").forEach((link) => {
      link.rel = "noopener noreferrer";
    });

    return () => buttons.forEach((button) => button.remove());
  }, [html]);

  return (
    <div
      ref={ref}
      className={`article-content ${ARTICLE_PROSE} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
