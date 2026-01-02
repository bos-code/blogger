import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types";

/**
 * Custom hook for role-based access control
 * Provides optimized role checks and permission utilities
 */
export const useRole = () => {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const isAdmin = role === "admin";
  const isWriter = role === "writer";
  const isUser = role === "user";
  const isReader = role === "reader";
  const isAuthenticated = !!user;

  // Permission checks
  const canCreatePost = isAdmin || isWriter;
  const canEditPost = (authorId: string) =>
    isAdmin || (isWriter && user?.uid === authorId);
  const canDeletePost = (authorId: string) =>
    isAdmin || (isWriter && user?.uid === authorId);
  const canApprovePost = isAdmin;
  const canManageUsers = isAdmin;
  const canManageCategories = isAdmin;
  const canViewDashboard = isAdmin || isWriter;
  const canLikePost = isAuthenticated && !isReader;
  const canComment = isAuthenticated && !isReader;
  const canViewUnapprovedPosts = isAdmin;

  return {
    role,
    user,
    isAdmin,
    isWriter,
    isUser,
    isReader,
    isAuthenticated,
    // Permissions
    canCreatePost,
    canEditPost,
    canDeletePost,
    canApprovePost,
    canManageUsers,
    canManageCategories,
    canViewDashboard,
    canLikePost,
    canComment,
    canViewUnapprovedPosts,
  };
};

/**
 * Check if a role has a specific permission
 */
export const hasRole = (
  userRole: UserRole | null,
  requiredRole: UserRole | UserRole[]
): boolean => {
  if (!userRole) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  // Role hierarchy: admin > writer > user > reader
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    writer: 3,
    user: 2,
    reader: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
