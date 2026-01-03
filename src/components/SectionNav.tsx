import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  UserIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  element: HTMLElement | null;
}

const sectionConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  hero: { label: "Home", icon: HomeIcon },
  about: { label: "About", icon: UserIcon },
  stack: { label: "Stack", icon: CodeBracketIcon },
  work: { label: "Work", icon: BriefcaseIcon },
  blog: { label: "Blog", icon: DocumentTextIcon },
  contact: { label: "Contact", icon: EnvelopeIcon },
};

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
        const config = sectionConfig[id];
        if (element && config) {
          return {
            id,
            label: config.label,
            icon: config.icon,
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
    >
      <nav className="bg-base-100/90 backdrop-blur-lg border border-primary/30 rounded-2xl p-3 shadow-2xl">
        <ul className="flex flex-col gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <li key={section.id}>
                <motion.button
                  onClick={() => scrollToSection(section.id)}
                  className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-lg shadow-primary/50"
                      : "bg-base-200/50 text-base-content hover:bg-primary/20 hover:text-primary"
                  }`}
                  aria-label={`Go to ${section.label} section`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary-content rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 ${isActive ? "text-primary-content" : "text-base-content group-hover:text-primary"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Section Name - Always visible when active, visible on hover otherwise */}
                  <motion.span
                    className={`relative z-10 text-sm font-semibold whitespace-nowrap ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    } transition-opacity duration-300`}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      width: isActive ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {section.label}
                  </motion.span>
                  
                  {/* Hover tooltip (fallback for when name is hidden) */}
                  {!isActive && (
                    <span className="absolute right-full mr-3 px-3 py-2 bg-base-300 text-base-content text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-primary/20">
                      {section.label}
                      <span className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 border-4 border-transparent border-l-base-300"></span>
                    </span>
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );
}

