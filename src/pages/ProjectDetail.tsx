import { lazy, Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, CodeBracketIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useProjects } from "../hooks/useProjects";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useApprovedTestimonials } from "../hooks/useTestimonials";
import { projectThreadId } from "../hooks/useComments";
import TestimonialCard from "../components/testimonials/TestimonialCard";
import WriteTestimonial from "../components/testimonials/WriteTestimonial";
import Comments from "../components/Comments";
import ShareMenu from "../components/share/ShareMenu";
import { useAuthStore } from "../stores/authStore";
import { absoluteUrl, projectShareImage } from "../utils/share";

const RequestTestimonialModal = lazy(() => import("../dashboardUi/RequestTestimonial"));

/** Case-study page for a portfolio project. */
export default function ProjectDetail(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending } = useProjects();
  const project = data?.projects.find((item) => item.slug === slug);
  const { data: testimonials = [] } = useApprovedTestimonials();
  const projectTestimonials = testimonials.filter((item) => item.projectSlug === slug);
  const isAdmin = useAuthStore((state) => state.role === "admin" || state.role === "super_admin");
  const [requesting, setRequesting] = useState(false);

  useDocumentMeta({
    title: project?.title ?? "Project",
    description: project?.summary,
    image: project?.imageUrl,
  });

  if (!project) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        {isPending ? (
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
        <ShareMenu
          title={project.title}
          summary={project.summary}
          url={absoluteUrl(`/projects/${project.slug}`)}
          imageUrl={projectShareImage(project.imageUrl)}
          buttonClassName="btn btn-ghost gap-2 border border-base-300"
          label="Share"
          align="start"
        />
        {isAdmin && (
          <button type="button" className="btn btn-ghost gap-2 border border-base-300" onClick={() => setRequesting(true)}>
            <PaperAirplaneIcon className="h-4 w-4" /> Request a testimonial
          </button>
        )}
      </div>
      {isAdmin && requesting && (
        <Suspense fallback={null}>
          <RequestTestimonialModal open projectSlug={project.slug} onClose={() => setRequesting(false)} />
        </Suspense>
      )}
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

      <section aria-labelledby="project-testimonials" className="mt-16 border-t border-base-300 pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="project-testimonials" className="text-2xl font-bold">What the client said</h2>
            <p className="mt-1 text-base-content/65">Testimonials tagged with this project.</p>
          </div>
          <WriteTestimonial projectSlug={project.slug} label="Leave a testimonial" className="btn btn-ghost gap-2 border border-base-300" />
        </div>
        {projectTestimonials.length > 0 ? (
          <ul className="grid items-start gap-6 md:grid-cols-2">
            {projectTestimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} hideProject />
              </li>
            ))}
          </ul>
        ) : (
          <p className="surface p-6 text-center text-base-content/60">No testimonials for this project yet.</p>
        )}
      </section>

      <div className="mt-16 border-t border-base-300 pt-10">
        <Comments
          heading="Comments"
          thread={{ id: projectThreadId(project.slug), title: project.title, link: `/projects/${project.slug}` }}
        />
      </div>
    </article>
  );
}
