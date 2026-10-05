import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NotFound(): React.ReactElement {
  useDocumentMeta({ title: "Page not found", noIndex: true });

  return (
    <section className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-3xl font-bold sm:text-4xl">This page doesn't exist</h1>
      <p className="max-w-md text-base-content/70">
        The link may be broken or the page may have moved.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
        <Link to="/blog" className="btn btn-ghost border border-base-300">
          Read the blog
        </Link>
      </div>
    </section>
  );
}
