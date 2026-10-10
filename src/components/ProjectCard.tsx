import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ProjectCover from "./ProjectCover";
import type { Project } from "../types";

/** Portfolio project tile with live/code/case-study links. */
function ProjectCard({ project }: { project: Project }): React.ReactElement {
  return (
    <article className="surface group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="aspect-[16/9] overflow-hidden border-b border-base-300 bg-base-200">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={`Screenshot of ${project.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProjectCover project={project} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold">{project.title}</h3>
        <p className="mt-2 text-sm text-base-content/70">{project.summary}</p>
        {project.tech && project.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.tech.map((tech) => (
              <li key={tech} className="badge badge-ghost badge-sm">
                {tech}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm gap-1.5">
              Live site <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span className="sr-only">(opens {project.title} in a new tab)</span>
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm gap-1.5 border border-base-300">
              <CodeBracketIcon className="h-4 w-4" /> Code
            </a>
          )}
          {project.description && (
            <Link to={`/projects/${project.slug}`} className="btn btn-ghost btn-sm">
              Case study
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
