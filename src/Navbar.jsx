import { Link } from "react-router-dom";

export function Navbar({ logStatus }) {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 border-b border-base-300 px-4 md:px-6 lg:px-8 xl:px-10 mb-16">
      {/* Left side (logo + mobile menu) */}
      <div className="navbar-start">
        {/* Mobile dropdown */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-lg dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            <li><Link to="/">Homepage</Link></li>
            {!logStatus && (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
              </>
            )}
            <li><Link to="/blogpage">Blog</Link></li>
            {logStatus && (
              <li><Link to="/admin">Dashboard</Link></li>
            )}
          </ul>
        </div>

        {/* Logo */}
        <Link to="/" className="btn btn-ghost text-xl flex items-center gap-2">
          <span className="text-[var(--color-primary)]">{"</>"}</span>
          <span className="ibm-plex-mono capitalize">john dera</span>
        </Link>
      </div>

      {/* Center links */}
      <div className="hidden md:flex gap-4 navbar-center">
        <Link to="/" className=" custom-btn">Home</Link>
        <Link to="/blogpage" className="custom-btn">Blog</Link>
        {!logStatus && (
          <Link to="/login" className="custom-btn">Login</Link>
        )}
        {logStatus && (
          <Link to="/admin" className="custom-btn">Dashboard</Link>
        )}
      </div>

      {/* Right side (search + social) */}
      <div className="navbar-end gap-12 pl-8">
        <label className="input bg-white rounded-full size-full">
          <input type="search" required placeholder="Search" />
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke={"var(--color-base-100)"}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
        </label>

        {/* Social links */}
      <div className="flex gap-2 items-center">
          {/* Desktop version: icon + name */}
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost gap-2 hidden md:flex"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={"var(--color-primary)"}
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.257C6.73 20.408 5.897 18.19 5.897 18.19c-.546-1.387-1.333-1.757-1.333-1.757-1.09-.746.083-.73.083-.73 1.204.085 1.837 1.236 1.837 1.236 1.07 1.834 2.809 1.304 3.495.996.107-.776.42-1.304.762-1.604-4.663-.531-9.555-2.331-9.555-10.368 0-2.291.82-4.164 2.164-5.636-.217-.532-.94-2.675.206-5.577 0 0 1.77-.567 5.8 2.162 1.684-.468 3.492-.702 5.29-.71 1.797.008 3.605.242 5.29.71 4.03-2.729 5.798-2.162 5.798-2.162 1.147 2.902.424 5.045.208 5.577 1.346 1.472 2.164 3.345 2.164 5.636 0 8.058-4.897 9.833-9.567 10.356.43.37.823 1.102.823 2.222v3.293c0 .322.217.694.825.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href="https://twitter.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost gap-2 hidden md:flex"
          >
            <svg
              className="h-5 w-5"
              fill={"var(--color-primary)"}
              viewBox="0 0 24 24"
            >
              <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.72 0-4.924 2.204-4.924 4.924 0 .39.045.765.127 1.124-4.09-.205-7.72-2.165-10.148-5.144-.424.729-.666 1.577-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.247-2.229-.616v.062c0 2.385 1.693 4.374 3.946 4.828-.413.111-.849.171-1.296.171-.317 0-.626-.03-.928-.086.627 1.956 2.444 3.379 4.6 3.42-1.68 1.316-3.808 2.102-6.102 2.102-.395 0-.779-.023-1.158-.067 2.179 1.397 4.768 2.213 7.557 2.213 9.054 0 14.001-7.496 14.001-13.986 0-.21 0-.423-.016-.633.962-.695 1.8-1.562 2.46-2.549z" />
            </svg>
            <span>Twitter</span>
          </a>

          <a
            href="https://linkedin.com/in/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost gap-2 hidden md:flex"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={"var(--color-primary)"}
            >
              <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.5S3.88 7.5 4.98 7.5 7 6.62 7 5.5 6.1 3.5 4.98 3.5zM3.5 8.75h2.98V21H3.5V8.75zM10.75 8.75h2.85v1.67h.04c.4-.76 1.37-1.56 2.83-1.56 3.03 0 3.59 1.99 3.59 4.57V21H17v-6.5c0-1.55-.03-3.55-2.17-3.55-2.18 0-2.51 1.7-2.51 3.44V21H10.75V8.75z" />
            </svg>
            <span>LinkedIn</span>
          </a>

          {/* Mobile version: icons only */}
          <a
            href="https://github.com/bos-code"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={"var(--color-primary)"}
            >
              ...
            </svg>
          </a>
          <a
            href="https://x.com/Dera46082"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill={"var(--color-primary)"}
              viewBox="0 0 24 24"
            >
              ...
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/chidera-okonkwo-38694433a/1"
            className="btn btn-ghost btn-circle md:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={"var(--color-primary)"}
            >
              ...
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
