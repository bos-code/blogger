import { Link } from "react-router-dom";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { useBookmarks, useToggleBookmark } from "../hooks/useBookmarks";
import { usePosts } from "../hooks/usePosts";
import BlogPostCard from "../components/BlogPostCard";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import PremiumSpinner from "../components/PremiumSpinner";
import { isPostPublic } from "../utils/date";

/** Posts the signed-in user has bookmarked. */
export default function SavedPosts(): React.ReactElement {
  const { data: bookmarks = [], isLoading: bookmarksLoading } = useBookmarks();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const toggleBookmark = useToggleBookmark();

  const saved = bookmarks
    .map((id) => posts.find((post) => post.id === id))
    .filter((post): post is NonNullable<typeof post> => Boolean(post && isPostPublic(post)))
    .reverse();
  const missing = bookmarks.filter((id) => !posts.some((post) => post.id === id));

  if (bookmarksLoading || postsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <PremiumSpinner size="lg" text="Loading saved posts..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Saved posts" description="Posts you've bookmarked to read later." />
      {saved.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={BookmarkIcon}
            title="Nothing saved yet"
            description="Use the bookmark button on any post to keep it here."
            action={
              <Link to="/blog" className="btn btn-primary">
                Browse posts
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {saved.map((post) => (
            <div key={post.id} className="relative">
              <BlogPostCard post={post} />
              <button
                type="button"
                className="btn btn-sm btn-circle absolute right-3 top-3 bg-base-100/90"
                onClick={() => toggleBookmark.mutate({ postId: post.id, saved: true })}
                aria-label={`Remove "${post.title}" from saved posts`}
                title="Remove from saved"
              >
                <BookmarkIcon className="h-4 w-4 fill-current text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}
      {missing.length > 0 && (
        <p className="mt-4 text-sm text-base-content/60">
          {missing.length} saved {missing.length === 1 ? "post is" : "posts are"} no longer available.{" "}
          <button
            type="button"
            className="link"
            onClick={() => missing.forEach((postId) => toggleBookmark.mutate({ postId, saved: true }))}
          >
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
