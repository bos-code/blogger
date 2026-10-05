import { Link, useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { usePosts } from "../hooks/usePosts";
import { useRole } from "../hooks/useRole";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import PremiumSpinner from "../components/PremiumSpinner";
import { toTimestamp } from "../utils/date";
import { postPath } from "../utils/posts";

/** Dashboard home for writers and readers (admins see AdminDashboard). */
export default function WriterOverview(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const { canCreate } = useRole();
  const setDashboardScreen = useUIStore((state) => state.setDashboardScreen);
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = usePosts();

  const firstName = user?.nickname || user?.name?.split(" ")[0] || "there";

  if (!canCreate) {
    return (
      <div>
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Read, like and comment on posts from the blog."
        />
        <div className="surface">
          <EmptyState
            icon={BookOpenIcon}
            title="Catch up on the latest posts"
            description="Your account can like and comment on articles. Ask an administrator if you'd like to write for the blog."
            action={
              <Link to="/blog" className="btn btn-primary">
                Browse the blog
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Loading your posts..." />
      </div>
    );
  }

  const myPosts = posts
    .filter((post) => post.authorId === user?.uid)
    .sort((a, b) => toTimestamp(b.updatedAt ?? b.createdAt) - toTimestamp(a.updatedAt ?? a.createdAt));
  const count = (status: string) =>
    myPosts.filter((post) => (post.status || "draft") === status).length;
  const views = myPosts.reduce((sum, post) => sum + (post.views || 0), 0);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's how your writing is doing."
        actions={
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={() => navigate("/edit")}
          >
            <PencilSquareIcon className="h-5 w-5" />
            New post
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Drafts" value={count("draft")} icon={DocumentTextIcon} tone="secondary" />
        <StatCard label="In review" value={count("pending")} icon={ClockIcon} tone="warning" />
        <StatCard label="Published" value={count("approved")} icon={CheckCircleIcon} tone="success" />
        <StatCard label="Total views" value={views.toLocaleString()} icon={EyeIcon} tone="info" />
      </div>

      <section className="surface mt-6">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <h2 className="text-lg font-semibold">Recent posts</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setDashboardScreen("posts")}
          >
            View all
          </button>
        </div>
        {myPosts.length === 0 ? (
          <EmptyState
            icon={PencilSquareIcon}
            title="No posts yet"
            description="Start your first draft — it saves automatically as you write."
            action={
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/edit")}
              >
                Write a post
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-base-300">
            {myPosts.slice(0, 5).map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    to={postPath(post)}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {post.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-base-content/60">
                    {post.views || 0} views · {post.likedBy?.length ?? post.likes ?? 0} likes
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
