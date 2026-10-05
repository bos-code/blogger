import SectionHead from "./sectionHead";

const SKILL_GROUPS = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "React Native (Expo)", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3"],
  },
  {
    title: "Styling & animation",
    skills: ["Tailwind CSS", "DaisyUI", "shadcn/ui", "Material UI", "Chakra UI", "Framer Motion", "GSAP"],
  },
  {
    title: "Data, state & tools",
    skills: ["Firebase", "REST APIs", "TanStack Query", "Zustand", "React Router", "Git & GitHub", "Vite", "Vercel", "Figma"],
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
          descript="I'm always learning — these are the ones I reach for every day."
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
