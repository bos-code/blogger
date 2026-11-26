import SectionHead from "./sectionHead";

const SKILL_GROUPS = [
  {
    title: "Frontend & mobile",
    skills: ["React", "Next.js", "React Native", "Expo", "TypeScript", "JavaScript", "HTML5", "CSS3"],
  },
  {
    title: "Backend & desktop",
    skills: ["Go", "Node.js", "NestJS", "REST APIs", "PostgreSQL", "Prisma", "Firebase", "Supabase", "Wails"],
  },
  {
    title: "UI & state management",
    skills: ["Tailwind CSS", "shadcn/ui", "DaisyUI", "Material UI", "Framer Motion", "GSAP", "TanStack Query", "Zustand"],
  },
  {
    title: "Engineering & delivery",
    skills: ["Git & GitHub", "GitHub Actions", "Playwright", "Vite", "Vercel", "Figma"],
  },
  {
    title: "Security & systems",
    skills: ["EDR/XDR", "Endpoint security", "System integration", "Automated testing"],
  },
  {
    title: "CMS & commerce",
    skills: ["Shopify", "WordPress", "Webflow", "Wix"],
  },
]

function Stack(): React.ReactElement {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="stack-heading"
          eyebrow="Skills"
          title="Tools I work with"
          descript="Technologies and engineering practices I use across web, desktop and mobile projects."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {SKILL_GROUPS.map((group) => (
            <div key={group.title} className="surface p-6">
              <h3 className="font-mono text-sm uppercase tracking-wider text-primary">{group.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill} className="rounded-lg border border-base-300 bg-base-200/60 px-3 py-1.5 text-sm font-medium">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stack;
