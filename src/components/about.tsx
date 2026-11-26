import aboutImage from "../assets/about-comp.webp";
import SectionHead from "./sectionHead";

const HIGHLIGHTS = [
  { title: "End-to-end engineering", text: "From responsive interfaces and mobile apps to APIs, databases and desktop software." },
  { title: "Reliability and security", text: "Maintainable code, automated testing, secure integrations and careful attention to real-world behaviour." },
  { title: "Continuous learning", text: "I explore new technologies, build personal projects and share what I learn through writing." },
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
                I&apos;m <span className="font-semibold text-base-content">Chidera Okonkwo (John Dera)</span>, a
                software engineer building web, desktop and mobile applications with{" "}
                <span className="text-primary">Go</span>, <span className="text-primary">TypeScript</span>,{" "}
                <span className="text-primary">React</span> and <span className="text-primary">React Native</span>.
              </p>
              <p>
                My experience spans full-stack products, cybersecurity software, system integration and
                automated testing. I am also studying Computer Science at Lagos State University.
              </p>
              <p>
                Outside work, I enjoy building personal software projects, reading, photography and{" "}
                <span className="text-primary">writing about technology</span>.
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
