import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";
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
 * Controls access to routes based on authentication, email verification, and role
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
  requireEmailVerified = true,
  fallbackPath = "/login",
}: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isEmailVerified, role, canViewDashboard, isAdmin } =
    useRole();

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
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

  // Special check for dashboard access - Admin always has full access
  if (fallbackPath === "/admin") {
    // Admin has full access regardless of email verification
    if (isAdmin) {
      return children;
    }
    // Non-admin users need email verification
    if (!canViewDashboard) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
