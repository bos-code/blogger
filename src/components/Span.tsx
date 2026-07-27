import type { ReactNode } from "react";

export function Span({ children }: { children: ReactNode }): React.ReactElement {
  return <span className="text-primary">{children}</span>;
} 
