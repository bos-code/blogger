import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
  element: HTMLElement | null;
}

export default function SectionNav(): React.ReactElement {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Find all sections with IDs (Hero, About, Stack, Work, Blog, Contact)
    const sectionIds = ["hero", "about", "stack", "work", "blog", "contact"];
    const foundSections: Section[] = sectionIds
      .map((id) => {
        const element = document.getElementById(id) || 
                      document.querySelector(`[data-section="${id}"]`) as HTMLElement;
        if (element) {
          return {
            id,
            label: id.charAt(0).toUpperCase() + id.slice(1),
            element,
          };
        }
        return null;
      })
      .filter((s): s is Section => s !== null);

    setSections(foundSections);

    // Intersection Observer to track active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.id || entry.target.getAttribute("data-section");
            if (id) {
              setActiveSection(id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -20% 0px",
        threshold: [0, 0.5, 1],
      }
    );

    foundSections.forEach((section) => {
      if (section.element) {
        observer.observe(section.element);
      }
    });

    return () => {
      foundSections.forEach((section) => {
        if (section.element) {
          observer.unobserve(section.element);
        }
      });
    };
  }, []);

  const scrollToSection = (sectionId: string): void => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.element) {
      section.element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (sections.length === 0) {
    return <></>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
    >
      <nav className="bg-base-100/80 backdrop-blur-lg border border-primary/20 rounded-full p-2 shadow-lg">
        <ul className="flex flex-col gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group ${
                  activeSection === section.id
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content hover:bg-primary/20"
                }`}
                aria-label={`Go to ${section.label} section`}
                title={section.label}
              >
                {/* Active indicator */}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 text-xs font-semibold">
                  {section.label.charAt(0)}
                </span>
                
                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-2 py-1 bg-base-300 text-base-content text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {section.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}

