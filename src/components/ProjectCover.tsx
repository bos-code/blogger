import type { Project } from "../types";

const GRADIENTS = [
  "from-primary/35 via-base-200 to-secondary/25",
  "from-secondary/35 via-base-200 to-accent/25",
  "from-accent/30 via-base-200 to-primary/25",
];

/** Generated cover for projects without a screenshot: monogram and stack on a themed gradient. */
function ProjectCover({ project }: { project: Project }): React.ReactElement {
  const seed = [...project.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const monogram = project.title
    .split(/[\s&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full flex-col justify-end overflow-hidden bg-gradient-to-br p-5 ${GRADIENTS[seed % GRADIENTS.length]}`}
    >
      <span className="absolute -right-2 -top-4 font-mono text-7xl font-bold text-base-content/5 sm:text-8xl">{"</>"}</span>
      <span className="text-5xl font-bold tracking-tight text-base-content/85">{monogram}</span>
      {project.tech && project.tech.length > 0 && (
        <span className="mt-1 font-mono text-xs text-base-content/60">{project.tech.slice(0, 3).join(" · ")}</span>
      )}
    </div>
  );
}

export default ProjectCover;
