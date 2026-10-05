import type { ComponentType, ReactNode } from "react";

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="rounded-2xl bg-base-200 p-4 text-base-content/50">
          <Icon className="h-8 w-8" />
        </span>
      )}
      <h2 className="text-lg font-semibold text-base-content">{title}</h2>
      {description && (
        <p className="max-w-md text-sm text-base-content/65">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
