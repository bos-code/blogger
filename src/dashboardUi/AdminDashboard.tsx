import { usePosts } from "../hooks/usePosts";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import PremiumSpinner from "../components/PremiumSpinner";
import type { BlogPost } from "../types";

export default function AdminDashboard(): React.ReactElement {
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const currentUser = useAuthStore((state) => state.user);

  if (postsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner size="lg" variant="primary" text="Loading dashboard..." />
      </div>
    );
  }

  // Calculate statistics
  const totalPosts = posts.length;
  const approvedPosts = posts.filter((p: BlogPost) => p.status === "approved").length;
  const pendingPosts = posts.filter((p: BlogPost) => p.status === "pending").length;
  const totalViews = posts.reduce((sum: number, p: BlogPost) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce(
    (sum: number, p: BlogPost) => sum + ((p.likedBy?.length || 0) || (p.likes || 0)),
    0
  );
  const totalUsers = users.length;
  const recentPosts = [...posts]
    .sort((a: BlogPost, b: BlogPost) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const stats = [
    {
      title: "Total Posts",
      value: totalPosts,
      icon: DocumentTextIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Approved Posts",
      value: approvedPosts,
      icon: CheckCircleIcon,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Posts",
      value: pendingPosts,
      icon: ClockIcon,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: UserGroupIcon,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: EyeIcon,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: HeartIcon,
      color: "text-error",
      bgColor: "bg-error/10",
    },
  ];

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

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">
          Welcome back, {currentUser?.name || "Admin"}!
        </h1>
        <p className="text-base-content/70 text-lg">
          Here's an overview of your blog platform
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base-content/70 text-sm font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-base-content">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-4 rounded-xl`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card bg-base-100 shadow-xl"
      >
        <div className="card-body">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Recent Posts
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-base-content/70 text-center py-8">
              No posts yet. Create your first post!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map((post: BlogPost) => (
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
                              : "badge-secondary"
                          }`}
                        >
                          {post.status || "draft"}
                        </span>
                      </td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>{post.views || 0}</td>
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
