import { useState } from "react";
import { useUsers, useUpdateUser } from "../hooks/useUsers";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  PencilIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError } from "../utils/sweetalert";
import type { UserRole } from "../types";

export default function Users(): React.ReactElement {
  const { data: users = [], isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("user");

  // Filter users
  const filteredUsers = users.filter((user) => {
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const handleRoleChange = (userId: string, currentRole: string): void => {
    setEditingUserId(userId);
    setNewRole(currentRole as UserRole);
  };

  const handleSaveRole = async (userId: string): Promise<void> => {
    if (userId === currentUser?.uid) {
      showError("Cannot Change Own Role", "You cannot change your own role.");
      setEditingUserId(null);
      return;
    }

    try {
      await updateUser.mutateAsync({
        uid: userId,
        data: { role: newRole },
      });
      showSuccess("Role Updated", `User role has been updated to ${newRole}.`);
      setEditingUserId(null);
    } catch (error) {
      showError(
        "Update Failed",
        "Failed to update user role. Please try again."
      );
    }
  };

  const handleCancelEdit = (): void => {
    setEditingUserId(null);
    setNewRole("user");
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "admin":
        return "badge-error";
      case "writer":
        return "badge-warning";
      case "reader":
        return "badge-info";
      default:
        return "badge-secondary";
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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-base-content">Manage Users</h1>
          <p className="text-base-content/70 mt-1">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <label className="input input-bordered flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow"
            />
          </label>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70 text-lg">
                {searchQuery ? "No users match your search" : "No users found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isCurrentUser = user.id === currentUser?.uid;
                    const isEditing = editingUserId === user.id;

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
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                <UserIcon className="w-6 h-6" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold">
                                {user.name || "Anonymous"}
                                {isCurrentUser && (
                                  <span className="badge badge-sm badge-primary ml-2">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-base-content/70">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            {user.email || "No email"}
                          </div>
                        </td>
                        <td>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="select select-bordered select-sm"
                                value={newRole}
                                onChange={(e) =>
                                  setNewRole(e.target.value as UserRole)
                                }
                              >
                                <option value="user">User</option>
                                <option value="writer">Writer</option>
                                <option value="admin">Admin</option>
                                <option value="reader">Reader</option>
                              </select>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSaveRole(user.id)}
                                disabled={updateUser.isPending}
                              >
                                {updateUser.isPending ? (
                                  <CompactSpinner size="sm" variant="primary" />
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`badge ${getRoleBadgeColor(
                                user.role || "user"
                              )}`}
                            >
                              {user.role || "user"}
                            </span>
                          )}
                        </td>
                        <td>
                          {!isEditing && !isCurrentUser && (
                            <button
                              className="btn btn-sm btn-primary gap-2"
                              onClick={() =>
                                handleRoleChange(user.id, user.role || "user")
                              }
                              title="Change Role"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit Role</span>
                            </button>
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

      {/* Role Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            Role Permissions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
