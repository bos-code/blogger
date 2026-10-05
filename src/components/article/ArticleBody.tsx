import { useMemo } from "react";
import { enhanceArticleHtml } from "./enhanceArticleHtml";

interface ArticleBodyProps {
  /** Sanitized HTML (with heading ids already applied). */
  html: string;
  className?: string;
}

export const ARTICLE_PROSE =
  "prose prose-base max-w-none sm:prose-lg prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-base-content prose-a:text-primary prose-a:underline-offset-2 prose-strong:text-base-content prose-code:rounded prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:p-4 prose-blockquote:border-l-primary prose-blockquote:text-base-content/80 prose-img:rounded-xl prose-li:marker:text-primary prose-th:text-base-content prose-figcaption:text-base-content/60";

const copyCode = async (button: HTMLButtonElement) => {
  const pre = button.closest("pre");
  const code = pre?.querySelector("code")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(code);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }
  window.setTimeout(() => (button.textContent = "Copy"), 1600);
};

/** Renders post HTML with reading typography, syntax highlighting and copy buttons. */
export default function ArticleBody({ html, className = "" }: ArticleBodyProps): React.ReactElement {
  const enhanced = useMemo(() => enhanceArticleHtml(html), [html]);

  return (
    <div
      className={`article-content ${ARTICLE_PROSE} ${className}`}
      onClick={(event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".code-copy-button");
        if (button) void copyCode(button);
      }}
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}
