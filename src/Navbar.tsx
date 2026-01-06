import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { showSuccess } from "./utils/sweetalert";
import Github from "./assets/github";
import LinkedIn from "./assets/linkedin";
import Twitter from "./assets/twitter";

export function Navbar(): React.ReactElement {
  const logStatus = useAuthStore((state) => state.logStatus);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await signOut();
      showSuccess("Logged Out", "You have been successfully logged out.");
      navigate("/");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null): string => {
    if (!name || name.trim().length === 0) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-base-300 px-4 sm:px-6 md:px-8 lg:px-10 mb-8 sm:mb-12 lg:mb-16">
      {/* Left side (logo + mobile menu) */}
      <div className="navbar-start flex items-center gap-2 sm:gap-4">
        {/* Mobile menu toggle button */}
        <button
          onClick={toggleMenu}
          className="menu-toggle btn btn-ghost btn-circle lg:hidden p-2"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link 
          to="/" 
          className="btn btn-ghost text-lg sm:text-xl flex items-center gap-2 hover:bg-transparent"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="text-[var(--color-primary)] text-xl sm:text-2xl font-bold">{"</>"}</span>
          <span className="ibm-plex-mono capitalize font-semibold">john dera</span>
        </Link>
      </div>

      {/* Center links - Desktop */}
      <ul className="hidden lg:flex gap-4 lg:gap-6 navbar-center">
        <li>
          <NavLink 
            to="/" 
            className="custom-btn text-sm lg:text-base px-3 lg:px-4 py-2 hover:text-primary transition-colors"
            end
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/blogpage" 
            className="custom-btn text-sm lg:text-base px-3 lg:px-4 py-2 hover:text-primary transition-colors"
          >
            Blog
          </NavLink>
        </li>
        {!logStatus && (
          <li>
            <NavLink 
              to="/login" 
              className="custom-btn text-sm lg:text-base px-3 lg:px-4 py-2 hover:text-primary transition-colors"
            >
              Login
            </NavLink>
          </li>
        )}
        {logStatus && (
          <li>
            <NavLink 
              to="/admin" 
              className="custom-btn text-sm lg:text-base px-3 lg:px-4 py-2 hover:text-primary transition-colors"
            >
              Dashboard
            </NavLink>
          </li>
        )}
      </ul>

      {/* Right side (search + social + profile) */}
      <div className="navbar-end gap-4 sm:gap-6 lg:gap-8 pl-4 sm:pl-8">
        {/* Search - Hidden on mobile, visible on tablet+ */}
        <label className="input bg-base-200/50 hover:bg-base-200 rounded-full w-32 sm:w-40 md:w-48 lg:w-56 hidden sm:flex items-center gap-2 border border-base-300 focus-within:border-primary transition-colors">
          <input 
            type="search" 
            placeholder="Search" 
            className="bg-transparent border-none focus:outline-none text-sm"
          />
          <svg
            className="h-4 w-4 opacity-70"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </label>

        {/* Social links - Desktop */}
        <div className="hidden lg:flex gap-2 xl:gap-3 items-center">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-full bg-base-200/50 hover:bg-base-200 border border-base-300/50 hover:border-primary/30 transition-all duration-300"
            aria-label="GitHub"
          >
            <div className="w-5 h-5 xl:w-6 xl:h-6 flex items-center justify-center text-base-content/70 group-hover:text-primary transition-colors">
              <Github />
            </div>
            <span className="text-xs xl:text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors hidden xl:inline">
              GitHub
            </span>
          </motion.a>
          <motion.a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-full bg-base-200/50 hover:bg-base-200 border border-base-300/50 hover:border-primary/30 transition-all duration-300"
            aria-label="LinkedIn"
          >
            <div className="w-5 h-5 xl:w-6 xl:h-6 flex items-center justify-center text-base-content/70 group-hover:text-primary transition-colors">
              <LinkedIn />
            </div>
            <span className="text-xs xl:text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors hidden xl:inline">
              LinkedIn
            </span>
          </motion.a>
          <motion.a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-full bg-base-200/50 hover:bg-base-200 border border-base-300/50 hover:border-primary/30 transition-all duration-300"
            aria-label="Twitter"
          >
            <div className="w-5 h-5 xl:w-6 xl:h-6 flex items-center justify-center text-base-content/70 group-hover:text-primary transition-colors">
              <Twitter />
            </div>
            <span className="text-xs xl:text-sm font-medium text-base-content/70 group-hover:text-primary transition-colors hidden xl:inline">
              Twitter
            </span>
          </motion.a>
        </div>

        {/* User Profile Dropdown - Only show when authenticated, at the end */}
        {logStatus && user && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const initials = getUserInitials(user.name);
                        if (!parent.querySelector(".avatar-initials")) {
                          const initialsDiv = document.createElement("div");
                          initialsDiv.className =
                            "avatar-initials w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-sm";
                          initialsDiv.textContent = initials;
                          parent.appendChild(initialsDiv);
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-sm">
                    {getUserInitials(user.name)}
                  </div>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-300 mt-2"
            >
              <li className="px-4 py-3 border-b border-base-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const initials = getUserInitials(user.name);
                            if (!parent.querySelector(".avatar-initials")) {
                              const initialsDiv = document.createElement("div");
                              initialsDiv.className =
                                "avatar-initials w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-base";
                              initialsDiv.textContent = initials;
                              parent.appendChild(initialsDiv);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold text-base">
                        {getUserInitials(user.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-base-content truncate">
                      {user.name || "User"}
                    </span>
                    <span className="text-xs text-base-content/70 truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    navigate("/admin");
                    // Dispatch event to set dashboard screen to profile
                    setTimeout(() => {
                      const event = new CustomEvent("set-dashboard-screen", {
                        detail: { screen: "profile" },
                      });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 text-error hover:bg-error/10"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="mobile-menu fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-base-100 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 text-xl font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-primary">{"</>"}</span>
                    <span className="ibm-plex-mono capitalize">john dera</span>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="btn btn-ghost btn-circle btn-sm"
                    aria-label="Close menu"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <ul className="flex flex-col gap-2 p-4 flex-1">
                  <li>
                    <NavLink
                      to="/"
                      className="block px-4 py-3 rounded-lg hover:bg-base-200 transition-colors text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                      end
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/blogpage"
                      className="block px-4 py-3 rounded-lg hover:bg-base-200 transition-colors text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Blog
                    </NavLink>
                  </li>
                  {!logStatus && (
                    <>
                      <li>
                        <NavLink
                          to="/login"
                          className="block px-4 py-3 rounded-lg hover:bg-base-200 transition-colors text-base font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/signup"
                          className="block px-4 py-3 rounded-lg hover:bg-base-200 transition-colors text-base font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign Up
                        </NavLink>
                      </li>
                    </>
                  )}
                  {logStatus && (
                    <>
                      <li>
                        <NavLink
                          to="/admin"
                          className="block px-4 py-3 rounded-lg hover:bg-base-200 transition-colors text-base font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <button
                          onClick={async () => {
                            await handleLogout();
                            setIsMenuOpen(false);
                          }}
                          disabled={isLoggingOut}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-error/20 hover:text-error transition-colors text-base font-medium flex items-center gap-2"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5" />
                          {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                      </li>
                    </>
                  )}
                </ul>

                {/* Mobile Search */}
                <div className="p-4 border-t border-base-300">
                  <label className="input bg-base-200 rounded-full w-full flex items-center gap-2 border border-base-300">
                    <input 
                      type="search" 
                      placeholder="Search" 
                      className="bg-transparent border-none focus:outline-none text-sm flex-1"
                    />
                    <svg
                      className="h-4 w-4 opacity-70"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </label>
                </div>

                {/* Social Links in Mobile Menu */}
                <div className="p-4 border-t border-base-300">
                  <div className="flex flex-col gap-3 items-center">
                    <div className="flex gap-3 sm:gap-4 justify-center items-center">
                      <motion.a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-base-200/50 hover:bg-base-200 text-base-content/70 hover:text-primary border border-base-300/50 hover:border-primary/30 transition-all duration-300"
                        aria-label="GitHub"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Github />
                      </motion.a>
                      <motion.a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-base-200/50 hover:bg-base-200 text-base-content/70 hover:text-primary border border-base-300/50 hover:border-primary/30 transition-all duration-300"
                        aria-label="LinkedIn"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LinkedIn />
                      </motion.a>
                      <motion.a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-base-200/50 hover:bg-base-200 text-base-content/70 hover:text-primary border border-base-300/50 hover:border-primary/30 transition-all duration-300"
                        aria-label="Twitter"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Twitter />
                      </motion.a>
                    </div>
                    <div className="flex gap-2 text-xs text-base-content/60">
                      <span>GitHub</span>
                      <span>•</span>
                      <span>LinkedIn</span>
                      <span>•</span>
                      <span>Twitter</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}








