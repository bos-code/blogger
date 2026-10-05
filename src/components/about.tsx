import aboutImage from "../assets/about-comp.webp";
import SectionHead from "./sectionHead";

const HIGHLIGHTS = [
  { title: "Interfaces first", text: "Responsive, accessible layouts that hold up from 320px phones to wide desktops." },
  { title: "Clean, typed code", text: "React and TypeScript with small, readable components that are easy to change." },
  { title: "Always learning", text: "I write about what I learn — and like having my assumptions challenged." },
];

function AboutMe(): React.ReactElement {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-base-200/60 py-20 sm:py-24">
      <div className="page-container">
        <SectionHead id="about-heading" eyebrow="About" title="A little about me" />
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img
            src={aboutImage}
            alt="A developer's desk with a laptop showing code"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg"
          />
          <div>
            <div className="flex flex-col gap-4 text-lg leading-relaxed text-base-content/80">
              <p>
                Hello! I&apos;m <span className="font-semibold text-base-content">John Dera</span>, a
                front-end developer who builds for the web with{" "}
                <span className="text-primary">HTML</span>, <span className="text-primary">CSS</span>,{" "}
                <span className="text-primary">JavaScript</span> and{" "}
                <span className="text-primary">React</span>.
              </p>
              <p>
                I&apos;m a motivated, optimistic developer focused on writing clear, robust code that
                works — and on never stopping learning.
              </p>
              <p>
                When I&apos;m not coding, I&apos;m <span className="text-primary">writing blog posts</span>,
                reading, or picking up a hands-on project like <span className="text-primary">photography</span>.
              </p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {HIGHLIGHTS.map((item) => (
                <li key={item.title} className="surface p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-base-content/70">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;
