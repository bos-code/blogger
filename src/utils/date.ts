import type { BlogPost, DateValue } from "../types";

const isTimestampLike = (
  value: DateValue
): value is Exclude<DateValue, Date | string | number | null> =>
  typeof value === "object" &&
  value !== null &&
  "toDate" in value &&
  typeof value.toDate === "function";

export const toDate = (value: DateValue | undefined): Date | null => {
  if (value === null || value === undefined) return null;

  const date = isTimestampLike(value)
    ? value.toDate()
    : value instanceof Date
      ? value
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const toTimestamp = (value: DateValue | undefined): number =>
  toDate(value)?.getTime() ?? 0;

export const isPostPublic = (
  post: BlogPost,
  now: number = Date.now()
): boolean => {
  const hasPublicStatus = post.status === "approved" || !post.status;
  const scheduledTime = toTimestamp(post.scheduledFor);

  return hasPublicStatus && (!scheduledTime || scheduledTime <= now);
};

export const toDateTimeLocalValue = (
  value: DateValue | undefined
): string => {
  const date = toDate(value);
  if (!date) return "";

  const pad = (part: number): string => String(part).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
};

export const formatDate = (
  value: DateValue | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string => {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("en-US", options).format(date) : "";
};

/** "Just now", "5m ago", "3h ago", "2d ago", then a short date. */
export const formatRelativeTime = (
  value: DateValue | undefined,
  now: number = Date.now()
): string => {
  const date = toDate(value);
  if (!date) return "Just now";

  const diff = Math.max(0, now - date.getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date(now).getFullYear() ? "numeric" : undefined,
  });
};
