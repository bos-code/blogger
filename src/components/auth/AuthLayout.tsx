import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Centered card used by every sign-in related page. */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="surface p-6 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-base-content/70">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-base-content/70">{footer}</div>}
        <p className="mt-4 text-center">
          <Link to="/" className="link link-hover text-sm text-base-content/60">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
