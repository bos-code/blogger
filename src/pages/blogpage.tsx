import { usePosts } from "../hooks/usePosts";
import type { BlogPost } from "../types";
import { motion } from "framer-motion";
import BlogPostCard from "../components/BlogPostCard";
import PremiumSpinner from "../components/PremiumSpinner";
import ReadingProgressBar from "../components/ReadingProgressBar";

export default function Blog(): React.ReactElement {
  const { data: posts = [], isLoading, error } = usePosts();

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

  // Error state
  if (error) {
    return (
      <>
        <ReadingProgressBar />
        <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="alert alert-error max-w-md sm:max-w-lg shadow-2xl rounded-2xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Error loading posts</h3>
              <div className="text-xs sm:text-sm">{(error as Error).message}</div>
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

          {/* Posts List - Vertical Stack */}
          {posts.length === 0 ? (
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
              {(posts as BlogPost[])
                .filter((post) => post.status === "approved" || !post.status)
                .map((post, index) => {
                  const filteredPosts = (posts as BlogPost[]).filter(
                    (p) => p.status === "approved" || !p.status
                  );
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <BlogPostCard post={post} index={index} />
                      {index < filteredPosts.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                          className="divider my-5 sm:my-6 md:my-8 lg:my-10"
                        ></motion.div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
