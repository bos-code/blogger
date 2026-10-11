import { useMemo, useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import { Stars } from "../components/testimonials/Stars";
import { useAllTestimonials, useDeleteTestimonial, useModerateTestimonial } from "../hooks/useTestimonials";
import { useProjects } from "../hooks/useProjects";
import { formatDate } from "../utils/date";
import { showDeleteConfirm, showError, showSuccess } from "../utils/sweetalert";
import type { Testimonial, TestimonialStatus } from "../types";

const TABS: Array<{ status: TestimonialStatus; label: string }> = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Published" },
  { status: "rejected", label: "Rejected" },
];

/** Admin moderation for client testimonials. */
export default function TestimonialsManager(): React.ReactElement {
  const { data: testimonials = [], isPending } = useAllTestimonials();
  const { data: projectData } = useProjects();
  const moderate = useModerateTestimonial();
  const remove = useDeleteTestimonial();
  const [tab, setTab] = useState<TestimonialStatus>("pending");

  const counts = useMemo(() => {
    const result: Record<TestimonialStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    testimonials.forEach((item) => (result[item.status] += 1));
    return result;
  }, [testimonials]);
  const projectTitle = (slug?: string | null) =>
    slug ? (projectData?.projects.find((project) => project.slug === slug)?.title ?? slug) : null;
  const shown = testimonials.filter((item) => item.status === tab);

  const setStatus = async (testimonial: Testimonial, status: TestimonialStatus) => {
    try {
      await moderate.mutateAsync({ testimonial, status });
      showSuccess(status === "approved" ? "Testimonial published" : status === "rejected" ? "Testimonial rejected" : "Moved back to pending");
    } catch {
      showError("That didn't work", "Please try again.");
    }
  };

  const handleDelete = (testimonial: Testimonial) =>
    void showDeleteConfirm(`${testimonial.authorName}'s testimonial`, async () => {
      try {
        await remove.mutateAsync(testimonial.id);
      } catch {
        showError("Couldn't delete", "Please try again.");
      }
    });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client testimonials appear on the home page and on the tagged project once you publish them."
      />

      <div role="tablist" aria-label="Testimonial status" className="tabs tabs-box mb-4 w-fit">
        {TABS.map(({ status, label }) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={tab === status}
            className={`tab gap-2 ${tab === status ? "tab-active" : ""}`}
            onClick={() => setTab(status)}
          >
            {label}
            <span className="badge badge-sm">{counts[status]}</span>
          </button>
        ))}
      </div>

      <div className="surface overflow-hidden">
        {isPending ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-spinner" aria-label="Loading testimonials" />
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={ChatBubbleBottomCenterTextIcon}
            title={tab === "pending" ? "Nothing waiting for review" : "Nothing here yet"}
            description={tab === "pending" ? "New testimonials will show up here for approval." : undefined}
          />
        ) : (
          <ul className="divide-y divide-base-300">
            {shown.map((testimonial) => (
              <li key={testimonial.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <Avatar name={testimonial.authorName} src={testimonial.authorAvatar} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-semibold">{testimonial.authorName}</p>
                    {testimonial.authorTitle && <p className="text-sm text-base-content/60">{testimonial.authorTitle}</p>}
                    {testimonial.rating ? <Stars rating={testimonial.rating} className="h-3.5 w-3.5" /> : null}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-base-content/85">{testimonial.content}</p>
                  <p className="mt-2 text-xs text-base-content/55">
                    {formatDate(testimonial.createdAt)}
                    {projectTitle(testimonial.projectSlug) ? ` · Project: ${projectTitle(testimonial.projectSlug)}` : " · General"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {testimonial.status !== "approved" && (
                    <button type="button" className="btn btn-success btn-sm" disabled={moderate.isPending} onClick={() => void setStatus(testimonial, "approved")}>
                      Approve
                    </button>
                  )}
                  {testimonial.status === "approved" && (
                    <button type="button" className="btn btn-ghost btn-sm border border-base-300" disabled={moderate.isPending} onClick={() => void setStatus(testimonial, "pending")}>
                      Unpublish
                    </button>
                  )}
                  {testimonial.status === "pending" && (
                    <button type="button" className="btn btn-ghost btn-sm border border-base-300" disabled={moderate.isPending} onClick={() => void setStatus(testimonial, "rejected")}>
                      Reject
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(testimonial)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
