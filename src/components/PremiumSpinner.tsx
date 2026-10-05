interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  /** Kept for API compatibility; the spinner always uses the primary colour. */
  variant?: "primary" | "secondary" | "accent" | "neutral";
  text?: string;
  /** Kept for API compatibility. */
  fullScreen?: boolean;
  /** Kept for API compatibility. */
  showParticles?: boolean;
}

const SIZES = { sm: "loading-sm", md: "loading-md", lg: "loading-lg" } as const;

/** Accessible loading indicator with an optional label. */
export default function PremiumSpinner({ size = "md", text }: SpinnerProps): React.ReactElement {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 text-base-content/70">
      <span className={`loading loading-spinner text-primary ${SIZES[size]}`} aria-hidden="true" />
      {text ? <span className="text-sm">{text}</span> : <span className="sr-only">Loading</span>}
    </div>
  );
}
