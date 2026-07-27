import assert from "node:assert/strict";
import test from "node:test";
import {
  canCreatePost,
  canManageCategories,
  canManagePosts,
  canManageUsers,
  canPerformAdminAction,
  getRolesWithPermission,
  hasRolePermission,
} from "../src/utils/roleHelpers.ts";

test("role permissions follow the configured hierarchy", () => {
  assert.equal(hasRolePermission("reader", "user"), false);
  assert.equal(hasRolePermission("writer", "writer"), true);
  assert.equal(hasRolePermission("admin", "writer"), true);
  assert.equal(hasRolePermission("super_admin", "admin"), true);
  assert.equal(hasRolePermission(null, "reader"), false);
  assert.equal(hasRolePermission(undefined, "reader"), false);
});

test("role capability helpers expose the intended CMS permissions", () => {
  assert.equal(canCreatePost("writer"), true);
  assert.equal(canCreatePost("user"), false);
  assert.equal(canPerformAdminAction("admin"), true);
  assert.equal(canManagePosts("super_admin"), true);
  assert.equal(canManageUsers("writer"), false);
  assert.equal(canManageCategories("admin"), true);
});

test("getRolesWithPermission returns every qualifying role", () => {
  assert.deepEqual(getRolesWithPermission("writer"), [
    "writer",
    "admin",
    "super_admin",
  ]);
  assert.deepEqual(getRolesWithPermission("super_admin"), ["super_admin"]);
});
