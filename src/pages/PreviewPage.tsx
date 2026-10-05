import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../services/api";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import ArticleBody from "../components/article/ArticleBody";
import TableOfContents from "../components/TableOfContents";
import Avatar from "../components/ui/Avatar";
import { sanitizeRichText } from "../utils/sanitize";
import { addHeadingIds, calculateReadingTime } from "../utils/posts";
import type { BlogPost } from "../types";

/** Read-only view of an unpublished post opened from a secret preview link. */
export default function PreviewPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["preview", id, token],
    queryFn: () =>
      apiRequest<BlogPost>(`preview?id=${encodeURIComponent(id ?? "")}&token=${encodeURIComponent(token)}`, {
        method: "GET",
      }),
    retry: false,
  });

  useDocumentMeta({ title: post ? `Preview: ${post.title}` : "Draft preview", noIndex: true });
  const article = useMemo(() => addHeadingIds(sanitizeRichText(post?.content ?? "")), [post?.content]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" aria-label="Loading preview" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Preview unavailable</h1>
        <p className="text-base-content/70">{error instanceof Error ? error.message : "This link is invalid or was revoked."}</p>
        <Link to="/blog" className="btn btn-primary">Go to the blog</Link>
      </div>
    );
  }

  return (
    <article className="page-container max-w-3xl pb-20">
      <div role="status" className="alert alert-info mb-8">
        Draft preview — this post isn't published yet. Please don't share this link publicly.
      </div>
      {post.category && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{post.category}</p>}
      <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
      {post.excerpt && <p className="mt-4 text-lg text-base-content/70">{post.excerpt}</p>}
      <div className="mb-8 mt-6 flex items-center gap-3 border-y border-base-300 py-4 text-sm text-base-content/70">
        <Avatar name={post.authorName} src={post.authorAvatar} size="md" />
        <span className="font-medium text-base-content">{post.authorName || "Anonymous"}</span>
        <span aria-hidden="true">·</span>
        <span>{calculateReadingTime(post.content)} min read</span>
      </div>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.coverImageAlt ?? ""} className="mb-10 aspect-[2/1] w-full rounded-2xl object-cover" />
      )}
      <TableOfContents headings={article.headings} variant="inline" />
      <ArticleBody html={article.html} />
    </article>
  );
}
