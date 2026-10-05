import { AcademicCapIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import SectionHead from "./sectionHead";
import { TIMELINE } from "../data/experience";
import { site } from "../data/site";

function Experience(): React.ReactElement {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-20 sm:py-24">
      <div className="page-container max-w-4xl">
        <SectionHead id="experience-heading" eyebrow="Experience" title="Where I've been" />
        <ol className="relative flex flex-col gap-8 border-l border-base-300 pl-8">
          {TIMELINE.map((entry) => {
            const Icon = entry.kind === "work" ? BriefcaseIcon : AcademicCapIcon;
            return (
              <li key={entry.title} className="relative">
                <span className="absolute -left-[3.05rem] top-1 flex h-9 w-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="surface p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <span className="font-mono text-xs text-base-content/60">{entry.period}</span>
                  </div>
                  <p className="text-sm text-primary">{entry.organisation}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-base-content/75 marker:text-primary">
                    {entry.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-center">
          <a href={site.resumeUrl} download className="link link-primary">
            Download the full CV (PDF)
          </a>
        </p>
      </div>
    </section>
  );
}

export default Experience;
