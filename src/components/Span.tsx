import type { ReactNode } from "react";

export function Span({ children }: { children: ReactNode }): JSX.Element {
  return <span className="text-primary">{children}</span>;
} 
