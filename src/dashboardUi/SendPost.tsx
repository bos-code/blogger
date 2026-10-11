import { useId, useState, type FormEvent } from "react";
import Modal from "../components/ui/Modal";
import SendPanel from "../components/share/SendPanel";
import { useSendPost } from "../hooks/useTestimonialRequests";
import { site } from "../data/site";
import { postPath } from "../utils/posts";
import { absoluteUrl, firstName, postShareMessage } from "../utils/share";
import type { BlogPost } from "../types";

const FROM = firstName(site.fullName);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Recipient {
  name: string;
  email: string;
  phone: string;
  note: string;
  emailed: { sent: boolean; error?: string | null } | null;
}

const excerptOf = (post: BlogPost): string => {
  const text = (post.excerpt || post.seoDescription || "").trim();
  return text.length > 180 ? `${text.slice(0, 179).trimEnd()}…` : text;
};

function RecipientForm({ post, onReady }: { post: BlogPost; onReady: (recipient: Recipient) => void }) {
  const ids = { name: useId(), email: useId(), phone: useId(), note: useId(), send: useId() };
  const sendPost = useSendPost();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emailValid = !email.trim() || EMAIL_PATTERN.test(email.trim());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailValid) return setError("That email address doesn't look right.");
    setError(null);
    const recipient = { name: name.trim(), email: email.trim(), phone: phone.trim(), note: note.trim(), emailed: null };
    if (!recipient.email || !sendEmail) return onReady(recipient);
    try {
      await sendPost.mutateAsync({ postId: post.id, name: recipient.name, email: recipient.email, note: recipient.note || undefined });
      onReady({ ...recipient, emailed: { sent: true } });
    } catch (sendError) {
      onReady({
        ...recipient,
        emailed: { sent: false, error: sendError instanceof Error ? sendError.message : "The email couldn't be sent." },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor={ids.name} className="field-label">
          Their name (optional)
        </label>
        <input id={ids.name} className="input w-full" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.phone} className="field-label">
            WhatsApp number (optional)
          </label>
          <input id={ids.phone} className="input w-full" type="tel" inputMode="tel" maxLength={20} placeholder="0801 234 5678" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div>
          <label htmlFor={ids.email} className="field-label">
            Email (optional)
          </label>
          <input id={ids.email} className={`input w-full ${emailValid ? "" : "input-error"}`} type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
      </div>
      {email.trim() && (
        <label htmlFor={ids.send} className="flex cursor-pointer items-center gap-2 text-sm">
          <input id={ids.send} type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} />
          Email the post from the site now (cover image, summary and a button)
        </label>
      )}
      <div>
        <label htmlFor={ids.note} className="field-label">
          Personal note (optional)
        </label>
        <textarea id={ids.note} className="textarea w-full" rows={3} maxLength={600} placeholder="e.g. This is the approach I mentioned on our call." value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={sendPost.isPending}>
          {sendPost.isPending && <span className="loading loading-spinner loading-xs" />}
          {email.trim() && sendEmail ? "Send email and continue" : "Continue"}
        </button>
      </div>
    </form>
  );
}

/** Sends a published post to someone, with its cover image and a personal note. */
export default function SendPostModal({ post, onClose }: { post: BlogPost | null; onClose: () => void }): React.ReactElement {
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const close = () => {
    setRecipient(null);
    onClose();
  };
  const url = post ? absoluteUrl(postPath(post)) : "";

  return (
    <Modal
      open={post !== null}
      onClose={close}
      title={recipient ? (recipient.name ? `Send to ${firstName(recipient.name)}` : "Send the post") : "Send this post"}
      description={post?.title}
      size="md"
    >
      {post &&
        (recipient ? (
          <SendPanel
            title={post.title}
            url={url}
            subject={`${FROM} shared a post with you: ${post.title}`}
            initialMessage={postShareMessage({ name: recipient.name, title: post.title, excerpt: excerptOf(post), note: recipient.note, url, from: FROM })}
            imageUrl={post.coverImage}
            phone={recipient.phone}
            email={recipient.email}
            emailed={recipient.emailed}
          />
        ) : (
          <RecipientForm post={post} onReady={setRecipient} />
        ))}
    </Modal>
  );
}
