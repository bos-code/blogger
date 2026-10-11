/** Helpers for sending things to people: WhatsApp, email and the share sheet. */

/** Phone number in WhatsApp's format: digits only, Nigerian 0-prefixed numbers become 234. */
export const toWhatsAppNumber = (phone: string): string => {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  return digits;
};

/** WhatsApp chat with a pre-filled message, to a number or (without one) letting you pick the chat. */
export const whatsappTo = (phone: string | null | undefined, text: string): string =>
  `https://wa.me/${phone ? toWhatsAppNumber(phone) : ""}?text=${encodeURIComponent(text)}`;

export const mailtoLink = (email: string | null | undefined, subject: string, body: string): string =>
  `mailto:${email ? encodeURIComponent(email) : ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const absoluteUrl = (path: string): string =>
  /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;

/**
 * Picture to send along with a project. Built-in mockups have a JPEG copy
 * sized for link previews (public/project-images/og), which every app accepts.
 */
export const projectShareImage = (imageUrl?: string | null): string | null => {
  if (!imageUrl) return null;
  const builtIn = imageUrl.match(/^\/project-images\/([a-z0-9-]+)\.webp$/);
  return builtIn ? `/project-images/og/${builtIn[1]}.jpg` : imageUrl;
};

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? "";

export const canUseShareSheet = (): boolean => typeof navigator !== "undefined" && typeof navigator.share === "function";

const imageFile = async (imageUrl: string, name: string): Promise<File | null> => {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
    return new File([blob], `${safeName}.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
};

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/**
 * Opens the device's share sheet with the picture attached and the message
 * as its caption (so WhatsApp, Instagram, etc. get the image, not just a
 * link). Falls back to text-only sharing, then to copying the message.
 */
export const shareRich = async ({
  title,
  text,
  url,
  imageUrl,
}: {
  title: string;
  /** Full message; should already contain the link. */
  text: string;
  url: string;
  imageUrl?: string | null;
}): Promise<ShareOutcome> => {
  if (canUseShareSheet()) {
    const file = imageUrl ? await imageFile(absoluteUrl(imageUrl), title) : null;
    const withFile: ShareData = file ? { title, text, files: [file] } : { title, text };
    try {
      if (file && navigator.canShare?.(withFile)) await navigator.share(withFile);
      else await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  return (await copyText(text)) ? "copied" : "failed";
};

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** The message a client gets with a testimonial request. */
export const testimonialRequestMessage = ({
  clientName,
  projectTitle,
  note,
  url,
  from,
}: {
  clientName: string;
  projectTitle: string;
  note?: string | null;
  url: string;
  from: string;
}): string =>
  [
    `Hi ${firstName(clientName)},`,
    `Thank you for trusting me with *${projectTitle}*. Would you share a few words about how it went? It takes about two minutes, and with your permission it will appear on my portfolio.`,
    note?.trim() ?? "",
    `Write it here: ${url}`,
    `Thank you!\n${from}`,
  ]
    .filter(Boolean)
    .join("\n\n");

/** The message someone gets when a post is sent to them. */
export const postShareMessage = ({
  name,
  title,
  excerpt,
  note,
  url,
  from,
}: {
  name?: string;
  title: string;
  excerpt?: string | null;
  note?: string | null;
  url: string;
  from: string;
}): string =>
  [
    name?.trim() ? `Hi ${firstName(name)},` : "",
    `I thought you'd enjoy this post I wrote:`,
    `*${title}*${excerpt ? `\n${excerpt}` : ""}`,
    note?.trim() ?? "",
    `Read it here: ${url}`,
    from,
  ]
    .filter(Boolean)
    .join("\n\n");
