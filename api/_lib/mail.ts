import nodemailer, { type Transporter } from "nodemailer";
import { escapeHtml } from "./http.js";

let transporter: Transporter | null = null;

/**
 * Gmail via Nodemailer (GMAIL_USER + GMAIL_APP_PASSWORD). Set
 * EMAIL_TRANSPORT=json to log emails instead of sending (tests/dev).
 */
const getTransporter = (): Transporter => {
  if (transporter) return transporter;
  if (process.env.EMAIL_TRANSPORT === "json") {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD).");
  transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return transporter;
};

export const isEmailConfigured = (): boolean =>
  process.env.EMAIL_TRANSPORT === "json" || Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

export const ownerEmail = (): string => process.env.ALERT_EMAIL || process.env.GMAIL_USER || "";

const SITE_NAME = process.env.SITE_NAME || "John Dera";

export interface MailInput {
  to: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  footer?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

/** Simple, email-client-safe HTML layout. */
export const renderEmail = ({ heading, paragraphs, button, footer }: MailInput): string => `<!doctype html>
<html><body style="margin:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#1d252d">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e1e5ea">
      <tr><td style="padding:28px 28px 8px;font-family:monospace;font-weight:bold;color:#0b8f7c">&lt;/&gt; ${escapeHtml(SITE_NAME)}</td></tr>
      <tr><td style="padding:8px 28px 0"><h1 style="font-size:22px;line-height:1.3;margin:0 0 12px">${escapeHtml(heading)}</h1>
        ${paragraphs.map((text) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${escapeHtml(text)}</p>`).join("")}
      </td></tr>
      ${
        button
          ? `<tr><td style="padding:8px 28px 24px"><a href="${escapeHtml(button.url)}" style="display:inline-block;background:#0b8f7c;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px">${escapeHtml(button.label)}</a></td></tr>`
          : ""
      }
      ${footer ? `<tr><td style="padding:16px 28px 24px;border-top:1px solid #e1e5ea;font-size:12px;color:#5b6570">${footer}</td></tr>` : ""}
    </table>
  </td></tr></table>
</body></html>`;

export const sendMail = async (input: MailInput): Promise<void> => {
  const text = [input.heading, "", ...input.paragraphs, input.button ? `\n${input.button.label}: ${input.button.url}` : ""].join("\n");
  await getTransporter().sendMail({
    from: `"${SITE_NAME}" <${process.env.GMAIL_USER || "no-reply@example.com"}>`,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text,
    html: renderEmail(input),
    headers: input.headers,
  });
};
