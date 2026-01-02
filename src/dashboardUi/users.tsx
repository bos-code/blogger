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
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useUsers();
  const updateUser = useUpdateUser();
  const currentUser = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("user");

  // Debug logging
  console.log("Users Component Debug:", {
    users,
    usersLength: users.length,
    isLoading,
    error,
    usersType: Array.isArray(users),
  });

  // Filter users with additional safety checks
  const filteredUsers = users.filter((user) => {
    if (!user || typeof user !== "object") {
      console.warn("Invalid user object:", user);
      return false;
    }
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

  const getRoleBadgeColor = (userRole: string): string => {
    switch (userRole) {
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

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const isPermissionError =
      errorMessage.toLowerCase().includes("permission") ||
      errorMessage.toLowerCase().includes("insufficient");

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-error mb-4">
            Error Loading Users
          </h2>
          <div className="text-base-content/70 mb-4 space-y-2">
            <p>{errorMessage}</p>
            {isPermissionError && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4 text-left">
                <h3 className="font-semibold text-warning mb-2">
                  Firestore Permission Issue
                </h3>
                <p className="text-sm mb-3">
                  To fix this, update your Firestore security rules:
                </p>
                <ol className="text-sm list-decimal list-inside space-y-1 mb-3">
                  <li>Go to Firebase Console → Firestore Database → Rules</li>
                  <li>Add a rule for the users collection:</li>
                </ol>
                <pre className="bg-base-300 p-3 rounded text-xs overflow-x-auto">
                  {`match /users/{userId} {
  // Allow admins to read all users
  allow read: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  
  // Allow users to read their own document
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Allow admins to update any user
  allow update: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}
                </pre>
                <p className="text-xs mt-3 text-base-content/60">
                  Make sure your user document in Firestore has{" "}
                  <code className="bg-base-300 px-1 rounded">
                    role: "admin"
                  </code>
                </p>
              </div>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-base-content">Manage Users</h1>
          <p className="text-base-content/70 mt-1">
            {searchQuery
              ? `${filteredUsers.length} of ${users.length} users`
              : `${users.length} user${users.length !== 1 ? "s" : ""}`}
          </p>
          {users.length === 0 && !isLoading && !error && (
            <p className="text-warning text-sm mt-2">
              No users found in database. Users are created automatically on
              signup.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
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
              <p className="text-base-content/70 text-lg mb-2">
                {searchQuery ? "No users match your search" : "No users found"}
              </p>
              {!searchQuery && users.length === 0 && (
                <div className="text-sm text-base-content/50 space-y-2">
                  <p>Users are automatically created when they sign up.</p>
                  <p>Check your Firestore database to ensure:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>The "users" collection exists</li>
                    <li>Firestore security rules allow read access</li>
                    <li>You're authenticated as an admin</li>
                  </ul>
                </div>
              )}
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
                  {filteredUsers.map((user, index) => {
                    // Additional safety checks
                    if (!user || !user.id) {
                      console.warn(`Invalid user at index ${index}:`, user);
                      return null;
                    }

                    const isCurrentUser = user.id === currentUser?.uid;
                    const isEditing = editingUserId === user.id;

                    return (
                      <tr key={user.id || `user-${index}`} className="hover">
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
                                ID:{" "}
                                {user.id ? `${user.id.slice(0, 8)}...` : "N/A"}
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
