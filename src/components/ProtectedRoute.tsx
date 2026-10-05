import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import { useAuthStore } from "../stores/authStore";
import PremiumSpinner from "./PremiumSpinner";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Controls access to routes based on authentication, email verification, and role.
 * While Firebase restores the session (hard refresh, direct navigation) it
 * shows a spinner instead of redirecting a signed-in user to the login page.
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
  requireEmailVerified = true,
  fallbackPath = "/login",
}: ProtectedRouteProps): React.ReactElement {
  const location = useLocation();
  const displayStatus = useAuthStore((state) => state.displayStatus);
  const { isAuthenticated, isEmailVerified, role } = useRole();

  if (displayStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PremiumSpinner size="lg" variant="primary" text="Checking your session..." />
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  // Check email verification
  if (requireAuth && requireEmailVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
