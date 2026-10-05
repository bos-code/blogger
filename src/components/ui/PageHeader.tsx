import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Consistent heading block for dashboard screens. */
export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps): React.ReactElement {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-base-content/70 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
