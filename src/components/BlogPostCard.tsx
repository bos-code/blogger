import { Link } from "react-router-dom";
import { HeartIcon, ClockIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useLikePost } from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import { formatDate } from "../utils/date";
import { getExcerpt, getLikeCount, getReadingTime, postPath } from "../utils/posts";
import { showToast } from "../utils/sweetalert";
import Avatar from "./ui/Avatar";
import type { BlogPost } from "../types";

interface BlogPostCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
  /** Kept for backwards compatibility with older callers. */
  index?: number;
}

/** Like button shared by cards and the article page. */
export function LikeButton({
  post,
  size = "sm",
}: {
  post: BlogPost;
  size?: "sm" | "md";
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);
  const likePost = useLikePost();
  const likedBy = post.likedBy ?? [];
  const likeCount = getLikeCount(post);
  const isLiked = Boolean(user?.uid && likedBy.includes(user.uid));

  const handleLike = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      void showToast("info", "Sign in to like posts");
      return;
    }
    if (!emailVerified) {
      void showToast("info", "Verify your email to like posts");
      return;
    }
    likePost.mutate({ postId: post.id, currentLikedBy: likedBy });
  };

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={likePost.isPending}
      aria-pressed={isLiked}
      aria-label={`${isLiked ? "Unlike" : "Like"} "${post.title}" (${likeCount} likes)`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors ${
        isLiked
          ? "bg-error/10 text-error hover:bg-error/20"
          : "text-base-content/65 hover:bg-base-200 hover:text-base-content"
      }`}
    >
      {isLiked ? <HeartIconSolid className={iconSize} /> : <HeartIcon className={iconSize} />}
      <span className="tabular-nums">{likeCount}</span>
    </button>
  );
}

export default function BlogPostCard({
  post,
  variant = "default",
}: BlogPostCardProps): React.ReactElement {
  const href = postPath(post);
  const readingTime = getReadingTime(post);
  const date = formatDate(post.scheduledFor ?? post.createdAt);
  const isFeatured = variant === "featured";

  if (variant === "compact") {
    return (
      <article className="group flex gap-4">
        {post.coverImage && (
          <Link to={href} className="shrink-0" tabIndex={-1} aria-hidden="true">
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-20 w-28 rounded-lg object-cover"
            />
          </Link>
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
            <Link to={href}>{post.title}</Link>
          </h3>
          <p className="mt-1 text-xs text-base-content/60">
            {date} · {readingTime} min read
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`surface group relative flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg ${
        isFeatured ? "md:flex-row" : ""
      }`}
    >
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className={`block shrink-0 overflow-hidden bg-base-200 ${
          isFeatured ? "aspect-[16/9] md:aspect-auto md:w-1/2" : "aspect-[16/9]"
        }`}
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-base-200 to-secondary/20">
            <span className="font-mono text-3xl font-bold text-primary/70">{"</>"}</span>
          </div>
        )}
      </Link>

      <div className={`flex flex-1 flex-col p-5 ${isFeatured ? "md:p-8" : ""}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {isFeatured && <span className="badge badge-primary badge-sm">Featured</span>}
          {post.category && (
            <Link
              to={`/blog?category=${encodeURIComponent(post.category)}`}
              className="font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              {post.category}
            </Link>
          )}
        </div>

        <h3
          className={`font-bold leading-snug text-base-content ${
            isFeatured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          <Link to={href} className="hover:text-primary focus-visible:text-primary">
            {post.title}
          </Link>
        </h3>

        <p
          className={`mt-2 text-base-content/70 ${
            isFeatured ? "line-clamp-4 md:text-lg" : "line-clamp-3 text-sm"
          }`}
        >
          {getExcerpt(post)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            to={`/author/${post.authorId}`}
            className="flex min-w-0 items-center gap-2 text-sm hover:text-primary"
          >
            <Avatar name={post.authorName} src={post.authorAvatar} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium">{post.authorName || "Anonymous"}</span>
              <span className="flex items-center gap-1 text-xs text-base-content/60">
                {date && <time>{date}</time>}
                {date && <span aria-hidden="true">·</span>}
                <ClockIcon className="h-3 w-3" aria-hidden="true" />
                {readingTime} min
              </span>
            </span>
          </Link>
          <LikeButton post={post} />
        </div>
      </div>
    </article>
  );
}
