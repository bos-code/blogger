import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTestimonialInvite } from "../hooks/useTestimonialRequests";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { TestimonialForm } from "../components/testimonials/WriteTestimonial";
import { firstName } from "../utils/share";
import { whatsappLink } from "../data/site";

/** Personal page a client opens from a testimonial request. */
export default function TestimonialRequestPage(): React.ReactElement {
  const { token } = useParams<{ token: string }>();
  const { data: invite, isPending, error } = useTestimonialInvite(token);
  const [submitted, setSubmitted] = useState(false);

  useDocumentMeta({
    title: invite ? `Your feedback on ${invite.projectTitle}` : "Share your feedback",
    noIndex: true,
  });

  if (isPending) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="page-container flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-bold">This link isn't working</h1>
        <p className="text-base-content/70">
          {error?.message ?? "It may have been removed."} You can still send your feedback on WhatsApp.
        </p>
        <a href={whatsappLink("Hi Chidera, I'd like to share a testimonial.")} target="_blank" rel="noopener noreferrer" className="btn btn-success">
          Message on WhatsApp
        </a>
      </div>
    );
  }

  const done = submitted || invite.completed;

  return (
    <div className="page-container max-w-3xl pb-20">
      <div className="surface overflow-hidden">
        {invite.projectImage && (
          <img src={invite.projectImage} alt={`${invite.projectTitle} on laptop, tablet and phone`} className="aspect-[16/10] w-full border-b border-base-300 object-cover" />
        )}
        <div className="p-5 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">{invite.projectTitle}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {done ? `Thank you, ${firstName(invite.clientName)}!` : `Hi ${firstName(invite.clientName)}, how did it go?`}
          </h1>

          {done ? (
            <div className="mt-6 flex flex-col gap-4">
              <p className="flex items-start gap-2 text-lg text-base-content/80">
                <CheckCircleIcon className="mt-1 h-6 w-6 shrink-0 text-success" />
                {submitted
                  ? `Your testimonial is with ${invite.from}. It will appear on the site once it's approved.`
                  : "You've already sent your testimonial for this project. Thank you!"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/projects/${invite.projectSlug}`} className="btn btn-primary">
                  See the project page
                </Link>
                <Link to="/" className="btn btn-ghost border border-base-300">
                  Visit the site
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-base-content/75 sm:text-lg">
                {invite.from} would love a few words about working together on {invite.projectTitle}. It takes about two minutes, and
                nothing is published until it's approved.
              </p>
              {invite.note && (
                <blockquote className="mt-5 rounded-r-xl border-l-4 border-primary bg-primary/5 px-4 py-3">
                  <p className="whitespace-pre-line italic text-base-content/85">{invite.note}</p>
                  <footer className="mt-2 text-sm text-base-content/60">— {invite.from}</footer>
                </blockquote>
              )}
              <div className="mt-8">
                <TestimonialForm
                  onDone={() => setSubmitted(true)}
                  invite={{
                    token: token ?? "",
                    name: invite.clientName,
                    contact: invite.contact,
                    projectSlug: invite.projectSlug,
                    projectTitle: invite.projectTitle,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
