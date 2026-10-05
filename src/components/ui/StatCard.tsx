import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "info" | "secondary" | "error";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  secondary: "bg-secondary/10 text-secondary",
  error: "bg-error/10 text-error",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: StatCardProps): React.ReactElement {
  return (
    <div className="surface flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-base-content/65">{label}</p>
        <p className="mt-1 text-2xl font-bold text-base-content sm:text-3xl">
          {value}
        </p>
      </div>
      <span className={`rounded-xl p-3 ${TONES[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}
