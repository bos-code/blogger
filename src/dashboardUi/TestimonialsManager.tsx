import { useMemo, useState } from "react";
import { ChatBubbleBottomCenterTextIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import { Stars } from "../components/testimonials/Stars";
import {
  useDeleteTestimonial,
  useDeleteTestimonialRequest,
  useModerateTestimonial,
  useTestimonialAdminData,
} from "../hooks/useTestimonials";
import { useProjects } from "../hooks/useProjects";
import RequestTestimonialModal from "./RequestTestimonial";
import { toWhatsAppNumber } from "../utils/share";
import { formatDate } from "../utils/date";
import { showDeleteConfirm, showError, showSuccess } from "../utils/sweetalert";
import type { Testimonial, TestimonialRequest, TestimonialRequestStatus, TestimonialStatus } from "../types";

/** Email → mailto; phone → WhatsApp chat (Nigerian 0-prefixed numbers become +234). */
const contactHref = (contact: string): string =>
  contact.includes("@") ? `mailto:${contact}` : `https://wa.me/${toWhatsAppNumber(contact)}`;

type Tab = TestimonialStatus | "requests";

const REQUEST_STATUS: Record<TestimonialRequestStatus, { label: string; className: string }> = {
  sent: { label: "Sent", className: "badge-ghost" },
  opened: { label: "Opened", className: "badge-info" },
  completed: { label: "Answered", className: "badge-success" },
};

const TABS: Array<{ status: TestimonialStatus; label: string }> = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Published" },
  { status: "rejected", label: "Rejected" },
];

/** Admin moderation for client testimonials. */
export default function TestimonialsManager(): React.ReactElement {
  const { data: adminData, isPending, error: loadError, refetch } = useTestimonialAdminData();
  const testimonials = useMemo(() => adminData?.testimonials ?? [], [adminData]);
  const { data: projectData } = useProjects();
  const contacts = adminData?.contacts;
  const moderate = useModerateTestimonial();
  const remove = useDeleteTestimonial();
  const requests = adminData?.requests ?? [];
  const requestsPending = isPending;
  const removeRequest = useDeleteTestimonialRequest();
  const [tab, setTab] = useState<Tab>("pending");
  const [requesting, setRequesting] = useState(false);
  const [resending, setResending] = useState<TestimonialRequest | null>(null);
  const openRequests = requests.filter((request) => request.status !== "completed").length;

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

  const handleDeleteRequest = (request: TestimonialRequest) =>
    void showDeleteConfirm(`the request to ${request.clientName}`, async () => {
      try {
        await removeRequest.mutateAsync(request.id);
      } catch {
        showError("Couldn't delete", "Please try again.");
      }
    });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client testimonials appear on the home page and on the tagged project once you publish them."
        actions={
          <button type="button" className="btn btn-primary gap-2" onClick={() => setRequesting(true)}>
            <PaperAirplaneIcon className="h-5 w-5" /> Request a testimonial
          </button>
        }
      />
      <RequestTestimonialModal
        open={requesting || resending !== null}
        resend={resending}
        onClose={() => {
          setRequesting(false);
          setResending(null);
        }}
      />

      {loadError && (
        <div role="alert" className="alert alert-error mb-4 flex flex-wrap justify-between gap-2">
          <span>Couldn't load testimonials: {loadError.message}</span>
          <button type="button" className="btn btn-sm" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}

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
        <button
          type="button"
          role="tab"
          aria-selected={tab === "requests"}
          className={`tab gap-2 ${tab === "requests" ? "tab-active" : ""}`}
          onClick={() => setTab("requests")}
        >
          Requests
          <span className="badge badge-sm">{openRequests}</span>
        </button>
      </div>

      <div className="surface overflow-hidden">
        {tab === "requests" ? (
          requestsPending ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner" aria-label="Loading requests" />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={PaperAirplaneIcon}
              title="No requests yet"
              description="Ask a client for a testimonial about a project. They get a personal page with everything filled in."
            />
          ) : (
            <ul className="divide-y divide-base-300">
              {requests.map((request) => (
                <li key={request.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <Avatar name={request.clientName} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold">{request.clientName}</p>
                      <span className={`badge badge-sm ${REQUEST_STATUS[request.status].className}`}>{REQUEST_STATUS[request.status].label}</span>
                    </div>
                    <p className="mt-1 text-sm text-base-content/70">{request.projectTitle}</p>
                    <p className="mt-1 text-xs text-base-content/55">
                      Sent {formatDate(request.createdAt)}
                      {request.emailedAt ? " · emailed" : ""}
                      {request.completedAt ? ` · answered ${formatDate(request.completedAt)}` : request.openedAt ? ` · opened ${formatDate(request.openedAt)}` : ""}
                      {[request.phone, request.email].filter(Boolean).length ? ` · ${[request.phone, request.email].filter(Boolean).join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {request.status !== "completed" && (
                      <button type="button" className="btn btn-ghost btn-sm border border-base-300" onClick={() => setResending(request)}>
                        Send again
                      </button>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm text-error" onClick={() => handleDeleteRequest(request)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : isPending ? (
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
                  {contacts?.get(testimonial.id) && (
                    <p className="mt-2 text-sm">
                      Contact:{" "}
                      <a
                        href={contactHref(contacts.get(testimonial.id)!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {contacts.get(testimonial.id)}
                      </a>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-base-content/55">
                    {formatDate(testimonial.createdAt)}
                    {projectTitle(testimonial.projectSlug) ? ` · Project: ${projectTitle(testimonial.projectSlug)}` : " · General"}
                    {testimonial.requestId ? " · From your request" : ""}
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
