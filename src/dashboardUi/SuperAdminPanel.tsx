import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useRole } from "../hooks/useRole";
import { useUsers } from "../hooks/useUsers";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import { motion } from "framer-motion";
import { ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { showSuccess, showError } from "../utils/sweetalert";
import type { UserRole } from "../types";

export default function SuperAdminPanel(): React.ReactElement {
  const { isSuperAdmin } = useRole();
  const { data: users = [], isLoading } = useUsers();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Access Denied: Super Admin privileges required.</span>
        </div>
      </div>
    );
  }

  const updateRole = async (uid: string, role: UserRole): Promise<void> => {
    if (!db) {
      showError("Database Error", "Firebase is not configured.");
      return;
    }

    setUpdatingUserId(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role });
      showSuccess("Role Updated", `User role has been updated to ${role}.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update role.";
      showError("Update Failed", errorMessage);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner size="lg" variant="primary" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 bg-error/10 rounded-xl">
          <ShieldCheckIcon className="w-8 h-8 text-error" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-base-content">
            Super Admin Control
          </h2>
          <p className="text-base-content/70">
            Manage user roles and permissions
          </p>
        </div>
      </motion.div>

      {/* Warning Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="alert alert-warning"
      >
        <ShieldCheckIcon className="w-5 h-5" />
        <span>
          <strong>Warning:</strong> Only Super Admins can access this panel.
          Changes to user roles are permanent.
        </span>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <UserGroupIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-base-content/70 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-base-content">
                {users.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70 text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isUpdating = updatingUserId === user.id;
                    const isSuperAdminUser = user.role === "super_admin";

                    return (
                      <tr key={user.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
                                {(user.name || user.email || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold">
                                {user.name || "Anonymous"}
                              </div>
                              <div className="text-sm text-base-content/70">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">{user.email || "No email"}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              user.role === "super_admin"
                                ? "badge-error"
                                : user.role === "admin"
                                  ? "badge-error"
                                  : user.role === "writer"
                                    ? "badge-warning"
                                    : user.role === "reader"
                                      ? "badge-info"
                                      : "badge-secondary"
                            } capitalize`}
                          >
                            {user.role || "user"}
                          </span>
                        </td>
                        <td>
                          {!isSuperAdminUser ? (
                            <select
                              className="select select-bordered select-sm"
                              value={user.role || "user"}
                              onChange={(e) =>
                                updateRole(user.id, e.target.value as UserRole)
                              }
                              disabled={isUpdating}
                            >
                              <option value="user">User</option>
                              <option value="reader">Reader</option>
                              <option value="writer">Writer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="text-base-content/50 text-sm italic">
                              Cannot modify
                            </span>
                          )}
                          {isUpdating && (
                            <span className="ml-2">
                              <CompactSpinner size="sm" variant="primary" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Role Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            Role Hierarchy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="badge badge-error mr-2">Super Admin</span>
              <p className="text-base-content/70 mt-1">
                Full system access, cannot be modified
              </p>
            </div>
            <div>
              <span className="badge badge-error mr-2">Admin</span>
              <p className="text-base-content/70 mt-1">
                Full access to all features
              </p>
            </div>
            <div>
              <span className="badge badge-warning mr-2">Writer</span>
              <p className="text-base-content/70 mt-1">
                Can create and edit posts
              </p>
            </div>
            <div>
              <span className="badge badge-secondary mr-2">User</span>
              <p className="text-base-content/70 mt-1">
                Standard user permissions
              </p>
            </div>
            <div>
              <span className="badge badge-info mr-2">Reader</span>
              <p className="text-base-content/70 mt-1">Read-only access</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


