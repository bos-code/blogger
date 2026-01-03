import SectionHead from "./sectionHead";
import { usePosts } from "../hooks/usePosts";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BlogPostCard from "./BlogPostCard";
import PremiumSpinner from "./PremiumSpinner";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { BlogPost } from "../types";

function SectionBlog(): React.ReactElement {
  const { data: posts = [], isLoading } = usePosts();

  // Filter approved posts and sort by date (newest first)
  const approvedPosts = posts
    .filter((post: BlogPost) => post.status === "approved")
    .sort((a: BlogPost, b: BlogPost) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 3); // Show only latest 3 posts

  return (
    <section
      id="blog"
      data-section
      data-section-title="Blog"
      className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24"
    >
      <SectionHead
        title={"Blogs"}
        descript={
          "My thoughts on technology and business, welcome to subscribe"
        }
      />

      {/* Latest Blog Posts */}
      <div className="mt-8 sm:mt-12 md:mt-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <PremiumSpinner size="md" text="Loading latest posts..." />
          </div>
        ) : approvedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base-content/70 text-lg">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              {approvedPosts.map((post: BlogPost, index: number) => (
                <BlogPostCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {/* See More Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center mt-8 sm:mt-12 md:mt-16"
            >
              <Link
                to="/blogpage"
                className="btn btn-primary btn-lg gap-2 group"
              >
                <span>See More Blogs</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

export default SectionBlog;
