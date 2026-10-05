import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { useProjects } from "../hooks/useProjects";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/** Case-study page for a portfolio project. */
export default function ProjectDetail(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const { data, isFetching } = useProjects();
  const project = data?.projects.find((item) => item.slug === slug);

  useDocumentMeta({
    title: project?.title ?? "Project",
    description: project?.summary,
    image: project?.imageUrl,
  });

  if (!project) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        {isFetching ? (
          <span className="loading loading-spinner loading-lg" aria-label="Loading project" />
        ) : (
          <>
            <h1 className="text-3xl font-bold">Project not found</h1>
            <Link to="/#work" className="btn btn-primary">See all projects</Link>
          </>
        )}
      </div>
    );
  }

  return (
    <article className="page-container max-w-4xl pb-20">
      <Link to="/#work" className="btn btn-ghost btn-sm -ml-3 mb-6 gap-1.5">
        <ArrowLeftIcon className="h-4 w-4" /> All projects
      </Link>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{project.title}</h1>
      <p className="mt-4 text-lg text-base-content/75 sm:text-xl">{project.summary}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary gap-2">
            Visit live site <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost gap-2 border border-base-300">
            <CodeBracketIcon className="h-4 w-4" /> View code
          </a>
        )}
      </div>
      {project.imageUrl && (
        <img src={project.imageUrl} alt={`Screenshot of ${project.title}`} className="mt-10 w-full rounded-2xl border border-base-300 shadow-lg" />
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_14rem]">
        <div className="prose max-w-none prose-headings:text-base-content">
          {(project.description ?? "").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <aside className="flex flex-col gap-5 text-sm">
          {project.role && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/55">Role</h2>
              <p className="mt-1">{project.role}</p>
            </div>
          )}
          {project.tech && project.tech.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/55">Built with</h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {project.tech.map((tech) => (
                  <li key={tech} className="badge badge-ghost">{tech}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
