import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";

const LANGUAGES = { javascript, typescript, css, xml, json, bash, python };
for (const [name, language] of Object.entries(LANGUAGES)) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, language);
}
hljs.registerAliases(["js", "jsx"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["html"], { languageName: "xml" });
hljs.registerAliases(["shell", "sh"], { languageName: "bash" });

const COPY_BUTTON =
  '<button type="button" class="code-copy-button btn btn-xs absolute right-2 top-2 border-base-300 bg-base-100/90 font-sans" aria-label="Copy code">Copy</button>';

/**
 * Adds syntax highlighting and copy buttons to code blocks, and safe rel
 * attributes to links opening in new tabs. Runs on already-sanitized HTML.
 */
export const enhanceArticleHtml = (html: string): string => {
  if (typeof DOMParser === "undefined" || !html.includes("<")) return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return html;

  root.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (code && !code.classList.contains("hljs")) {
      const language = [...code.classList]
        .find((name) => name.startsWith("language-"))
        ?.slice("language-".length);
      const text = code.textContent ?? "";
      try {
        const result =
          language && hljs.getLanguage(language)
            ? hljs.highlight(text, { language })
            : null;
        if (result) {
          code.innerHTML = result.value;
          code.classList.add("hljs");
        }
      } catch {
        // Leave the block unhighlighted.
      }
    }
    pre.classList.add("relative");
    pre.insertAdjacentHTML("beforeend", COPY_BUTTON);
  });

  root.querySelectorAll("a[target='_blank']").forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });

  return root.innerHTML;
};
