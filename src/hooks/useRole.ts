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
 * useRole with Super Admin support
 * Backward-compatible & production-safe
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  const rawRole = useAuthStore((state) => state.role);
  const logStatus = useAuthStore((state) => state.logStatus);
  const emailVerified = useAuthStore((state) => state.emailVerified);

  // ------------------------------------------------------------------
  // SAFETY LAYER
  // ------------------------------------------------------------------

  const isAuthenticated = Boolean(logStatus && user);
  const role: UserRole = (rawRole ?? "reader") as UserRole;
  const isEmailVerified = Boolean(emailVerified);

  // ------------------------------------------------------------------
  // ROLE FLAGS
  // ------------------------------------------------------------------

  const isSuperAdmin = isAuthenticated && role === "super_admin";
  const isAdmin = isAuthenticated && (role === "admin" || isSuperAdmin);
  const isWriter = isAuthenticated && hasRolePermission(role, "writer");
  const isUser = isAuthenticated && hasRolePermission(role, "user");
  const isReader = isAuthenticated && role === "reader";

  // ------------------------------------------------------------------
  // RAW ROLE PERMISSIONS
  // ------------------------------------------------------------------

  const roleCanAdmin = canPerformAdminAction(role);
  const roleCanCreate = canCreatePost(role);
  const roleCanManagePosts = canManagePosts(role);
  const roleCanManageUsers = canManageUsers(role);
  const roleCanManageCategories = canManageCategories(role);

  // ------------------------------------------------------------------
  // FINAL PERMISSIONS (SUPER ADMIN BYPASS)
  // ------------------------------------------------------------------

  const canAdmin = isSuperAdmin || isAdmin;

  const canCreate =
    isSuperAdmin || isAdmin || (isEmailVerified && roleCanCreate);

  const canManagePostsAccess =
    isSuperAdmin || isAdmin || (isEmailVerified && roleCanManagePosts);

  const canManageUsersAccess =
    isSuperAdmin || isAdmin || (isEmailVerified && roleCanManageUsers);

  const canManageCategoriesAccess =
    isSuperAdmin || isAdmin || (isEmailVerified && roleCanManageCategories);

  // ------------------------------------------------------------------
  // ACCESS FLAGS
  // ------------------------------------------------------------------

  const canViewDashboard = isAuthenticated;

  // Backward compatibility
  const canAccessAdminFeatures = canAdmin;
  const canAccessWriterFeatures = canCreate;

  // ------------------------------------------------------------------
  // RETURN (SAFE FOR EXISTING CODE)
  // ------------------------------------------------------------------

  return {
    // User data
    user,
    role,
    isAuthenticated,
    isEmailVerified,

    // Role checks
    isSuperAdmin, // ✅ NEW
    isAdmin,
    isWriter,
    isUser,
    isReader,

    // Permissions
    canAdmin,
    canCreate,
    canManagePosts: canManagePostsAccess,
    canManageUsers: canManageUsersAccess,
    canManageCategories: canManageCategoriesAccess,

    // Access checks
    canViewDashboard,
    canAccessAdminFeatures,
    canAccessWriterFeatures,

    // Helper
    hasPermission: (requiredRole: UserRole) =>
      isSuperAdmin || hasRolePermission(role, requiredRole),
  };
}
