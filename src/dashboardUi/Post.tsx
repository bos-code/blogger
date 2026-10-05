import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  StarIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import {
  usePosts,
  useApprovePost,
  useDeletePost,
  useRejectPost,
  useSetFeaturedPost,
  useBulkPostAction,
} from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import PremiumSpinner from "../components/PremiumSpinner";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import {
  showConfirm,
  showCustom,
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../utils/sweetalert";
import type { BlogPost, PostStatus } from "../types";
import { formatDate, toTimestamp } from "../utils/date";
import { getLikeCount, postPath } from "../utils/posts";

type StatusFilter = "all" | PostStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export default function Post(): React.ReactElement {
  const { data: posts = [], isLoading, error } = usePosts();
  const approvePost = useApprovePost();
  const rejectPost = useRejectPost();
  const deletePost = useDeletePost();
  const setFeatured = useSetFeaturedPost();
  const bulkAction = useBulkPostAction();
  const currentUser = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === "admin" || role === "super_admin";
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  // Admins manage every post; writers manage only their own.
  const managedPosts = useMemo(
    () =>
      (isAdmin
        ? posts
        : posts.filter((post) => post.authorId === currentUser?.uid)
      )
        .slice()
        .sort(
          (a, b) =>
            toTimestamp(b.updatedAt ?? b.createdAt) -
            toTimestamp(a.updatedAt ?? a.createdAt)
        ),
    [posts, isAdmin, currentUser?.uid]
  );

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: managedPosts.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    managedPosts.forEach((post) => {
      result[post.status || "draft"] += 1;
    });
    return result;
  }, [managedPosts]);

  const filteredPosts = managedPosts.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      (post.authorName || "").toLowerCase().includes(q) ||
      (post.category || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || (post.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canModify = (post: BlogPost) =>
    isAdmin || currentUser?.uid === post.authorId;

  const handleApprove = (post: BlogPost): void => {
    showConfirm("Publish post", `Publish "${post.title}" now?`, {
      confirmText: "Publish",
      confirmColor: "success",
      onConfirm: async () => {
        setBusyId(post.id);
        try {
          await approvePost.mutateAsync(post);
          showSuccess("Post published", `"${post.title}" is live.`);
        } catch {
          showError("Failed", "Could not publish the post. Please try again.");
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleReject = async (post: BlogPost): Promise<void> => {
    const result = await showCustom({
      title: "Send back for changes",
      input: "textarea",
      inputLabel: `What should the writer change in "${post.title}"?`,
      inputPlaceholder: "Optional — the writer will see this note",
      inputAttributes: { maxlength: "500", "aria-label": "Reason for rejection" },
      showCancelButton: true,
      confirmButtonText: "Send back",
    });
    if (!result.isConfirmed) return;

    setBusyId(post.id);
    try {
      await rejectPost.mutateAsync({ post, reason: String(result.value ?? "") });
      showSuccess("Sent back", "The writer has been notified.");
    } catch {
      showError("Failed", "Could not update the post. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (post: BlogPost): void => {
    void showDeleteConfirm(post.title, async () => {
      setBusyId(post.id);
      try {
        await deletePost.mutateAsync(post.id);
        showSuccess("Post deleted");
      } catch {
        showError("Failed", "Could not delete the post. Please try again.");
      } finally {
        setBusyId(null);
      }
    });
  };

  const handleFeature = async (post: BlogPost): Promise<void> => {
    setBusyId(post.id);
    try {
      await setFeatured.mutateAsync({ id: post.id, featured: !post.featured });
      showSuccess(
        post.featured ? "Removed from homepage" : "Featured on homepage"
      );
    } catch {
      showError("Failed", "Could not update the featured post.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected =
    filteredPosts.length > 0 && filteredPosts.every((post) => selected.has(post.id));

  const toggleAllVisible = () =>
    setSelected(
      allVisibleSelected ? new Set() : new Set(filteredPosts.map((post) => post.id))
    );

  const runBulk = (action: "approve" | "draft" | "delete") => {
    const ids = [...selected];
    const labels = {
      approve: "Publish",
      draft: "Move to drafts",
      delete: "Delete",
    } as const;
    showConfirm(
      `${labels[action]} ${ids.length} post(s)?`,
      action === "delete" ? "This cannot be undone." : undefined,
      {
        confirmText: labels[action],
        confirmColor: action === "delete" ? "error" : "primary",
        onConfirm: async () => {
          try {
            await bulkAction.mutateAsync({ ids, action });
            setSelected(new Set());
            showSuccess("Done", `${ids.length} post(s) updated.`);
          } catch {
            showError("Failed", "Some posts could not be updated.");
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" variant="primary" text="Loading posts..." />
      </div>
    );
  }

  const actionButtons = (post: BlogPost) => {
    const busy = busyId === post.id;
    return (
      <div className="flex flex-wrap items-center gap-1">
        <Link
          to={postPath(post)}
          className="btn btn-ghost btn-sm btn-square"
          aria-label={`View "${post.title}"`}
          title="View"
        >
          <EyeIcon className="h-4 w-4" />
        </Link>
        {canModify(post) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => navigate(`/edit/${post.id}`)}
            aria-label={`Edit "${post.title}"`}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        {isAdmin && post.status === "pending" && (
          <>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square text-success"
              onClick={() => handleApprove(post)}
              disabled={busy}
              aria-label={`Publish "${post.title}"`}
              title="Publish"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-square text-warning"
              onClick={() => void handleReject(post)}
              disabled={busy}
              aria-label={`Send "${post.title}" back for changes`}
              title="Send back"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </>
        )}
        {isAdmin && post.status === "approved" && (
          <button
            type="button"
            className={`btn btn-ghost btn-sm btn-square ${post.featured ? "text-warning" : ""}`}
            onClick={() => void handleFeature(post)}
            disabled={busy}
            aria-pressed={Boolean(post.featured)}
            aria-label={post.featured ? "Remove from homepage" : "Feature on homepage"}
            title={post.featured ? "Featured" : "Feature on homepage"}
          >
            {post.featured ? (
              <StarSolidIcon className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
        )}
        {canModify(post) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square text-error"
            onClick={() => handleDelete(post)}
            disabled={busy}
            aria-label={`Delete "${post.title}"`}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Manage posts" : "My posts"}
        description={`${filteredPosts.length} of ${managedPosts.length} posts`}
        actions={
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={() => navigate("/edit")}
          >
            <PlusIcon className="h-5 w-5" />
            New post
          </button>
        }
      />

      {error && (
        <div role="alert" className="alert alert-error mb-4">
          Could not load posts. Please refresh and try again.
        </div>
      )}

      <div className="surface mb-4 flex flex-col gap-3 p-3 sm:p-4">
        <label className="input w-full">
          <MagnifyingGlassIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by title, author or category"
            aria-label="Search posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="grow"
          />
        </label>
        <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`btn btn-sm shrink-0 rounded-full ${
                statusFilter === value ? "btn-primary" : "btn-ghost"
              }`}
            >
              {label}
              <span className="badge badge-sm border-0 bg-base-content/10">{counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      {isAdmin && selected.size > 0 && (
        <div className="surface mb-4 flex flex-wrap items-center gap-2 border-primary/40 bg-primary/5 p-3">
          <span className="mr-auto text-sm font-medium">{selected.size} selected</span>
          <button type="button" className="btn btn-sm btn-success" onClick={() => runBulk("approve")}>
            Publish
          </button>
          <button type="button" className="btn btn-sm btn-ghost border border-base-300" onClick={() => runBulk("draft")}>
            Move to drafts
          </button>
          <button type="button" className="btn btn-sm btn-error" onClick={() => runBulk("delete")}>
            Delete
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      <div className="surface overflow-hidden">
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={DocumentTextIcon}
            title={
              searchQuery || statusFilter !== "all"
                ? "No posts match your filters"
                : "No posts yet"
            }
            description={
              searchQuery || statusFilter !== "all"
                ? "Try a different search or status."
                : "Create your first post to see it here."
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="table">
                <thead>
                  <tr>
                    {isAdmin && (
                      <th className="w-10">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                          aria-label="Select all visible posts"
                        />
                      </th>
                    )}
                    <th>Title</th>
                    {isAdmin && <th>Author</th>}
                    <th>Status</th>
                    <th>Updated</th>
                    <th className="text-right">Views</th>
                    <th className="text-right">Likes</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-base-200/60">
                      {isAdmin && (
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selected.has(post.id)}
                            onChange={() => toggleSelected(post.id)}
                            aria-label={`Select "${post.title}"`}
                          />
                        </td>
                      )}
                      <td className="max-w-xs">
                        <p className="truncate font-medium">{post.title || "Untitled"}</p>
                        <p className="truncate text-xs text-base-content/55">
                          {post.category || "Uncategorised"}
                          {post.featured && " · Featured"}
                        </p>
                        {post.status === "rejected" && post.rejectionReason && (
                          <p className="mt-1 line-clamp-2 text-xs text-warning">
                            Note: {post.rejectionReason}
                          </p>
                        )}
                      </td>
                      {isAdmin && <td className="whitespace-nowrap">{post.authorName || "Anonymous"}</td>}
                      <td>
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="whitespace-nowrap text-sm text-base-content/70">
                        {formatDate(post.updatedAt ?? post.createdAt) || "—"}
                      </td>
                      <td className="text-right tabular-nums">{post.views || 0}</td>
                      <td className="text-right tabular-nums">{getLikeCount(post)}</td>
                      <td>{actionButtons(post)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-base-300 md:hidden">
              {filteredPosts.map((post) => (
                <li key={post.id} className="flex gap-3 p-4">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm mt-1"
                      checked={selected.has(post.id)}
                      onChange={() => toggleSelected(post.id)}
                      aria-label={`Select "${post.title}"`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{post.title || "Untitled"}</p>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="mt-1 text-xs text-base-content/60">
                      {isAdmin && `${post.authorName || "Anonymous"} · `}
                      {formatDate(post.updatedAt ?? post.createdAt) || "—"} · {post.views || 0} views
                    </p>
                    {post.status === "rejected" && post.rejectionReason && (
                      <p className="mt-1 text-xs text-warning">Note: {post.rejectionReason}</p>
                    )}
                    <div className="mt-2">{actionButtons(post)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
