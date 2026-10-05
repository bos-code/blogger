import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { usePosts } from "../hooks/usePosts";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import BlogPostCard from "../components/BlogPostCard";
import BlogPostSkeleton from "../components/BlogPostSkeleton";
import Avatar from "../components/ui/Avatar";
import EmptyState from "../components/ui/EmptyState";
import { isPostPublic, toTimestamp } from "../utils/date";
import { getLikeCount } from "../utils/posts";

/** Public list of an author's published posts. */
export default function AuthorPage(): React.ReactElement {
  const { authorId } = useParams<{ authorId: string }>();
  const { data: posts = [], isLoading } = usePosts();

  const authorPosts = useMemo(
    () =>
      posts
        .filter((post) => post.authorId === authorId && isPostPublic(post))
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
    [posts, authorId]
  );
  const latest = authorPosts[0];
  const name = latest?.authorName || "Author";
  const totalLikes = authorPosts.reduce((sum, post) => sum + getLikeCount(post), 0);

  useDocumentMeta({
    title: latest ? `Posts by ${name}` : "Author",
    description: latest ? `Articles written by ${name}.` : undefined,
  });

  return (
    <div className="page-container pb-20">
      <header className="mx-auto flex max-w-3xl flex-col items-center pb-10 pt-4 text-center sm:pt-8">
        {isLoading ? (
          <div className="skeleton h-20 w-20 rounded-full" />
        ) : (
          <Avatar name={name} src={latest?.authorAvatar} size="xl" />
        )}
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{isLoading ? "…" : name}</h1>
        {!isLoading && authorPosts.length > 0 && (
          <p className="mt-2 text-base-content/65">
            {authorPosts.length} {authorPosts.length === 1 ? "post" : "posts"} · {totalLikes} likes
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <BlogPostSkeleton key={index} />
          ))}
        </div>
      ) : authorPosts.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={DocumentTextIcon}
            title="No published posts"
            description="This author hasn't published anything yet."
            action={
              <Link to="/blog" className="btn btn-primary">
                Browse the blog
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {authorPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
