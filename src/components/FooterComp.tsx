import { Link } from "react-router-dom";
import { RssIcon } from "@heroicons/react/24/outline";
import Github from "../assets/github";
import LinkedIn from "../assets/linkedin";
import { site } from "../data/site";

const LINKS = [
  { to: "/#about", label: "About" },
  { to: "/#work", label: "Work" },
  { to: "/blog", label: "Blog" },
  { to: "/#contact", label: "Contact" },
];

function FooterComp(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-base-300 bg-base-200/60">
      <div className="page-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="font-mono text-xl font-bold text-primary">{"</>"}</span>
            <span className="font-mono capitalize">john dera</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-base-content/70">
            Front-end developer building fast, accessible interfaces — and writing about it.
          </p>
          <div className="mt-4 flex gap-2">
            <a href={site.socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-square border border-base-300" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
            <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-square border border-base-300" aria-label="LinkedIn">
              <LinkedIn className="h-4 w-4" />
            </a>
            <a href="/rss.xml" className="btn btn-ghost btn-sm btn-square border border-base-300" aria-label="RSS feed">
              <RssIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/55">Site</h2>
          <ul className="mt-2 flex flex-col text-sm">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="inline-block py-1.5 hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/55">More</h2>
          <ul className="mt-2 flex flex-col text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="inline-block py-1.5 hover:text-primary">
                Email me
              </a>
            </li>
            <li>
              <a href={site.resumeUrl} download className="inline-block py-1.5 hover:text-primary">
                Download CV
              </a>
            </li>
            <li>
              <Link to="/privacy" className="inline-block py-1.5 hover:text-primary">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="inline-block py-1.5 hover:text-primary">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-base-300">
        <p className="page-container py-4 text-center text-xs text-base-content/60">
          © {year} {site.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default FooterComp;
