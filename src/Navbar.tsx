import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Squares2X2Icon,
  SunIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "./stores/authStore";
import { useUIStore } from "./stores/uiStore";
import { resolveMode, useThemeStore } from "./stores/themeStore";
import { showSuccess } from "./utils/sweetalert";
import Avatar from "./components/ui/Avatar";
import NotificationBell from "./components/NotificationBell";
import Github from "./assets/github";
import LinkedIn from "./assets/linkedin";
import { site } from "./data/site";
import type { UIState } from "./types";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/#about", label: "About" },
  { to: "/#work", label: "Work" },
  { to: "/blog", label: "Blog" },
  { to: "/#contact", label: "Contact" },
];

function SearchForm({
  onSubmitted,
  autoFocus = false,
  className = "",
}: {
  onSubmitted?: () => void;
  autoFocus?: boolean;
  className?: string;
}): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = new URLSearchParams(location.search).get("q") ?? "";
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.search]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : "/blog");
    onSubmitted?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={className}>
      <label className="input input-sm h-9 w-full rounded-full border-base-300 bg-base-200/60 focus-within:border-primary">
        <MagnifyingGlassIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts"
          aria-label="Search posts"
          autoFocus={autoFocus}
          className="grow"
        />
      </label>
    </form>
  );
}

function ThemeToggle(): React.ReactElement {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const isDark = resolveMode(mode) === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}

export function Navbar(): React.ReactElement {
  const logStatus = useAuthStore((state) => state.logStatus);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Scroll to in-page sections for /#section links.
  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth" }));
    }
  }, [location.pathname, location.hash]);

  // Mobile sheet: lock scroll and close on Escape.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // User menu: close on outside click / Escape.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isUserMenuOpen]);

  const openDashboard = (screen: UIState["dashboardScreen"]) => {
    setDashboardScreen(screen);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/admin");
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await signOut();
      showSuccess("Logged out", "See you next time.");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  const isLinkActive = (to: string, end?: boolean) => {
    if (to.includes("#")) return false;
    if (to === "/blog") {
      return location.pathname.startsWith("/blog");
    }
    return end ? location.pathname === to : location.pathname.startsWith(to);
  };

  const linkClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-primary/15 text-primary"
        : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 mb-6 border-b transition-colors sm:mb-10 ${
        scrolled
          ? "border-base-300 bg-base-100/85 shadow-sm backdrop-blur-lg"
          : "border-transparent bg-base-100"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="btn btn-ghost btn-circle btn-sm lg:hidden"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="font-mono text-xl font-bold text-primary">{"</>"}</span>
          <span className="font-mono capitalize">john dera</span>
        </Link>

        <ul className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass(isLinkActive(link.to, link.end))}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchForm className="hidden w-44 md:block lg:w-56" />
          <ThemeToggle />
          {logStatus && user && <NotificationBell />}

          {logStatus && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex items-center rounded-full ring-2 ring-primary/60 ring-offset-2 ring-offset-base-100"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <Avatar name={user.name} src={user.photoURL} size="sm" />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="surface absolute right-0 mt-3 w-64 overflow-hidden p-2 shadow-xl"
                  >
                    <div className="flex items-center gap-3 border-b border-base-300 px-2 pb-3 pt-1">
                      <Avatar name={user.name} src={user.photoURL} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{user.name || "Your account"}</p>
                        <p className="truncate text-xs text-base-content/60">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col py-1">
                      {[
                        { label: "Dashboard", icon: Squares2X2Icon, screen: "home" as const },
                        { label: "Saved posts", icon: BookmarkIcon, screen: "saved" as const },
                        { label: "Profile & settings", icon: UserCircleIcon, screen: "profile" as const },
                      ].map(({ label, icon: Icon, screen }) => (
                        <button
                          key={label}
                          type="button"
                          role="menuitem"
                          onClick={() => openDashboard(screen)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-base-200"
                        >
                          <Icon className="h-5 w-5 text-base-content/70" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-base-300 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-error hover:bg-error/10"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        {isLoggingOut ? "Logging out..." : "Log out"}
                      </button>
                    </div>
                    {role && (
                      <p className="px-2 pb-1 pt-2 text-[11px] uppercase tracking-wide text-base-content/50">
                        Signed in as {role.replace("_", " ")}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 h-full w-full bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-y-auto bg-base-100 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-base-300 p-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <span className="font-mono text-primary">{"</>"}</span>
                  <span className="font-mono capitalize">john dera</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                <SearchForm onSubmitted={() => setIsMenuOpen(false)} />
              </div>

              <ul className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={`block rounded-xl px-4 py-3 text-base font-medium ${
                        isLinkActive(link.to, link.end)
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-base-200"
                      }`}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-base-300 px-4 pt-4">
                {logStatus && user ? (
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => openDashboard("home")}
                      className="rounded-xl px-4 py-3 text-left font-medium hover:bg-base-200"
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => openDashboard("saved")}
                      className="rounded-xl px-4 py-3 text-left font-medium hover:bg-base-200"
                    >
                      Saved posts
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-left font-medium text-error hover:bg-error/10"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" className="btn btn-ghost border border-base-300">
                      Log in
                    </Link>
                    <Link to="/signup" className="btn btn-primary">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-auto flex justify-center gap-3 border-t border-base-300 p-4">
                <a
                  href={site.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-circle"
                  aria-label="GitHub"
                >
                  <Github />
                </a>
                <a
                  href={site.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-circle"
                  aria-label="LinkedIn"
                >
                  <LinkedIn />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
