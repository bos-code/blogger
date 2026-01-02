import { useAllPosts } from "../hooks/usePosts";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";
import PremiumSpinner from "../components/PremiumSpinner";
import {
  DocumentTextIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard(): React.ReactElement {
  const { data: posts = [], isLoading: postsLoading } = useAllPosts();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const currentUser = useAuthStore((state) => state.user);

  if (postsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PremiumSpinner
          size="lg"
          variant="primary"
          text="Loading dashboard..."
        />
      </div>
    );
  }

  // Calculate stats - properly handle undefined/null statuses
  const totalPosts = posts.length;
  const approvedPosts = posts.filter((p) => p.status === "approved").length;
  const pendingPosts = posts.filter(
    (p) => p.status === "pending" || !p.status
  ).length;
  const rejectedPosts = posts.filter((p) => p.status === "rejected").length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  // Use likedBy array length as source of truth (likes field is deprecated)
  const totalLikes = posts.reduce(
    (sum, p) => sum + (p.likedBy?.length || p.likes || 0),
    0
  );
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const writerUsers = users.filter((u) => u.role === "writer").length;
  const regularUsers = users.filter((u) => u.role === "user" || !u.role).length;

  // Recent posts (last 5) - handle undefined createdAt properly
  const recentPosts = [...posts]
    .sort((a, b) => {
      try {
        const aTime =
          a.createdAt?.toDate?.()?.getTime() ||
          (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0) ||
          (typeof a.createdAt === "number" ? a.createdAt : 0);
        const bTime =
          b.createdAt?.toDate?.()?.getTime() ||
          (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) ||
          (typeof b.createdAt === "number" ? b.createdAt : 0);
        return bTime - aTime;
      } catch {
        return 0;
      }
    })
    .slice(0, 5);

  // Calculate additional stats
  const averageViewsPerPost =
    totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
  const averageLikesPerPost =
    totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
  const approvalRate =
    totalPosts > 0 ? Math.round((approvedPosts / totalPosts) * 100) : 0;

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

  const statCards = [
    {
      title: "Total Posts",
      value: totalPosts,
      icon: DocumentTextIcon,
      color: "primary",
      change: `${approvedPosts} approved`,
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: UserGroupIcon,
      color: "secondary",
      change: `${adminUsers} admins, ${writerUsers} writers, ${regularUsers} users`,
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: EyeIcon,
      color: "accent",
      change: `~${averageViewsPerPost} avg per post`,
    },
    {
      title: "Total Likes",
      value: totalLikes.toLocaleString(),
      icon: HeartIcon,
      color: "info",
      change: `~${averageLikesPerPost} avg per post`,
    },
  ];

  const statusCards = [
    {
      title: "Approved",
      value: approvedPosts,
      icon: CheckCircleIcon,
      color: "success",
      subtitle: `${approvalRate}% of total`,
    },
    {
      title: "Pending",
      value: pendingPosts,
      icon: PendingIcon,
      color: "warning",
      subtitle: "Awaiting review",
    },
    {
      title: "Rejected",
      value: rejectedPosts,
      icon: XCircleIcon,
      color: "error",
      subtitle: "Not published",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-base-content mb-2">
          Welcome back, {currentUser?.name || "Admin"}!
        </h1>
        <p className="text-base-content/70">
          Here's an overview of your blog platform
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-base-100 shadow-xl"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-base-content">
                    {stat.value}
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`text-${stat.color}`}>
                  <stat.icon className="w-12 h-12" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Post Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-base-content mb-4">
          Post Status Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusCards.map((status) => (
            <div
              key={status.title}
              className={`card bg-${status.color}/10 border-2 border-${status.color} shadow-lg`}
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">
                      {status.title}
                    </p>
                    <p className="text-3xl font-bold text-base-content">
                      {status.value}
                    </p>
                    {status.subtitle && (
                      <p className="text-xs text-base-content/50 mt-1">
                        {status.subtitle}
                      </p>
                    )}
                  </div>
                  <status.icon className={`w-10 h-10 text-${status.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-base-content mb-4">
          Recent Posts
        </h2>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {recentPosts.length === 0 ? (
              <p className="text-base-content/70 text-center py-8">
                No posts yet
              </p>
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
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.id}>
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
                                  : "badge-error"
                            }`}
                          >
                            {post.status || "pending"}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {post.views || 0}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {post.likedBy?.length || post.likes || 0}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-sm text-base-content/70">
                            <ClockIcon className="w-4 h-4" />
                            {formatDate(post.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
