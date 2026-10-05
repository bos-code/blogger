import type { ReactNode } from "react";

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  descript?: ReactNode;
  id?: string;
  align?: "center" | "left";
}

/** Shared heading for home page sections. */
function SectionHead({
  eyebrow,
  title,
  descript,
  id,
  align = "center",
}: SectionHeadProps): React.ReactElement {
  return (
    <div className={`mb-10 flex flex-col gap-3 sm:mb-14 ${align === "center" ? "items-center text-center" : ""}`}>
      {eyebrow && <p className="font-mono text-sm text-primary">{eyebrow}</p>}
      <h2 id={id} className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {descript && <p className="max-w-2xl text-base-content/70 sm:text-lg">{descript}</p>}
    </div>
  );
}

export default SectionHead;
