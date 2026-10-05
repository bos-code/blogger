import { useEffect, useState } from "react";
import type { HeadingInfo } from "../utils/posts";

interface TableOfContentsProps {
  headings: HeadingInfo[];
  variant?: "sidebar" | "inline";
}

/** "On this page" navigation that highlights the section being read. */
export default function TableOfContents({
  headings,
  variant = "sidebar",
}: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  const minLevel = Math.min(...headings.map((heading) => heading.level));

  const list = (
    <ol className="flex flex-col gap-0.5 text-sm">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={(event) => {
              event.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
              history.replaceState(null, "", `#${heading.id}`);
              setActiveId(heading.id);
            }}
            aria-current={activeId === heading.id ? "location" : undefined}
            className={`block rounded-md border-l-2 py-1 pr-2 transition-colors ${
              activeId === heading.id
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "border-transparent text-base-content/65 hover:text-base-content"
            }`}
            style={{ paddingLeft: `${0.75 + (heading.level - minLevel) * 0.85}rem` }}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="surface group mb-8 p-4 lg:hidden">
        <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            On this page
            <span className="text-xs text-base-content/55 group-open:hidden">Show</span>
            <span className="hidden text-xs text-base-content/55 group-open:inline">Hide</span>
          </span>
        </summary>
        <nav aria-label="Table of contents" className="mt-3">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents" className="max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/55">
        On this page
      </h2>
      {list}
    </nav>
  );
}
