import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import dera from "../assets/dera.webp";
import Github from "../assets/github";
import LinkedIn from "../assets/linkedin";
import resumeStats from "../data/resumeStats";
import { site } from "../data/site";

const STACK = ["TypeScript", "React", "Next.js", "Tailwind CSS", "Firebase", "Git"];

/** Counts up from 0 to `target` once (skipped when reduced motion is preferred). */
function useCountUp(target: number, skip: boolean): number {
  const [value, setValue] = useState(skip ? target : 0);
  useEffect(() => {
    if (skip) return setValue(target);
    let frame = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, skip]);
  return value;
}

function Stat({ value, suffix, label, skip }: { value: number; suffix?: string; label: string; skip: boolean }) {
  const current = useCountUp(value, skip);
  return (
    <div className="flex flex-col">
      <dt className="order-2 text-sm text-base-content/65">{label.replace("\n", " ")}</dt>
      <dd className="order-1 text-3xl font-bold text-primary sm:text-4xl">
        {current}
        {suffix}
      </dd>
    </div>
  );
}

export default function Hero(): React.ReactElement {
  const reduceMotion = Boolean(useReducedMotion());
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay },
        };

  return (
    <section id="hero" aria-labelledby="hero-heading" className="page-container pb-16 pt-6 sm:pb-24 sm:pt-10">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <motion.p {...fadeUp()} className="font-mono text-sm text-secondary">
            {"<h1>"}
          </motion.p>
          <motion.h1
            id="hero-heading"
            {...fadeUp(0.05)}
            className="mt-2 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Hey, I&apos;m <span className="text-primary">Chidera</span>.
            <br />
            I build fast, accessible interfaces for the web.
          </motion.h1>
          <motion.p {...fadeUp(0.05)} className="mt-2 font-mono text-sm text-secondary">
            {"</h1>"}
          </motion.p>
          <motion.p
            {...fadeUp(0.1)}
            className="mx-auto mt-6 max-w-xl text-lg text-base-content/75 lg:mx-0"
          >
            Front-end developer working with React and TypeScript — turning designs into
            responsive, maintainable products, and writing about what I learn along the way.
          </motion.p>

          <motion.div
            {...fadeUp(0.15)}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <a href="#work" className="btn btn-primary btn-lg">
              View my work
            </a>
            <a href="#contact" className="btn btn-ghost btn-lg border border-base-300">
              Let&apos;s talk
            </a>
          </motion.div>

          <motion.dl
            {...fadeUp(0.2)}
            className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-6 text-center lg:mx-0 lg:text-left"
          >
            {[resumeStats.stat1, resumeStats.stat2, resumeStats.stat3].map((stat) => (
              <Stat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} skip={reduceMotion} />
            ))}
          </motion.dl>
        </div>

        <motion.aside
          {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 0.1 } })}
          aria-label="Profile"
          className="surface relative mx-auto w-full max-w-sm overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary/30 via-secondary/15 to-transparent" aria-hidden="true" />
          <div className="relative flex flex-col items-center text-center">
            <img
              src={dera}
              alt="Portrait of Chidera Okonkwo"
              width={128}
              height={128}
              className="h-28 w-28 rounded-full border-4 border-base-100 object-cover shadow-lg ring-2 ring-primary sm:h-32 sm:w-32"
            />
            <h2 className="mt-4 text-2xl font-bold">{site.fullName}</h2>
            <p className="font-mono text-sm text-base-content/70">{site.role}</p>
          </div>

          <ul className="relative mt-6 flex flex-col gap-3 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:text-primary">
                <EnvelopeIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate">{site.email}</span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPinIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              {site.location}
            </li>
            <li className="flex items-center gap-3">
              <BriefcaseIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              {site.availability}
            </li>
          </ul>

          <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Main skills">
            {STACK.map((item) => (
              <li key={item} className="badge badge-primary badge-soft">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-2">
            <a
              href={site.resumeUrl}
              download
              className="btn btn-neutral flex-1 gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download CV
            </a>
            <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-square btn-ghost border border-base-300" aria-label="GitHub profile">
              <Github />
            </a>
            <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-square btn-ghost border border-base-300" aria-label="LinkedIn profile">
              <LinkedIn />
            </a>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
