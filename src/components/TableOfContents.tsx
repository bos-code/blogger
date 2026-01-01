import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps): React.ReactElement {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    
    const extractedHeadings: Heading[] = Array.from(headingElements).map((el, index) => {
      const id = el.id || `heading-${index}`;
      if (!el.id) {
        el.id = id;
      }
      return {
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      };
    });

    setHeadings(extractedHeadings);

    // Update active heading on scroll
    const handleScroll = (): void => {
      const headingElements = extractedHeadings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveId(element.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [content]);

  if (headings.length === 0) return <></>;

  const scrollToHeading = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 bg-base-100 rounded-2xl shadow-lg p-4 sm:p-6 border border-base-300 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <h3 className="text-lg sm:text-xl font-bold mb-4 text-base-content">
        Table of Contents
      </h3>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToHeading(heading.id);
            }}
            className={`block text-sm sm:text-base py-1.5 px-2 rounded-lg transition-colors ${
              activeId === heading.id
                ? "bg-primary text-primary-content font-semibold"
                : "text-base-content/70 hover:text-base-content hover:bg-base-200"
            }`}
            style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </motion.div>
  );
}

