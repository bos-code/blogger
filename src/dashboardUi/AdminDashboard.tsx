import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { usePosts } from "../hooks/usePosts";
import { useUsers } from "../hooks/useUsers";
import { useMessages } from "../hooks/useMessages";
import { useDailyStats } from "../hooks/useAnalytics";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import PremiumSpinner from "../components/PremiumSpinner";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import ViewsChart from "../components/ui/ViewsChart";
import { formatDate, toTimestamp } from "../utils/date";
import { getLikeCount, postPath } from "../utils/posts";

export default function AdminDashboard(): React.ReactElement {
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: messages = [] } = useMessages();
  const { data: daily = [], isLoading: statsLoading, error: statsError } = useDailyStats(30);
  const currentUser = useAuthStore((state) => state.user);
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);

  const stats = useMemo(() => {
    const count = (status: string) => posts.filter((post) => post.status === status).length;
    return {
      published: count("approved"),
      pending: count("pending"),
      views: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      likes: posts.reduce((sum, post) => sum + getLikeCount(post), 0),
    };
  }, [posts]);

  const titleById = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts]);
  const last30 = daily.reduce((sum, day) => sum + day.views, 0);
  const last7 = daily.slice(-7).reduce((sum, day) => sum + day.views, 0);
  const prev7 = daily.slice(-14, -7).reduce((sum, day) => sum + day.views, 0);
  const trend = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : null;

  const topPosts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const day of daily) {
      for (const [id, views] of Object.entries(day.posts)) totals.set(id, (totals.get(id) ?? 0) + views);
    }
    const ranked = [...totals.entries()]
      .filter(([id]) => titleById.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    if (ranked.length) return ranked.map(([id, views]) => ({ post: titleById.get(id)!, views, period: true }));
    // No daily data yet: fall back to all-time views.
    return [...posts]
      .filter((post) => (post.views ?? 0) > 0)
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 5)
      .map((post) => ({ post, views: post.views ?? 0, period: false }));
  }, [daily, posts, titleById]);

  const pendingPosts = posts
    .filter((post) => post.status === "pending")
    .sort((a, b) => toTimestamp(a.updatedAt ?? a.createdAt) - toTimestamp(b.updatedAt ?? b.createdAt))
    .slice(0, 5);
  const unreadMessages = messages.filter((message) => !message.read).length;

  if (postsLoading || usersLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" variant="primary" text="Loading dashboard..." />
      </div>
    );
  }

  const maxTop = Math.max(1, ...topPosts.map((item) => item.views));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${currentUser?.nickname || currentUser?.name?.split(" ")[0] || "Admin"}`}
        description="Here's what's happening on the site."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Published posts" value={stats.published} icon={DocumentTextIcon} tone="success" />
        <StatCard label="Waiting for review" value={stats.pending} icon={ClockIcon} tone="warning" />
        <StatCard label="Users" value={users.length} icon={UserGroupIcon} tone="info" />
        <StatCard label="All-time views" value={stats.views.toLocaleString()} icon={EyeIcon} tone="secondary" />
        <StatCard label="Likes" value={stats.likes.toLocaleString()} icon={HeartIcon} tone="error" />
        <StatCard label="Unread messages" value={unreadMessages} icon={EnvelopeIcon} tone="primary" />
      </div>

      <section className="surface mt-6 p-5" aria-labelledby="views-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="views-heading" className="text-lg font-semibold">
              Views, last 30 days
            </h2>
            <p className="text-sm text-base-content/65">
              {last30.toLocaleString()} views · {last7.toLocaleString()} in the last 7 days
              {trend !== null && (
                <span className={trend >= 0 ? "text-success" : "text-error"}>
                  {" "}({trend >= 0 ? "+" : ""}
                  {trend}% vs previous week)
                </span>
              )}
            </p>
          </div>
        </div>
        {statsLoading ? (
          <div className="skeleton h-48 w-full" />
        ) : statsError ? (
          <p className="text-sm text-error">Analytics couldn't be loaded.</p>
        ) : last30 === 0 ? (
          <p className="py-10 text-center text-sm text-base-content/60">
            No views recorded yet. Daily stats appear as readers open posts.
          </p>
        ) : (
          <ViewsChart data={daily} />
        )}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="surface" aria-labelledby="top-heading">
          <h2 id="top-heading" className="border-b border-base-300 px-5 py-4 text-lg font-semibold">
            Top posts {topPosts[0] && !topPosts[0].period && <span className="text-sm font-normal text-base-content/55">(all time)</span>}
          </h2>
          {topPosts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-base-content/60">No views yet.</p>
          ) : (
            <ol className="flex flex-col gap-3 p-5">
              {topPosts.map(({ post, views }) => (
                <li key={post.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <Link to={postPath(post)} className="truncate font-medium hover:text-primary">
                      {post.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-base-content/70">{views.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-base-200" aria-hidden="true">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(views / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="surface" aria-labelledby="review-heading">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <h2 id="review-heading" className="text-lg font-semibold">
              Review queue
            </h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDashboardScreen("posts")}>
              Manage posts
            </button>
          </div>
          {pendingPosts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-base-content/60">Nothing waiting for review.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {pendingPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link to={postPath(post)} className="block truncate font-medium hover:text-primary">
                      {post.title}
                    </Link>
                    <p className="text-xs text-base-content/60">
                      {post.authorName || "Anonymous"} · {formatDate(post.updatedAt ?? post.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
