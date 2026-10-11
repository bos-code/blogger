import { useState } from "react";
import { Link } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Avatar from "../ui/Avatar";
import Comments from "../Comments";
import { Stars } from "./Stars";
import { testimonialThreadId } from "../../hooks/useComments";
import { formatDate } from "../../utils/date";
import type { Project, Testimonial } from "../../types";

interface TestimonialCardProps {
  testimonial: Testimonial;
  project?: Project | null;
  /** Hide the project tag (e.g. on that project's own page). */
  hideProject?: boolean;
}

/** A client's testimonial with its own comment thread. */
export default function TestimonialCard({ testimonial, project, hideProject = false }: TestimonialCardProps): React.ReactElement {
  const [showComments, setShowComments] = useState(false);
  const pending = testimonial.status !== "approved";

  return (
    <article className="surface flex h-full flex-col p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {testimonial.rating ? <Stars rating={testimonial.rating} /> : null}
        {pending && (
          <span className="badge badge-warning badge-sm">{testimonial.status === "rejected" ? "Not published" : "Awaiting approval"}</span>
        )}
      </div>

      <blockquote className="flex-1 text-base-content/85">
        <p className="whitespace-pre-line leading-relaxed">“{testimonial.content}”</p>
      </blockquote>

      <footer className="mt-6 flex items-center gap-3">
        <Avatar name={testimonial.authorName} src={testimonial.authorAvatar} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{testimonial.authorName}</p>
          {testimonial.authorTitle && <p className="truncate text-sm text-base-content/60">{testimonial.authorTitle}</p>}
          {!hideProject && testimonial.projectSlug && (
            project ? (
              <Link to={`/projects/${project.slug}`} className="mt-0.5 block truncate text-sm text-primary hover:underline">
                on {project.title}
              </Link>
            ) : (
              <p className="mt-0.5 truncate text-sm text-base-content/60">on {testimonial.projectSlug}</p>
            )
          )}
        </div>
      </footer>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-base-300 pt-3 text-sm">
        <time className="text-xs text-base-content/55">{formatDate(testimonial.createdAt)}</time>
        {!pending && (
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1.5"
            aria-expanded={showComments}
            onClick={() => setShowComments((open) => !open)}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            {showComments ? "Hide comments" : "Comments"}
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3">
          <Comments
            compact
            heading="Comments"
            thread={{
              id: testimonialThreadId(testimonial.id),
              title: `${testimonial.authorName}'s testimonial`,
              ownerId: testimonial.authorId,
              link: "/#testimonials",
            }}
          />
        </div>
      )}
    </article>
  );
}
