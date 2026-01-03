import { useAuthStore } from "../stores/authStore";
import {
  canPerformAdminAction,
  canCreatePost,
  canManagePosts,
  canManageUsers,
  canManageCategories,
  hasRolePermission,
} from "../utils/roleHelpers";
import type { UserRole } from "../types";

/**
 * Hook to check user authentication and role
 * Provides comprehensive role-based permission checks
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logStatus = useAuthStore((state) => state.logStatus);
  const emailVerified = useAuthStore((state) => state.emailVerified);

  const isAuthenticated = logStatus && user !== null;
  const isEmailVerified = emailVerified;

  // Role checks - Admin has full access regardless of email verification
  // Other roles need email verification
  const isAdmin = isAuthenticated && role === "admin";
  const isWriter = isAuthenticated && hasRolePermission(role, "writer");
  const isUser = isAuthenticated && hasRolePermission(role, "user");
  const isReader = isAuthenticated && role === "reader";

  // Permission checks
  const canAdmin = canPerformAdminAction(role);
  const canCreate = canCreatePost(role);
  const canManagePostsAccess = canManagePosts(role);
  const canManageUsersAccess = canManageUsers(role);
  const canManageCategoriesAccess = canManageCategories(role);

  // Dashboard access: Admin always has access, others need email verification
  const canViewDashboard =
    isAuthenticated &&
    (isAdmin || (isEmailVerified && (isWriter || isUser || isReader)));

  // Admin has full access regardless of email verification
  // Others need email verification for most actions
  const canAccessAdminFeatures = isAdmin || (isEmailVerified && canAdmin);
  const canAccessWriterFeatures = isAdmin || (isEmailVerified && canCreate);

  return {
    // User data
    user,
    role,
    isAuthenticated,
    isEmailVerified,

    // Role checks
    isAdmin,
    isWriter,
    isUser,
    isReader,

    // Permission checks
    canAdmin: canAccessAdminFeatures,
    canCreate: canAccessWriterFeatures,
    canManagePosts: canManagePostsAccess,
    canManageUsers: canManageUsersAccess,
    canManageCategories: canManageCategoriesAccess,

    // Access checks
    canViewDashboard,
    canAccessAdminFeatures,
    canAccessWriterFeatures,

    // Helper: Check if role has permission
    hasPermission: (requiredRole: UserRole) =>
      hasRolePermission(role, requiredRole),
  };
}

