import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import SectionHead from "./sectionHead";
import BlogPostCard from "./BlogPostCard";
import BlogPostSkeleton from "./BlogPostSkeleton";
import { usePosts } from "../hooks/usePosts";
import { isPostPublic, toTimestamp } from "../utils/date";

function SectionBlog(): React.ReactElement {
  const { data: posts = [], isLoading, error } = usePosts();

  const published = posts
    .filter((post) => isPostPublic(post))
    .sort((a, b) => toTimestamp(b.scheduledFor ?? b.createdAt) - toTimestamp(a.scheduledFor ?? a.createdAt));
  const featured = published.find((post) => post.featured);
  const latest = published.filter((post) => post.id !== featured?.id).slice(0, 3);

  return (
    <section id="blog" aria-labelledby="blog-heading" className="py-20 sm:py-24">
      <div className="page-container">
        <SectionHead
          id="blog-heading"
          eyebrow="Blog"
          title="Latest writing"
          descript="Notes on front-end development and things I'm learning."
        />

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <BlogPostSkeleton key={index} />
            ))}
          </div>
        ) : error || published.length === 0 ? (
          <p className="text-center text-base-content/65">
            {error ? "Posts couldn't be loaded right now." : "No posts yet — check back soon."}
          </p>
        ) : (
          <>
            {featured && (
              <div className="mb-6">
                <BlogPostCard post={featured} variant="featured" />
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/blog" className="btn btn-ghost gap-2 border border-base-300">
                Read all posts <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default SectionBlog;
