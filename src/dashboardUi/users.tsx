import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useUsers, useUpdateUser } from "../hooks/useUsers";
import { useAuthStore } from "../stores/authStore";
import PremiumSpinner from "../components/PremiumSpinner";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import { showConfirm, showError, showSuccess } from "../utils/sweetalert";
import type { UserRole } from "../types";

const ROLE_INFO: Record<UserRole, { label: string; badge: string; description: string }> = {
  super_admin: { label: "Super admin", badge: "badge-error", description: "Everything, including managing admins" },
  admin: { label: "Admin", badge: "badge-warning", description: "Moderate posts, manage users and categories" },
  writer: { label: "Writer", badge: "badge-info", description: "Write posts and submit them for review" },
  user: { label: "User", badge: "badge-ghost", description: "Like, comment and save posts" },
  reader: { label: "Reader", badge: "badge-ghost", description: "Read and like posts (no comments)" },
};

export default function Users(): React.ReactElement {
  const { data: users = [], isLoading, error } = useUsers();
  const updateUser = useUpdateUser();
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.role);
  const isSuperAdmin = currentRole === "super_admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const assignableRoles: UserRole[] = isSuperAdmin
    ? ["reader", "user", "writer", "admin", "super_admin"]
    : ["reader", "user", "writer"];

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users
      .filter(
        (user) =>
          (roleFilter === "all" || (user.role ?? "user") === roleFilter) &&
          (!q || (user.name ?? "").toLowerCase().includes(q) || (user.email ?? "").toLowerCase().includes(q))
      )
      .sort((a, b) => (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? ""));
  }, [users, searchQuery, roleFilter]);

  const changeRole = (userId: string, name: string, from: UserRole, to: UserRole) => {
    if (from === to) return;
    const warning =
      to === "super_admin"
        ? " Super admins can't be demoted from this screen."
        : to === "admin"
          ? " Admins can moderate all posts and manage users."
          : "";
    showConfirm("Change role?", `Make ${name} a ${ROLE_INFO[to].label.toLowerCase()}?${warning}`, {
      confirmText: "Change role",
      confirmColor: to === "super_admin" || to === "admin" ? "warning" : "primary",
      onConfirm: async () => {
        setUpdatingId(userId);
        try {
          await updateUser.mutateAsync({ uid: userId, data: { role: to } });
          showSuccess("Role updated", `${name} is now a ${ROLE_INFO[to].label.toLowerCase()}.`);
        } catch {
          showError("Update failed", "You may not have permission to make this change.");
        } finally {
          setUpdatingId(null);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" variant="primary" text="Loading users..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Users" description={`${filteredUsers.length} of ${users.length} users`} />

      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Couldn't load users.
        </div>
      )}

      <div className="surface mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:p-4">
        <label className="input flex-1">
          <MagnifyingGlassIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email"
            aria-label="Search users"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="grow"
          />
        </label>
        <label htmlFor="role-filter" className="sr-only">
          Filter by role
        </label>
        <select
          id="role-filter"
          className="select sm:w-48"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}
        >
          <option value="all">All roles</option>
          {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_INFO[role].label}
            </option>
          ))}
        </select>
      </div>

      <div className="surface overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try a different search or role." />
        ) : (
          <ul className="divide-y divide-base-300">
            {filteredUsers.map((user) => {
              const role = (user.role ?? "user") as UserRole;
              const isCurrentUser = user.id === currentUser?.uid;
              const isProtected = role === "admin" || role === "super_admin";
              const canEdit = !isCurrentUser && role !== "super_admin" && (isSuperAdmin || !isProtected);
              const name = user.name || user.email || "this user";

              return (
                <li key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={user.name || user.email} src={user.photoURL} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.name || "Unnamed"}
                        {isCurrentUser && <span className="badge badge-primary badge-sm ml-2">You</span>}
                      </p>
                      <p className="truncate text-sm text-base-content/60">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:w-56">
                    {canEdit ? (
                      <>
                        <label htmlFor={`role-${user.id}`} className="sr-only">
                          Role for {name}
                        </label>
                        <select
                          id={`role-${user.id}`}
                          className="select select-sm w-full"
                          value={role}
                          disabled={updatingId === user.id}
                          onChange={(event) => changeRole(user.id, name, role, event.target.value as UserRole)}
                        >
                          {assignableRoles.map((option) => (
                            <option key={option} value={option}>
                              {ROLE_INFO[option].label}
                            </option>
                          ))}
                        </select>
                        {updatingId === user.id && <span className="loading loading-spinner loading-xs" />}
                      </>
                    ) : (
                      <span className={`badge ${ROLE_INFO[role].badge}`} title={isCurrentUser ? "You can't change your own role" : "Protected role"}>
                        {ROLE_INFO[role].label}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section className="surface mt-6 p-5" aria-labelledby="roles-heading">
        <h2 id="roles-heading" className="mb-3 font-semibold">
          What each role can do
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
          {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => (
            <div key={role}>
              <dt>
                <span className={`badge badge-sm ${ROLE_INFO[role].badge}`}>{ROLE_INFO[role].label}</span>
              </dt>
              <dd className="mt-1 text-base-content/70">{ROLE_INFO[role].description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
