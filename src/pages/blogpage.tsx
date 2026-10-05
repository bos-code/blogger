import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon, RssIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { usePosts } from "../hooks/usePosts";
import BlogPostCard from "../components/BlogPostCard";
import BlogPostSkeleton from "../components/BlogPostSkeleton";
import ReadingProgressBar from "../components/ReadingProgressBar";
import SubscribeForm from "../components/SubscribeForm";
import EmptyState from "../components/ui/EmptyState";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isPostPublic, toTimestamp } from "../utils/date";
import { getLikeCount, htmlToText } from "../utils/posts";
import type { BlogPost } from "../types";

const PAGE_SIZE = 12;

const matchesQuery = (post: BlogPost, query: string): boolean => {
  if (!query) return true;
  const haystack = [
    post.title,
    post.excerpt ?? "",
    post.category ?? "",
    post.authorName ?? "",
    (post.tags ?? []).join(" "),
    htmlToText(post.content ?? "").slice(0, 3000),
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
};

export default function Blog(): React.ReactElement {
  const { data: posts = [], isLoading, error, refetch, isFetching } = usePosts();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const tag = params.get("tag") ?? "";
  const sortBy = params.get("sort") === "popular" ? "popular" : "newest";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [draftQuery, setDraftQuery] = useState(query);

  const heading = tag ? `#${tag}` : category ? category : "Blog";
  useDocumentMeta({
    title: tag ? `Posts tagged #${tag}` : category ? `${category} posts` : "Blog",
    description: "Articles on front-end development, React, TypeScript and building for the web.",
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  const publicPosts = useMemo(() => posts.filter((post) => isPostPublic(post)), [posts]);

  const categories = useMemo(
    () =>
      [...new Set(publicPosts.map((post) => post.category).filter(Boolean) as string[])].sort(),
    [publicPosts]
  );

  const filteredPosts = useMemo(() => {
    const list = publicPosts.filter(
      (post) =>
        (!category || post.category === category) &&
        (!tag || (post.tags ?? []).includes(tag)) &&
        matchesQuery(post, query)
    );
    return list.sort((a, b) => {
      if (sortBy === "popular") {
        const diff = getLikeCount(b) + (b.views ?? 0) / 10 - (getLikeCount(a) + (a.views ?? 0) / 10);
        if (diff !== 0) return diff;
      }
      return (
        toTimestamp(b.scheduledFor ?? b.createdAt) - toTimestamp(a.scheduledFor ?? a.createdAt)
      );
    });
  }, [publicPosts, category, tag, query, sortBy]);

  const hasFilters = Boolean(query || category || tag);
  const featured =
    !hasFilters && sortBy === "newest"
      ? (filteredPosts.find((post) => post.featured) ?? filteredPosts[0])
      : undefined;
  const rest = featured ? filteredPosts.filter((post) => post.id !== featured.id) : filteredPosts;
  const visible = rest.slice(0, visibleCount);

  return (
    <>
      <ReadingProgressBar />
      <div className="page-container pb-20">
        <header className="mx-auto max-w-3xl pb-10 pt-4 text-center sm:pt-8">
          <p className="font-mono text-sm text-primary">{tag || category ? "Browsing" : "Writing"}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{heading}</h1>
          <p className="mt-4 text-base-content/70 sm:text-lg">
            Notes on front-end development, React, TypeScript and building for the web.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <SubscribeForm compact />
            <a href="/rss.xml" className="btn btn-ghost btn-sm gap-1.5" aria-label="RSS feed">
              <RssIcon className="h-4 w-4" />
              RSS
            </a>
          </div>
        </header>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              updateParam("q", draftQuery.trim());
            }}
            className="flex gap-2"
          >
            <label className="input flex-1">
              <MagnifyingGlassIcon className="h-4 w-4 opacity-60" aria-hidden="true" />
              <input
                type="search"
                value={draftQuery}
                onChange={(event) => {
                  setDraftQuery(event.target.value);
                  if (!event.target.value) updateParam("q", "");
                }}
                placeholder="Search posts"
                aria-label="Search posts"
                className="grow"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <label htmlFor="blog-sort" className="sr-only">
              Sort posts
            </label>
            <select
              id="blog-sort"
              className="select w-36"
              value={sortBy}
              onChange={(event) => updateParam("sort", event.target.value === "newest" ? "" : event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
            </select>
          </form>

          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
              <button
                type="button"
                onClick={() => updateParam("category", "")}
                className={`btn btn-sm shrink-0 rounded-full ${!category ? "btn-primary" : "btn-ghost border border-base-300"}`}
                aria-pressed={!category}
              >
                All
              </button>
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => updateParam("category", category === name ? "" : name)}
                  className={`btn btn-sm shrink-0 rounded-full ${category === name ? "btn-primary" : "btn-ghost border border-base-300"}`}
                  aria-pressed={category === name}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {hasFilters && !isLoading && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
              <span>
                {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"}
              </span>
              {query && (
                <button type="button" className="badge badge-outline gap-1" onClick={() => { setDraftQuery(""); updateParam("q", ""); }}>
                  “{query}” <XMarkIcon className="h-3 w-3" aria-label="Clear search" />
                </button>
              )}
              {tag && (
                <button type="button" className="badge badge-outline gap-1" onClick={() => updateParam("tag", "")}>
                  #{tag} <XMarkIcon className="h-3 w-3" aria-label="Clear tag" />
                </button>
              )}
              <Link to="/blog" className="link link-primary text-sm" onClick={() => setDraftQuery("")}>
                Clear all
              </Link>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading posts">
            {Array.from({ length: 6 }, (_, index) => (
              <BlogPostSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="surface">
            <EmptyState
              icon={DocumentTextIcon}
              title="We couldn't load the posts"
              description="Check your connection and try again."
              action={
                <button type="button" className="btn btn-primary" onClick={() => void refetch()} disabled={isFetching}>
                  {isFetching ? "Retrying…" : "Try again"}
                </button>
              }
            />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={DocumentTextIcon}
              title={hasFilters ? "No posts match" : "No posts yet"}
              description={hasFilters ? "Try another search or category." : "Check back soon for new articles."}
              action={
                hasFilters ? (
                  <Link to="/blog" className="btn btn-ghost border border-base-300">
                    Show all posts
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <BlogPostCard post={featured} variant="featured" />
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
            {visibleCount < rest.length && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <button
                  type="button"
                  className="btn btn-ghost border border-base-300"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Load more posts
                </button>
                <p className="text-xs text-base-content/55">
                  Showing {visible.length + (featured ? 1 : 0)} of {filteredPosts.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
