import type { UserRole } from "../types";

/**
 * Role hierarchy for permission checking
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  reader: 1,
  user: 2,
  writer: 3,
  admin: 4,
};

/**
 * Check if a role has at least the required permission level
 */
export function hasRolePermission(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can perform admin actions
 */
export function canPerformAdminAction(
  userRole: UserRole | null | undefined
): boolean {
  return hasRolePermission(userRole, "admin");
}

/**
 * Check if user can create/edit posts
 */
export function canCreatePost(
  userRole: UserRole | null | undefined
): boolean {
  return hasRolePermission(userRole, "writer");
}

/**
 * Check if user can manage posts (approve, reject, etc.)
 */
export function canManagePosts(
  userRole: UserRole | null | undefined
): boolean {
  return hasRolePermission(userRole, "admin");
}

/**
 * Check if user can manage users
 */
export function canManageUsers(
  userRole: UserRole | null | undefined
): boolean {
  return hasRolePermission(userRole, "admin");
}

/**
 * Check if user can manage categories
 */
export function canManageCategories(
  userRole: UserRole | null | undefined
): boolean {
  return hasRolePermission(userRole, "admin");
}

/**
 * Get all roles that have at least the specified permission level
 */
export function getRolesWithPermission(requiredRole: UserRole): UserRole[] {
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return (Object.keys(ROLE_HIERARCHY) as UserRole[]).filter(
    (role) => ROLE_HIERARCHY[role] >= requiredLevel
  );
}

