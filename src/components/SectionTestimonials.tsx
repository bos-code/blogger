import { useMemo, useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import SectionHead from "./sectionHead";
import TestimonialCard from "./testimonials/TestimonialCard";
import WriteTestimonial from "./testimonials/WriteTestimonial";
import { useApprovedTestimonials, useMyTestimonials } from "../hooks/useTestimonials";
import { useProjects } from "../hooks/useProjects";

const INITIAL_COUNT = 6;

/** Client testimonials (approved ones, plus the visitor's own pending ones). */
function SectionTestimonials(): React.ReactElement {
  const { data: approved = [], isPending } = useApprovedTestimonials();
  const { data: mine = [] } = useMyTestimonials();
  const { data: projectData } = useProjects();
  const [showAll, setShowAll] = useState(false);

  const testimonials = useMemo(() => {
    const ownUnpublished = mine.filter((item) => item.status !== "approved");
    return [...ownUnpublished, ...approved];
  }, [approved, mine]);
  const projectsBySlug = useMemo(
    () => new Map((projectData?.projects ?? []).map((project) => [project.slug, project])),
    [projectData]
  );
  const visible = showAll ? testimonials : testimonials.slice(0, INITIAL_COUNT);

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="testimonials-heading"
          eyebrow="Testimonials"
          title="What clients say"
          descript="Words from people I've built with. Worked with me? Add yours and tag the project."
        />

        {isPending ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading testimonials">
            {[0, 1, 2].map((index) => (
              <div key={index} className="surface space-y-3 p-6">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton mt-6 h-10 w-40" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="surface mx-auto flex max-w-xl flex-col items-center gap-3 p-10 text-center">
            <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-primary" />
            <p className="text-lg font-semibold">Be the first to leave a testimonial</p>
            <p className="text-base-content/65">If we've worked together, I'd love to hear how it went.</p>
          </div>
        ) : (
          <ul className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard
                  testimonial={testimonial}
                  project={testimonial.projectSlug ? projectsBySlug.get(testimonial.projectSlug) : null}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {testimonials.length > INITIAL_COUNT && (
            <button type="button" className="btn btn-ghost border border-base-300" onClick={() => setShowAll((value) => !value)}>
              {showAll ? "Show fewer" : `Show all ${testimonials.length} testimonials`}
            </button>
          )}
          <WriteTestimonial />
        </div>
      </div>
    </section>
  );
}

export default SectionTestimonials;
