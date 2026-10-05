import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { EnvelopeIcon, MapPinIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { db } from "../firebaseconfig";
import { apiRequest } from "../services/api";
import { showSuccess } from "../utils/sweetalert";
import SectionHead from "./sectionHead";
import Github from "../assets/github";
import LinkedIn from "../assets/linkedin";
import { site } from "../data/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: [3, 100], message: [10, 5000] } as const;

type Field = "name" | "email" | "message";

const validate = (values: Record<Field, string>): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();
  if (name.length < LIMITS.name[0]) errors.name = "Please enter at least 3 characters.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email address.";
  if (message.length < LIMITS.message[0]) errors.message = "Please write at least 10 characters.";
  return errors;
};

function SectionContact(): React.ReactElement {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (field: Field) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      };
      const ref = await addDoc(collection(db, "messages"), {
        ...payload,
        createdAt: serverTimestamp(),
        read: false,
      });
      // Email alert to the site owner (best-effort; the message is already saved).
      void apiRequest("contact-alert", { body: { messageId: ref.id } }).catch(() => undefined);

      showSuccess("Message sent!", "Thanks for reaching out — I'll get back to you soon.");
      setValues({ name: "", email: "", message: "" });
    } catch {
      setSubmitError(`Your message couldn't be sent. Please try again, or email me at ${site.email}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: Field) => `${field === "message" ? "textarea" : "input"} w-full ${errors[field] ? "input-error textarea-error" : ""}`;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-base-200/60 py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="contact-heading"
          eyebrow="Contact"
          title="Let's work together"
          descript="I'm currently available for freelance and full-time work. Send a message and I'll reply within a couple of days."
        />

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="surface flex flex-col gap-5 p-6 sm:p-8">
            <h3 className="text-lg font-semibold">Other ways to reach me</h3>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-primary">
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 truncate">{site.email}</span>
            </a>
            <p className="flex items-center gap-3">
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <MapPinIcon className="h-5 w-5" />
              </span>
              {site.location} · Remote friendly
            </p>
            <div className="mt-auto flex gap-2 pt-2">
              <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost gap-2 border border-base-300">
                <Github /> GitHub
              </a>
              <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost gap-2 border border-base-300">
                <LinkedIn /> LinkedIn
              </a>
            </div>
          </aside>

          <form onSubmit={handleSubmit} noValidate className="surface flex flex-col gap-5 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="field-label">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={update("name")}
                  maxLength={LIMITS.name[1]}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={fieldClass("name")}
                />
                {errors.name && (
                  <p id="contact-name-error" className="mt-1 text-xs text-error">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="contact-email" className="field-label">
                  Your email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  onChange={update("email")}
                  maxLength={254}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={fieldClass("email")}
                />
                {errors.email && (
                  <p id="contact-email-error" className="mt-1 text-xs text-error">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="contact-message" className="field-label">
                  Message
                </label>
                <span className="text-xs tabular-nums text-base-content/50">
                  {values.message.length}/{LIMITS.message[1]}
                </span>
              </div>
              <textarea
                id="contact-message"
                rows={6}
                value={values.message}
                onChange={update("message")}
                maxLength={LIMITS.message[1]}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                placeholder="Tell me about your project or role"
                className={fieldClass("message")}
              />
              {errors.message && (
                <p id="contact-message-error" className="mt-1 text-xs text-error">
                  {errors.message}
                </p>
              )}
            </div>
            {submitError && (
              <p role="alert" className="text-sm text-error">
                {submitError}
              </p>
            )}
            <button type="submit" className="btn btn-primary self-start" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" /> Sending…
                </>
              ) : (
                <>
                  Send message <PaperAirplaneIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SectionContact;
