import type { PostStatus } from "../../types";

const STYLES: Record<PostStatus, string> = {
  draft: "badge-ghost",
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

const LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  approved: "Published",
  rejected: "Rejected",
};

export default function StatusBadge({
  status,
}: {
  status?: PostStatus;
}): React.ReactElement {
  const value = status ?? "draft";
  return (
    <span className={`badge badge-sm whitespace-nowrap ${STYLES[value]}`}>
      {LABELS[value]}
    </span>
  );
}
