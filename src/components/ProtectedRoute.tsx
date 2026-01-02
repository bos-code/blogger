import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Controls access to routes based on authentication and role
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
  fallbackPath = "/login",
}: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, role, canViewDashboard } = useRole();

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  // Special check for dashboard access
  if (fallbackPath === "/admin" && !canViewDashboard) {
    return <Navigate to="/" replace />;
  }

  return children;
}



