import { useEffect, useMemo, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { usePost, usePosts, useDeletePost, useIncrementPostView } from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import Comments from "../components/Comments";
import ReadingProgressBar from "../components/ReadingProgressBar";
import TableOfContents from "../components/TableOfContents";
import ArticleBody from "../components/article/ArticleBody";
import PostActions from "../components/article/PostActions";
import BlogPostCard from "../components/BlogPostCard";
import SubscribeForm from "../components/SubscribeForm";
import Avatar from "../components/ui/Avatar";
import StatusBadge from "../components/ui/StatusBadge";
import { showDeleteConfirm, showError, showSuccess } from "../utils/sweetalert";
import { formatDate, isPostPublic, toTimestamp } from "../utils/date";
import { sanitizeRichText } from "../utils/sanitize";
import {
  addHeadingIds,
  getExcerpt,
  getReadingTime,
  postPath,
  slugify,
} from "../utils/posts";
import type { BlogPost } from "../types";

function PostSkeleton() {
  return (
    <div className="page-container max-w-3xl pb-20" aria-busy="true" aria-label="Loading post">
      <div className="skeleton mb-6 h-4 w-24" />
      <div className="skeleton mb-3 h-10 w-full" />
      <div className="skeleton mb-8 h-10 w-2/3" />
      <div className="skeleton mb-10 aspect-[2/1] w-full" />
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="skeleton mb-3 h-4 w-full" />
      ))}
    </div>
  );
}

const scoreRelated = (post: BlogPost, candidate: BlogPost): number => {
  let score = 0;
  if (post.category && candidate.category === post.category) score += 3;
  const tags = new Set(post.tags ?? []);
  for (const tag of candidate.tags ?? []) if (tags.has(tag)) score += 2;
  if (post.series && candidate.series === post.series) score += 4;
  return score;
};

export default function BlogPostDetail(): React.ReactElement {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { data: matchingPost, isLoading, error, refetch } = usePost(id);
  const { data: allPosts = [] } = usePosts();
  const deletePost = useDeletePost();
  const { mutate: incrementPostView } = useIncrementPostView();
  const trackedPostRef = useRef<string | null>(null);

  const isAdmin = role === "admin" || role === "super_admin";
  const isAuthor = Boolean(matchingPost && currentUser?.uid === matchingPost.authorId);
  const canSeePrivate = isAuthor || isAdmin;
  const post =
    matchingPost && (isPostPublic(matchingPost) || canSeePrivate) ? matchingPost : undefined;
  const isPreview = Boolean(post && !isPostPublic(post));

  const article = useMemo(
    () => addHeadingIds(sanitizeRichText(post?.content ?? "")),
    [post?.content]
  );

  const publicPosts = useMemo(() => allPosts.filter((p) => isPostPublic(p)), [allPosts]);

  const related = useMemo(() => {
    if (!post) return [];
    return publicPosts
      .filter((candidate) => candidate.id !== post.id)
      .map((candidate) => ({ candidate, score: scoreRelated(post, candidate) }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          toTimestamp(b.candidate.createdAt) - toTimestamp(a.candidate.createdAt)
      )
      .slice(0, 3)
      .map(({ candidate }) => candidate);
  }, [post, publicPosts]);

  const seriesPosts = useMemo(() => {
    if (!post?.series) return [];
    return publicPosts
      .filter((candidate) => candidate.series === post.series)
      .sort(
        (a, b) =>
          (a.seriesOrder ?? 999) - (b.seriesOrder ?? 999) ||
          toTimestamp(a.createdAt) - toTimestamp(b.createdAt)
      );
  }, [post, publicPosts]);

  const publishedAt = post ? post.scheduledFor ?? post.createdAt : undefined;
  const description = post ? post.seoDescription || getExcerpt(post, 160) : undefined;

  useDocumentMeta({
    title: post ? post.seoTitle || post.title : isLoading ? undefined : "Post not found",
    description,
    image: post?.coverImage,
    type: post ? "article" : "website",
    noIndex: !post || isPreview,
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description,
          image: post.coverImage ? [post.coverImage] : undefined,
          datePublished: publishedAt ? new Date(toTimestamp(publishedAt)).toISOString() : undefined,
          dateModified: post.updatedAt ? new Date(toTimestamp(post.updatedAt)).toISOString() : undefined,
          author: { "@type": "Person", name: post.authorName || "John Dera" },
          keywords: post.tags?.join(", "),
          mainEntityOfPage: window.location.origin + postPath(post),
        }
      : null,
  });

  useEffect(() => {
    if (!post || !id || isPreview) return;
    if (trackedPostRef.current === id) return;
    trackedPostRef.current = id;

    const sessionKey = `viewed-post:${id}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "true");
    } catch {
      // View tracking still works when storage is blocked by the browser.
    }

    incrementPostView(id);
  }, [id, post, isPreview, incrementPostView]);

  if (isLoading) return <PostSkeleton />;

  if (error) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">We couldn't load this post</h1>
        <p className="text-base-content/70">Check your connection and try again.</p>
        <button type="button" className="btn btn-primary" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-mono text-sm text-primary">404</p>
        <h1 className="text-3xl font-bold">Post not found</h1>
        <p className="text-base-content/70">It may have been unpublished or the link is wrong.</p>
        <Link to="/blog" className="btn btn-primary">
          Browse all posts
        </Link>
      </div>
    );
  }

  // Normalise the URL to the canonical slug.
  const canonicalSlug = slugify(post.title);
  if (canonicalSlug && slug !== canonicalSlug) {
    return <Navigate to={`${postPath(post)}${window.location.hash}`} replace />;
  }

  const handleDelete = () => {
    void showDeleteConfirm(post.title, async () => {
      try {
        await deletePost.mutateAsync(post.id);
        showSuccess("Post deleted");
        navigate("/blog", { replace: true });
      } catch {
        showError("Couldn't delete", "Please try again.");
      }
    });
  };

  const readingTime = getReadingTime(post);
  const seriesIndex = seriesPosts.findIndex((item) => item.id === post.id);

  return (
    <>
      <ReadingProgressBar />
      <div className="page-container pb-24">
        {isPreview && (
          <div role="status" className="alert alert-warning mx-auto mb-6 max-w-3xl">
            <span>
              Preview — this post is <StatusBadge status={post.status} /> and only visible to you
              {isAdmin && !isAuthor ? " and other admins" : ""}.
            </span>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_minmax(0,46rem)_1fr] lg:gap-10">
          {/* Left rail: actions */}
          <aside className="hidden lg:block" aria-label="Post actions">
            <div className="sticky top-28 flex justify-end">
              <PostActions post={post} layout="column" />
            </div>
          </aside>

          <article className="min-w-0">
            <Link to="/blog" className="btn btn-ghost btn-sm -ml-3 mb-6 gap-1.5">
              <ArrowLeftIcon className="h-4 w-4" />
              All posts
            </Link>

            <header className="mb-8">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                {post.category && (
                  <Link
                    to={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="font-semibold uppercase tracking-wide text-primary hover:underline"
                  >
                    {post.category}
                  </Link>
                )}
                {post.series && seriesIndex >= 0 && (
                  <span className="text-base-content/60">
                    · {post.series} — part {seriesIndex + 1} of {seriesPosts.length}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 text-lg text-base-content/70 sm:text-xl">{post.excerpt}</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-base-300 py-4">
                <Link to={`/author/${post.authorId}`} className="flex items-center gap-3 hover:text-primary">
                  <Avatar name={post.authorName} src={post.authorAvatar} size="lg" />
                  <span>
                    <span className="block font-semibold">{post.authorName || "Anonymous"}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
                      {publishedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                          <time>{formatDate(publishedAt, { month: "long", day: "numeric", year: "numeric" })}</time>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" aria-hidden="true" />
                        {readingTime} min read
                      </span>
                      {!isPreview && (
                        <span className="flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          {(post.views ?? 0).toLocaleString()} views
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
                {(isAuthor || isAdmin) && (
                  <div className="flex gap-2">
                    <Link to={`/edit/${post.id}`} className="btn btn-ghost btn-sm gap-1.5 border border-base-300">
                      <PencilSquareIcon className="h-4 w-4" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="btn btn-ghost btn-sm gap-1.5 text-error"
                      disabled={deletePost.isPending}
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </header>

            {post.coverImage && (
              <figure className="mb-10">
                <img
                  src={post.coverImage}
                  alt={post.coverImageAlt || ""}
                  className="aspect-[2/1] w-full rounded-2xl object-cover"
                  fetchPriority="high"
                />
              </figure>
            )}

            <TableOfContents headings={article.headings} variant="inline" />

            <ArticleBody html={article.html} />

            {post.tags && post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link to={`/blog?tag=${encodeURIComponent(tag)}`} className="badge badge-outline hover:badge-primary">
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile actions */}
            <div className="mt-8 flex justify-center border-y border-base-300 py-3 lg:hidden">
              <PostActions post={post} />
            </div>

            {seriesPosts.length > 1 && (
              <nav aria-label={`${post.series} series`} className="surface mt-10 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/55">Series</h2>
                <p className="mb-3 mt-1 text-lg font-semibold">{post.series}</p>
                <ol className="flex flex-col gap-1">
                  {seriesPosts.map((item, index) => (
                    <li key={item.id}>
                      {item.id === post.id ? (
                        <span className="flex gap-2 rounded-lg bg-primary/10 px-3 py-2 font-medium text-primary" aria-current="page">
                          <span className="tabular-nums">{index + 1}.</span> {item.title}
                        </span>
                      ) : (
                        <Link to={postPath(item)} className="flex gap-2 rounded-lg px-3 py-2 hover:bg-base-200">
                          <span className="tabular-nums text-base-content/55">{index + 1}.</span> {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <section className="surface mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <Avatar name={post.authorName} src={post.authorAvatar} size="xl" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-base-content/55">Written by</p>
                <p className="text-lg font-semibold">{post.authorName || "Anonymous"}</p>
                <Link to={`/author/${post.authorId}`} className="link link-primary text-sm">
                  More posts by this author
                </Link>
              </div>
            </section>

            <section className="surface mt-6 p-6">
              <h2 className="text-lg font-semibold">Enjoyed this post?</h2>
              <p className="mb-4 mt-1 text-sm text-base-content/70">
                Get new articles by email. No spam — unsubscribe any time.
              </p>
              <SubscribeForm />
            </section>

            <div className="mt-12">
              <Comments post={post} />
            </div>
          </article>

          {/* Right rail: table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents headings={article.headings} />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mx-auto mt-20 max-w-6xl">
            <h2 id="related-heading" className="mb-6 text-2xl font-bold">
              Keep reading
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogPostCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
