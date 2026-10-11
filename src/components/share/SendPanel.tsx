import { useId, useState } from "react";
import {
  ArrowUpOnSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import WhatsApp from "../../assets/whatsapp";
import { canUseShareSheet, copyText, mailtoLink, shareRich, whatsappTo } from "../../utils/share";
import { showToast } from "../../utils/sweetalert";

interface SendPanelProps {
  /** Project or post title (share-sheet title and image alt). */
  title: string;
  url: string;
  subject: string;
  initialMessage: string;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  /** Result of emailing it from the site, if that was tried. */
  emailed?: { sent: boolean; error?: string | null } | null;
}

/**
 * Sends a prepared message, with its picture, by WhatsApp, email or any app
 * on the device. The message can be edited first.
 */
export default function SendPanel({
  title,
  url,
  subject,
  initialMessage,
  imageUrl,
  phone,
  email,
  emailed,
}: SendPanelProps): React.ReactElement {
  const messageId = useId();
  const [message, setMessage] = useState(initialMessage);
  const shareSheet = canUseShareSheet();

  const share = async () => {
    const outcome = await shareRich({ title, text: message, url, imageUrl });
    if (outcome === "copied") void showToast("info", "Message copied", "Paste it into any app.");
    if (outcome === "failed") void showToast("error", "Couldn't open sharing on this device");
  };

  const copy = async (text: string, label: string) => {
    if (await copyText(text)) void showToast("success", `${label} copied`);
    else void showToast("error", "Couldn't copy");
  };

  return (
    <div className="flex flex-col gap-4">
      {emailed?.sent && (
        <p role="status" className="flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" /> Emailed to {email}, with the picture and a button to open it.
        </p>
      )}
      {emailed?.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" /> {emailed.error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-base-300 bg-base-200/60">
        {imageUrl && <img src={imageUrl} alt={title} className="aspect-[1200/630] w-full object-cover" loading="lazy" />}
        <div className="p-3">
          <label htmlFor={messageId} className="field-label">
            Message
          </label>
          <textarea
            id={messageId}
            className="textarea w-full text-sm leading-relaxed"
            rows={8}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <p className="mt-1 text-xs text-base-content/55">
            {shareSheet
              ? "“More apps” sends the picture with this message as its caption."
              : "WhatsApp and email show the picture as a preview of the link."}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <a href={whatsappTo(phone, message)} target="_blank" rel="noopener noreferrer" className="btn btn-success gap-2">
          <WhatsApp /> {phone ? "Send on WhatsApp" : "WhatsApp: choose chat"}
        </a>
        <a href={mailtoLink(email, subject, message)} className="btn btn-ghost gap-2 border border-base-300">
          <EnvelopeIcon className="h-5 w-5" /> {emailed?.sent ? "Email again from my app" : "Send from my email"}
        </a>
        {shareSheet && (
          <button type="button" className="btn btn-ghost gap-2 border border-base-300" onClick={() => void share()}>
            <ArrowUpOnSquareIcon className="h-5 w-5" /> More apps (with picture)
          </button>
        )}
        <button type="button" className="btn btn-ghost gap-2 border border-base-300" onClick={() => void copy(message, "Message")}>
          <ClipboardDocumentIcon className="h-5 w-5" /> Copy message
        </button>
        <button type="button" className="btn btn-ghost gap-2 border border-base-300" onClick={() => void copy(url, "Link")}>
          <LinkIcon className="h-5 w-5" /> Copy link only
        </button>
      </div>
    </div>
  );
}
