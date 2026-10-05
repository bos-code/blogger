import { useEffect, useState, type ComponentType } from "react";
import {
  HomeIcon,
  UserIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const SECTIONS: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "hero", label: "Home", icon: HomeIcon },
  { id: "about", label: "About", icon: UserIcon },
  { id: "stack", label: "Skills", icon: CodeBracketIcon },
  { id: "experience", label: "Experience", icon: AcademicCapIcon },
  { id: "work", label: "Work", icon: BriefcaseIcon },
  { id: "blog", label: "Blog", icon: DocumentTextIcon },
  { id: "contact", label: "Contact", icon: EnvelopeIcon },
];

/** Floating dot navigation for the home page sections (wide screens only). */
export default function SectionNav(): React.ReactElement {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => Boolean(element)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 2xl:block"
    >
      <ul className="surface flex flex-col gap-1 p-1.5">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="group relative">
              <a
                href={`#${id}`}
                aria-label={label}
                aria-current={isActive ? "location" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isActive ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                <Icon className="h-5 w-5" />
              </a>
              <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-base-300 px-2.5 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
