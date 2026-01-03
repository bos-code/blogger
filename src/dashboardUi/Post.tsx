import { useState } from "react";
import {
  usePosts,
  useApprovePost,
  useDeletePost,
  useUpdatePost,
} from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PremiumSpinner, { CompactSpinner } from "../components/PremiumSpinner";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { showConfirm, showSuccess, showError } from "../utils/sweetalert";
import type { BlogPost } from "../types";

export default function Post(): React.ReactElement {
  const { data: posts = [], isLoading } = usePosts();
  const approvePost = useApprovePost();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const currentUser = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  // Filter posts
  const filteredPosts = posts.filter((post: BlogPost) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.authorName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (post: BlogPost): Promise<void> => {
    if (role !== "admin") {
      showError("Permission Denied", "Only admins can approve posts.");
      return;
    }

    showConfirm("Approve Post", `Approve "${post.title}"?`, {
      confirmText: "Approve",
      cancelText: "Cancel",
      confirmColor: "success",
      onConfirm: async () => {
        try {
          await approvePost.mutateAsync(post.id);
          showSuccess(
            "Post Approved",
            "The post has been approved successfully!"
          );
        } catch (error) {
          showError("Failed", "Could not approve the post. Please try again.");
        }
      },
    });
  };

  const handleReject = async (post: BlogPost): Promise<void> => {
    if (role !== "admin") {
      showError("Permission Denied", "Only admins can reject posts.");
      return;
    }

    showConfirm(
      "Reject Post",
      `Reject "${post.title}"? This action cannot be undone.`,
      {
        confirmText: "Reject",
        cancelText: "Cancel",
        confirmColor: "error",
        onConfirm: async () => {
          try {
            await updatePost.mutateAsync({
              id: post.id,
              data: { status: "rejected" },
            });
            showSuccess("Post Rejected", "The post has been rejected.");
          } catch (error) {
            showError("Failed", "Could not reject the post. Please try again.");
          }
        },
      }
    );
  };

  const handleDelete = async (post: BlogPost): Promise<void> => {
    const canDelete = role === "admin" || currentUser?.uid === post.authorId;

    if (!canDelete) {
      showError(
        "Permission Denied",
        "You don't have permission to delete this post."
      );
      return;
    }

    showConfirm(
      "Delete Post",
      `Delete "${post.title}"? This action cannot be undone.`,
      {
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmColor: "error",
        onConfirm: async () => {
          try {
            await deletePost.mutateAsync(post.id);
            showSuccess(
              "Post Deleted",
              "The post has been deleted successfully."
            );
          } catch (error) {
            showError("Failed", "Could not delete the post. Please try again.");
          }
        },
      }
    );
  };

  const handleEdit = (post: BlogPost): void => {
    navigate("/create-post", {
      state: {
        id: post.id,
        title: post.title,
        rawText: post.content,
        tags: post.tags || [],
        category: post.category || "",
        status: post.status || "draft",
      },
    });
  };

  const handleView = (post: BlogPost): void => {
    navigate(`/blog/${post.id}`);
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner size="lg" variant="primary" text="Loading posts..." />
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
          <h1 className="text-3xl font-bold text-base-content">Manage Posts</h1>
          <p className="text-base-content/70 mt-1">
            {filteredPosts.length} of {posts.length} posts
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <MagnifyingGlassIcon className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="grow"
              />
            </label>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-base-content/70" />
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "rejected"
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body p-0">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70 text-lg">
                {searchQuery || statusFilter !== "all"
                  ? "No posts match your filters"
                  : "No posts found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post: BlogPost) => {
                    const canEdit =
                      role === "admin" || currentUser?.uid === post.authorId;
                    const canDelete =
                      role === "admin" || currentUser?.uid === post.authorId;

                    return (
                      <tr key={post.id} className="hover">
                        <td>
                          <div className="font-semibold line-clamp-1 max-w-xs">
                            {post.title}
                          </div>
                        </td>
                        <td>{post.authorName || "Anonymous"}</td>
                        <td>
                          <span
                            className={`badge ${
                              post.status === "approved"
                                ? "badge-success"
                                : post.status === "pending"
                                  ? "badge-warning"
                                  : post.status === "rejected"
                                    ? "badge-error"
                                    : "badge-secondary"
                            }`}
                          >
                            {post.status || "draft"}
                          </span>
                        </td>
                        <td>
                          {post.category ? (
                            <span className="badge badge-outline">
                              {post.category}
                            </span>
                          ) : (
                            <span className="text-base-content/50">—</span>
                          )}
                        </td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>{post.views || 0}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleView(post)}
                              title="View Post"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>

                            {canEdit && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(post)}
                                title="Edit Post"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            )}

                            {role === "admin" && post.status === "pending" && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(post)}
                                disabled={approvePost.isPending}
                                title="Approve Post"
                              >
                                {approvePost.isPending ? (
                                  <CompactSpinner size="sm" variant="primary" />
                                ) : (
                                  <CheckCircleIcon className="w-4 h-4" />
                                )}
                              </button>
                            )}

                            {role === "admin" && post.status === "pending" && (
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleReject(post)}
                                disabled={updatePost.isPending}
                                title="Reject Post"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                className="btn btn-sm btn-error"
                                onClick={() => handleDelete(post)}
                                disabled={deletePost.isPending}
                                title="Delete Post"
                              >
                                {deletePost.isPending ? (
                                  <CompactSpinner size="sm" variant="primary" />
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
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
    </div>
  );
}
