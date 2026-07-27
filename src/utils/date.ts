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
