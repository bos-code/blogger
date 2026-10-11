import { ArrowUpOnSquareIcon, EnvelopeIcon, LinkIcon, ShareIcon } from "@heroicons/react/24/outline";
import WhatsApp from "../../assets/whatsapp";
import { canUseShareSheet, copyText, mailtoLink, shareRich, whatsappTo } from "../../utils/share";
import { showToast } from "../../utils/sweetalert";

interface ShareMenuProps {
  title: string;
  /** One-line summary sent along with the link. */
  summary?: string | null;
  url: string;
  /** Picture attached when sharing to apps (cover image or project mockup). */
  imageUrl?: string | null;
  buttonClassName?: string;
  label?: string;
  align?: "start" | "center" | "end" | "right";
}

const itemClass = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-base-200";

/**
 * Share options for a post or project: the device share sheet (with the
 * picture attached), WhatsApp, X, LinkedIn, email and copy link. Shared
 * links show a rich preview card (see api/share.ts).
 */
export default function ShareMenu({
  title,
  summary,
  url,
  imageUrl,
  buttonClassName = "btn btn-ghost btn-sm btn-circle",
  label,
  align = "end",
}: ShareMenuProps): React.ReactElement {
  const message = [`*${title}*`, summary?.trim() ?? "", url].filter(Boolean).join("\n\n");
  const encoded = encodeURIComponent(url);
  const close = () => (document.activeElement as HTMLElement | null)?.blur();

  const shareSheet = async () => {
    close();
    const outcome = await shareRich({ title, text: message, url, imageUrl });
    if (outcome === "copied") void showToast("success", "Copied", "Paste it anywhere to share.");
  };

  const copyLink = async () => {
    close();
    if (await copyText(url)) void showToast("success", "Link copied");
    else void showToast("error", "Couldn't copy the link");
  };

  return (
    <div className={`dropdown ${align === "end" ? "dropdown-end" : align === "right" ? "dropdown-right" : align === "center" ? "dropdown-center" : ""}`}>
      <button type="button" tabIndex={0} className={buttonClassName} aria-label={label ? undefined : "Share"} title="Share" aria-haspopup="menu">
        <ShareIcon className="h-5 w-5" />
        {label}
      </button>
      <ul tabIndex={0} role="menu" aria-label={`Share ${title}`} className={`dropdown-content z-30 w-60 ${align === "right" ? "ml-2" : "mt-2"} rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-xl`}>
        {canUseShareSheet() && (
          <li role="none">
            <button type="button" role="menuitem" className={itemClass} onClick={() => void shareSheet()}>
              <ArrowUpOnSquareIcon className="h-5 w-5" /> Share with picture…
            </button>
          </li>
        )}
        <li role="none">
          <a role="menuitem" className={itemClass} href={whatsappTo(null, message)} target="_blank" rel="noopener noreferrer" onClick={close}>
            <WhatsApp className="h-5 w-5 text-success" /> WhatsApp
          </a>
        </li>
        <li role="none">
          <a role="menuitem" className={itemClass} href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encoded}`} target="_blank" rel="noopener noreferrer" onClick={close}>
            <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center font-bold">𝕏</span> X (Twitter)
          </a>
        </li>
        <li role="none">
          <a role="menuitem" className={itemClass} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer" onClick={close}>
            <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded bg-[#0a66c2] text-[11px] font-bold text-white">in</span> LinkedIn
          </a>
        </li>
        <li role="none">
          <a role="menuitem" className={itemClass} href={mailtoLink(null, title, message.replace(/\*/g, ""))} onClick={close}>
            <EnvelopeIcon className="h-5 w-5" /> Email
          </a>
        </li>
        <li role="none">
          <button type="button" role="menuitem" className={itemClass} onClick={() => void copyLink()}>
            <LinkIcon className="h-5 w-5" /> Copy link
          </button>
        </li>
      </ul>
    </div>
  );
}
