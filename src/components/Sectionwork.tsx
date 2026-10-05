import ProjectCard from "./ProjectCard";
import SectionHead from "./sectionHead";
import { useProjects } from "../hooks/useProjects";
import { FALLBACK_PROJECTS } from "../data/projects";

function Work(): React.ReactElement {
  const { data } = useProjects();
  const projects = data?.projects ?? FALLBACK_PROJECTS;

  return (
    <section id="work" aria-labelledby="work-heading" className="bg-base-200/60 py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="work-heading"
          eyebrow="Work"
          title="Selected projects"
          descript="A few things I've designed and built."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Work;
