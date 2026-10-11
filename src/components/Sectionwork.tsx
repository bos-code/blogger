import { useState } from "react";
import ProjectCard from "./ProjectCard";
import SectionHead from "./sectionHead";
import { useProjects } from "../hooks/useProjects";
import { FALLBACK_PROJECTS } from "../data/projects";

/** Projects shown before "Show all"; three full rows on desktop. */
const INITIAL_COUNT = 9;

function Work(): React.ReactElement {
  const { data, isPending } = useProjects();
  const projects = data?.projects ?? FALLBACK_PROJECTS;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? projects : projects.slice(0, INITIAL_COUNT);

  return (
    <section id="work" aria-labelledby="work-heading" className="bg-base-200/60 py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="work-heading"
          eyebrow="Work"
          title="Selected projects"
          descript="A few things I've designed and built."
        />
        {isPending ? (
          // Placeholders until the real list is known, so the cards never swap after appearing.
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading projects">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="surface overflow-hidden">
                <div className="skeleton aspect-[16/9] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-4/5" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul id="project-list" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
        {!isPending && projects.length > INITIAL_COUNT && (
          <div className="mt-10 text-center">
            <button
              type="button"
              className="btn btn-ghost border border-base-300"
              aria-expanded={showAll}
              aria-controls="project-list"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? "Show fewer projects" : `Show all ${projects.length} projects`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Work;
