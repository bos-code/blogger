import { useId, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modal from "../ui/Modal";
import { StarInput } from "./Stars";
import { useAuthStore } from "../../stores/authStore";
import { useRole } from "../../hooks/useRole";
import { useProjects } from "../../hooks/useProjects";
import {
  TESTIMONIAL_MAX_LENGTH,
  TESTIMONIAL_MIN_LENGTH,
  useSubmitTestimonial,
} from "../../hooks/useTestimonials";
import { showSuccess } from "../../utils/sweetalert";

function TestimonialForm({ projectSlug, onDone }: { projectSlug?: string; onDone: () => void }) {
  const ids = { project: useId(), title: useId(), content: useId() };
  const { data } = useProjects();
  const submit = useSubmitTestimonial();
  const [project, setProject] = useState(projectSlug ?? "");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await submit.mutateAsync({ content, authorTitle: title, projectSlug: project || null, rating });
      onDone();
      showSuccess("Thank you!", "Your testimonial will appear once it's approved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error && !submitError.message.startsWith("Missing or insufficient")
          ? submitError.message
          : "That didn't work. Make sure your email is verified and try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor={ids.project} className="field-label">
          Project
        </label>
        <select id={ids.project} className="select w-full" value={project} onChange={(event) => setProject(event.target.value)}>
          <option value="">General (not about one project)</option>
          {(data?.projects ?? []).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={ids.title} className="field-label">
          Your role and company (optional)
        </label>
        <input
          id={ids.title}
          className="input w-full"
          maxLength={100}
          placeholder="e.g. Founder, Yakoyo African Kitchen"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <StarInput value={rating} onChange={setRating} />
      <div>
        <label htmlFor={ids.content} className="field-label">
          Your testimonial
        </label>
        <textarea
          id={ids.content}
          className="textarea w-full"
          rows={5}
          maxLength={TESTIMONIAL_MAX_LENGTH}
          placeholder="What was it like working together? What changed for you?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <p className="mt-1 text-xs tabular-nums text-base-content/50">
          {content.trim().length}/{TESTIMONIAL_MAX_LENGTH} · at least {TESTIMONIAL_MIN_LENGTH} characters
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onDone} disabled={submit.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submit.isPending || content.trim().length < TESTIMONIAL_MIN_LENGTH}>
          {submit.isPending && <span className="loading loading-spinner loading-xs" />}
          Submit testimonial
        </button>
      </div>
    </form>
  );
}

/**
 * "Write a testimonial" call to action. Signed-out visitors are sent to log
 * in first; unverified users are asked to verify their email.
 */
export default function WriteTestimonial({
  projectSlug,
  label = "Write a testimonial",
  className = "btn btn-primary gap-2",
}: {
  projectSlug?: string;
  label?: string;
  className?: string;
}): React.ReactElement {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { isEmailVerified } = useRole();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link to="/login" state={{ from: location }} className={className}>
        <PencilSquareIcon className="h-5 w-5" /> Log in to {label.charAt(0).toLowerCase() + label.slice(1)}
      </Link>
    );
  }
  if (!isEmailVerified) {
    return (
      <Link to="/verify-email" className={className}>
        <PencilSquareIcon className="h-5 w-5" /> Verify your email to {label.charAt(0).toLowerCase() + label.slice(1)}
      </Link>
    );
  }
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <PencilSquareIcon className="h-5 w-5" /> {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Write a testimonial"
        description="Worked with me? Share how it went. It'll appear on the site once approved."
        size="md"
      >
        {open && <TestimonialForm projectSlug={projectSlug} onDone={() => setOpen(false)} />}
      </Modal>
    </>
  );
}
