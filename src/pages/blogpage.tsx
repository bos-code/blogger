import { usePosts } from "../hooks/usePosts";
import type { BlogPost } from "../types";
import { motion } from "framer-motion";
import BlogPostCard from "../components/BlogPostCard";
import PremiumSpinner from "../components/PremiumSpinner";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { useMemo, useState } from "react";

export default function Blog(): React.ReactElement {
  const { data: posts = [], isLoading, error } = usePosts();
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const approvedPosts = useMemo(
    () =>
      (posts as BlogPost[]).filter(
        (post) => post.status === "approved" || !post.status
      ),
    [posts]
  );

  const sortedPosts = useMemo(() => {
    return [...approvedPosts].sort((a, b) => {
      if (sortBy === "popular") {
        const aLikes = a.likedBy?.length ?? a.likes ?? 0;
        const bLikes = b.likedBy?.length ?? b.likes ?? 0;
        if (bLikes !== aLikes) return bLikes - aLikes;
      }

      const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
      const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
      return bTime - aTime;
    });
  }, [approvedPosts, sortBy]);

  const visiblePosts = sortedPosts.slice(0, visibleCount);

  // Show premium spinner while loading
  if (isLoading) {
    return (
      <>
        <ReadingProgressBar />
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <PremiumSpinner
            size="lg"
            variant="primary"
            text="Loading blog posts..."
            fullScreen={false}
            showParticles={true}
          />
        </div>
      </>
    );
  }

  // Error state (graceful public fallback)
  if (error) {
    const errMsg =
      (error as Error)?.message ||
      "Unable to load posts right now. Please try again shortly.";
    return (
      <>
        <ReadingProgressBar />
        <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl w-full space-y-4 p-6 sm:p-8 rounded-2xl shadow-2xl bg-base-100 border border-base-300"
          >
            <div className="flex items-start gap-3">
              <div className="badge badge-error badge-lg text-base-100">!</div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-base-content">
                  We hit a snag loading posts
                </h3>
                <p className="text-sm sm:text-base text-base-content/70">
                  {errMsg.includes("Firestore is not configured")
                    ? "Blog data requires Firebase credentials. Add your .env values and refresh."
                    : errMsg}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
              <button
                className="btn btn-outline"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <ReadingProgressBar />
      <div className="min-h-screen bg-base-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-6 sm:pb-8 md:pb-12 lg:pb-16 xl:pb-20">
          {/* Hero Section with Custom SectionHead - No Top Spacing */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 sm:mb-8 md:mb-10"
          >
            {/* Custom SectionHead for Blog Page - No Scroll, No Top Spacing */}
            <div className="text-center flex flex-col items-center gap-2 sm:gap-3">
              <div className="textbox flex flex-col gap-1 sm:gap-2">
                <motion.h2
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[72px] border-b-2 border-primary inline-block self-center indicator relative"
                >
                  Blogs
                  <span className="indicator-item status status-primary indicator-bottom"></span>
                  <span className="indicator-item status status-primary indicator-bottom -left-3 bg-primary text-transparent"></span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-sm sm:text-base ibm-plex-mono px-4 text-base-content/70"
                >
                  My thoughts on technology and business, welcome to subscribe
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-3 sm:mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline btn-primary border-2 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base lg:text-lg font-medium transition-all duration-300 hover:bg-primary hover:text-primary-content"
              >
                Subscribe My Blogs
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Sort & controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-between flex-wrap gap-3 mb-6"
          >
            <div className="text-sm sm:text-base text-base-content/70">
              Showing {visiblePosts.length} of {approvedPosts.length} posts
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70">Sort by</label>
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "popular")}
              >
                <option value="newest">Newest</option>
                <option value="popular">Most liked</option>
              </select>
            </div>
          </motion.div>

          {/* Posts List - Vertical Stack */}
          {approvedPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-10 sm:py-12 md:py-16 lg:py-20"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-base-100 rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 max-w-md mx-auto"
              >
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 text-base-content/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-base-content">
                  No posts yet
                </h2>
                <p className="text-base-content/70 text-xs sm:text-sm md:text-base">
                  Check back later for new content!
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-0">
              {visiblePosts.map((post, index) => {
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <BlogPostCard post={post} index={index} />
                    {index < visiblePosts.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
                        className="divider my-5 sm:my-6 md:my-8 lg:my-10"
                      ></motion.div>
                    )}
                  </motion.div>
                );
              })}
              {visibleCount < approvedPosts.length && (
                <div className="flex justify-center mt-8">
                  <button
                    className="btn btn-outline btn-primary"
                    onClick={() => setVisibleCount((c) => c + 10)}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
