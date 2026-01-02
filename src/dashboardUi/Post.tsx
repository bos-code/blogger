import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAllPosts, useDeletePost, useApprovePost, useUpdatePost } from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import { useRole } from "../hooks/useRole";
import { motion } from "framer-motion";
import PremiumSpinner from "../components/PremiumSpinner";
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { showDeleteConfirm, showSuccess } from "../utils/sweetalert";
import type { BlogPost } from "../types";

export default function Post(): React.ReactElement {
  const { data: posts = [], isLoading } = useAllPosts();
  const deletePost = useDeletePost();
  const approvePost = useApprovePost();
  const updatePost = useUpdatePost();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin, canApprovePost, canEditPost, canDeletePost } = useRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");

  // Calculate stats
  const pendingPosts = posts.filter((p) => p.status === "pending" || !p.status);
  const approvedPosts = posts.filter((p) => p.status === "approved");
  const rejectedPosts = posts.filter((p) => p.status === "rejected");

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.authorName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Handle status filtering - treat undefined/null as "pending"
    const postStatus = post.status || "pending";
    const matchesStatus =
      statusFilter === "all" || postStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (post: BlogPost): void => {
    navigate("/create-post", {
      state: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        category: post.category || "",
        status: post.status || "pending",
      },
    });
  };

  const handleDelete = (post: BlogPost): void => {
    showDeleteConfirm(post.title, () => {
      deletePost.mutate(post.id);
      showSuccess("Post Deleted", "The blog post has been deleted successfully!");
    });
  };

  const handleApprove = (postId: string): void => {
    approvePost.mutate(postId);
  };

  const handleReject = (postId: string): void => {
    updatePost.mutate({
      id: postId,
      data: { status: "rejected" },
    });
    showSuccess("Post Rejected", "The blog post has been rejected.");
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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
            {isAdmin && pendingPosts.length > 0 && (
              <span className="ml-2 badge badge-warning gap-2">
                <ClockIcon className="w-4 h-4" />
                {pendingPosts.length} pending approval
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Pending Posts Alert (Admin Only) */}
      {isAdmin && pendingPosts.length > 0 && statusFilter !== "pending" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning shadow-lg"
        >
          <ClockIcon className="w-6 h-6" />
          <div>
            <h3 className="font-bold">
              {pendingPosts.length} post{pendingPosts.length !== 1 ? "s" : ""} pending approval
            </h3>
            <div className="text-sm">
              Click on "Pending" filter or scroll down to review and approve posts.
            </div>
          </div>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => setStatusFilter("pending")}
          >
            Review Now
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-lg"
      >
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="input input-bordered flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="grow"
                />
              </label>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-base-content/70" />
              <select
                className="select select-bordered w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => {
                  const newFilter = e.target.value as "all" | "approved" | "pending" | "rejected";
                  setStatusFilter(newFilter);
                }}
              >
                <option value="all">All Status ({posts.length})</option>
                <option value="approved">Approved ({approvedPosts.length})</option>
                <option value="pending">Pending ({pendingPosts.length})</option>
                <option value="rejected">Rejected ({rejectedPosts.length})</option>
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
          {/* Active Filters Display */}
          {(searchQuery || statusFilter !== "all") && (
            <div className="p-4 bg-base-200 border-b border-base-300">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-base-content/70">Active filters:</span>
                {searchQuery && (
                  <span className="badge badge-primary gap-2">
                    Search: "{searchQuery}"
                    <button
                      className="btn btn-xs btn-circle btn-ghost"
                      onClick={() => setSearchQuery("")}
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="badge badge-secondary gap-2">
                    Status: {statusFilter}
                    <button
                      className="btn btn-xs btn-circle btn-ghost"
                      onClick={() => setStatusFilter("all")}
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  className="btn btn-xs btn-ghost ml-auto"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base-content/70 text-lg mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No posts match your filters"
                  : "No posts yet"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <button
                  className="btn btn-sm btn-ghost mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Likes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className={`hover ${
                        (post.status === "pending" || !post.status) && isAdmin
                          ? "bg-warning/5 border-l-4 border-l-warning"
                          : ""
                      }`}
                    >
                      <td>
                        <div className="font-semibold line-clamp-2 max-w-xs">
                          {post.title}
                        </div>
                        {post.category && (
                          <span className="badge badge-sm badge-secondary mt-1">
                            {post.category}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {post.authorAvatar && (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName || "Author"}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span>{post.authorName || "Anonymous"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-lg ${
                            post.status === "approved"
                              ? "badge-success"
                              : post.status === "pending"
                              ? "badge-warning animate-pulse"
                              : "badge-error"
                          }`}
                        >
                          {post.status === "pending" || !post.status ? (
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              Pending
                            </span>
                          ) : (
                            post.status
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {post.views || 0}
                        </div>
                      </td>
                      <td>{post.likedBy?.length || post.likes || 0}</td>
                      <td>
                        <div className="text-sm text-base-content/70">
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick Approve/Reject for Pending Posts (Admin) */}
                          {isAdmin && (post.status === "pending" || !post.status) && (
                            <>
                              <button
                                className="btn btn-sm btn-success gap-1"
                                onClick={() => handleApprove(post.id)}
                                title="Approve Post"
                                disabled={approvePost.isPending}
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                className="btn btn-sm btn-error gap-1"
                                onClick={() => handleReject(post.id)}
                                title="Reject Post"
                                disabled={updatePost.isPending}
                              >
                                <XCircleIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}
                          
                          {/* View Button */}
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => navigate(`/blog/${post.id}`)}
                            title="View Post"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          
                          {/* Edit Button */}
                          {(currentUser?.uid === post.authorId || isAdmin) && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEdit(post)}
                              title="Edit Post"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {(currentUser?.uid === post.authorId || isAdmin) && (
                            <button
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => handleDelete(post)}
                              title="Delete Post"
                              disabled={deletePost.isPending}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
