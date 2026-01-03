import { useAuthStore } from "../stores/authStore";

/**
 * Hook to check user authentication and role
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logStatus = useAuthStore((state) => state.logStatus);
  const emailVerified = useAuthStore((state) => state.emailVerified);

  const isAuthenticated = logStatus && user !== null;
  const isEmailVerified = emailVerified;

  // Check if user can view dashboard (admin always has access, others need email verification)
  const canViewDashboard =
    isAuthenticated &&
    (isAdmin || (isEmailVerified && (role === "writer" || role === "user")));

  // Check if user is admin
  const isAdmin = isAuthenticated && isEmailVerified && role === "admin";

  // Check if user is writer (includes admin)
  const isWriter =
    isAuthenticated && isEmailVerified && (role === "writer" || role === "admin");

  return {
    user,
    role,
    isAuthenticated,
    isEmailVerified,
    canViewDashboard,
    isAdmin,
    isWriter,
  };
}

