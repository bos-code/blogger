import { useId, useState, type FormEvent } from "react";
import Modal from "../components/ui/Modal";
import SendPanel from "../components/share/SendPanel";
import { useProjects } from "../hooks/useProjects";
import { useCreateTestimonialRequest } from "../hooks/useTestimonialRequests";
import { site } from "../data/site";
import { absoluteUrl, firstName, projectShareImage, testimonialRequestMessage } from "../utils/share";
import type { TestimonialRequest } from "../types";

const FROM = firstName(site.fullName);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Sent {
  clientName: string;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
  projectTitle: string;
  projectImage?: string | null;
  url: string;
  emailed?: { sent: boolean; error?: string | null } | null;
}

const toSent = (request: TestimonialRequest): Sent => ({
  ...request,
  url: absoluteUrl(`/testimonial/${request.id}`),
  emailed: null,
});

function RequestForm({ projectSlug, onSent }: { projectSlug?: string; onSent: (sent: Sent) => void }) {
  const ids = { project: useId(), name: useId(), email: useId(), phone: useId(), note: useId(), send: useId() };
  const { data } = useProjects();
  const projects = data?.projects ?? [];
  const create = useCreateTestimonialRequest();
  const [project, setProject] = useState(projectSlug ?? "");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = projects.find((item) => item.slug === project);
  const emailValid = !email.trim() || EMAIL_PATTERN.test(email.trim());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return setError("Choose the project you worked on together.");
    if (!emailValid) return setError("That email address doesn't look right.");
    setError(null);
    try {
      const result = await create.mutateAsync({
        clientName: clientName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        note: note.trim() || undefined,
        projectSlug: selected.slug,
        projectTitle: selected.title,
        projectImage: selected.imageUrl ?? null,
        sendEmail: Boolean(email.trim()) && sendEmail,
      });
      onSent({
        clientName: clientName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        note: note.trim() || null,
        projectTitle: selected.title,
        projectImage: selected.imageUrl ?? null,
        url: result.url,
        emailed: email.trim() && sendEmail ? { sent: result.emailed, error: result.emailError } : null,
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "That didn't work. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor={ids.project} className="field-label">
          Project
        </label>
        <select id={ids.project} className="select w-full" value={project} onChange={(event) => setProject(event.target.value)} required>
          <option value="" disabled>
            Choose a project
          </option>
          {projects.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={ids.name} className="field-label">
          Client's name
        </label>
        <input
          id={ids.name}
          className="input w-full"
          maxLength={100}
          placeholder="e.g. Grace Adeyemi"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.phone} className="field-label">
            WhatsApp number (optional)
          </label>
          <input
            id={ids.phone}
            className="input w-full"
            type="tel"
            inputMode="tel"
            maxLength={20}
            placeholder="0801 234 5678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={ids.email} className="field-label">
            Email (optional)
          </label>
          <input
            id={ids.email}
            className={`input w-full ${emailValid ? "" : "input-error"}`}
            type="email"
            maxLength={254}
            placeholder="client@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>
      {email.trim() && (
        <label htmlFor={ids.send} className="flex cursor-pointer items-center gap-2 text-sm">
          <input id={ids.send} type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} />
          Email the request from the site now (with the project picture)
        </label>
      )}
      <div>
        <label htmlFor={ids.note} className="field-label">
          Personal note (optional)
        </label>
        <textarea
          id={ids.note}
          className="textarea w-full"
          rows={3}
          maxLength={600}
          placeholder="e.g. It was a pleasure building the booking flow with you."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <p className="text-xs text-base-content/60">
        Your client gets a personal page with their name and the project already filled in. The link works once, so they don't need an account.
      </p>
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={create.isPending || !project || clientName.trim().length < 2}>
          {create.isPending && <span className="loading loading-spinner loading-xs" />}
          Create request
        </button>
      </div>
    </form>
  );
}

/**
 * Asks a client for a testimonial about one project: creates a personal
 * link, then sends it by email, WhatsApp or any app, with the project picture.
 */
export default function RequestTestimonialModal({
  open,
  onClose,
  projectSlug,
  resend,
}: {
  open: boolean;
  onClose: () => void;
  projectSlug?: string;
  /** An existing request to send again. */
  resend?: TestimonialRequest | null;
}): React.ReactElement {
  const [created, setCreated] = useState<Sent | null>(null);
  const sent = created ?? (resend ? toSent(resend) : null);
  const close = () => {
    setCreated(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={sent ? `Send to ${firstName(sent.clientName)}` : "Request a testimonial"}
      description={sent ? `Request for ${sent.projectTitle}` : "Ask a client to share how working on a project went."}
      size="md"
    >
      {sent ? (
        <SendPanel
          title={sent.projectTitle}
          url={sent.url}
          subject={`${FROM} would love your feedback on ${sent.projectTitle}`}
          initialMessage={testimonialRequestMessage({ ...sent, from: FROM })}
          imageUrl={projectShareImage(sent.projectImage)}
          phone={sent.phone}
          email={sent.email}
          emailed={sent.emailed}
        />
      ) : (
        <RequestForm projectSlug={projectSlug} onSent={setCreated} />
      )}
    </Modal>
  );
}
