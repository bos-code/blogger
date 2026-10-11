import { useId, useState, type FormEvent } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modal from "../ui/Modal";
import { StarInput } from "./Stars";
import { useAuthStore } from "../../stores/authStore";
import { useProjects } from "../../hooks/useProjects";
import {
  TESTIMONIAL_MAX_LENGTH,
  TESTIMONIAL_MIN_LENGTH,
  useSubmitTestimonial,
} from "../../hooks/useTestimonials";
import { showSuccess } from "../../utils/sweetalert";
import { whatsappLink } from "../../data/site";

function TestimonialForm({ projectSlug, onDone }: { projectSlug?: string; onDone: () => void }) {
  const ids = { name: useId(), contact: useId(), project: useId(), title: useId(), content: useId(), website: useId() };
  const user = useAuthStore((state) => state.user);
  const { data } = useProjects();
  const submit = useSubmitTestimonial();
  const [name, setName] = useState(user?.name ?? "");
  const [contact, setContact] = useState(user?.email ?? "");
  const [website, setWebsite] = useState("");
  const [project, setProject] = useState(projectSlug ?? "");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await submit.mutateAsync({ name, contact, content, authorTitle: title, projectSlug: project || null, rating, website });
      onDone();
      showSuccess("Thank you!", "Your testimonial will appear once it's approved.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "That didn't work. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className="field-label">
            Your name
          </label>
          <input
            id={ids.name}
            className="input w-full"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor={ids.contact} className="field-label">
            Email or phone
          </label>
          <input
            id={ids.contact}
            className="input w-full"
            autoComplete="email"
            maxLength={254}
            placeholder="you@company.com or 0801 234 5678"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            aria-describedby={`${ids.contact}-hint`}
            required
          />
        </div>
        <p id={`${ids.contact}-hint`} className="-mt-2 text-xs text-base-content/55 sm:col-span-2">
          Private: only used to confirm the testimonial is really from you. It's never shown on the site.
        </p>
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={ids.website}>Website</label>
        <input id={ids.website} tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>
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
          {error}{" "}
          <a
            href={whatsappLink(`Hi Chidera, here's my testimonial:\n\n${content.trim()}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="link font-semibold"
          >
            Send it on WhatsApp
          </a>
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onDone} disabled={submit.isPending}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submit.isPending || content.trim().length < TESTIMONIAL_MIN_LENGTH || name.trim().length < 2 || !contact.trim()}
        >
          {submit.isPending && <span className="loading loading-spinner loading-xs" />}
          Submit testimonial
        </button>
      </div>
    </form>
  );
}

/** "Write a testimonial" call to action. Anyone can write one; no account needed. */
export default function WriteTestimonial({
  projectSlug,
  label = "Write a testimonial",
  className = "btn btn-primary gap-2",
}: {
  projectSlug?: string;
  label?: string;
  className?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
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
