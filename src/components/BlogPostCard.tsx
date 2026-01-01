import { motion } from "framer-motion";
import type { BlogPost } from "../types";
import { Link } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useLikePost } from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogPostCard({ post, index }: BlogPostCardProps): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const likePost = useLikePost();
  
  // Calculate like count from likedBy array or fallback to likes field
  const likedBy = post.likedBy || [];
  const likeCount = likedBy.length || post.likes || 0;
  const isLiked = user?.uid ? likedBy.includes(user.uid) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.uid) {
      return; // Could show a toast here to prompt login
    }

    likePost.mutate({
      postId: post.id,
      currentLikedBy: likedBy,
    });
  };
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown date";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return "Unknown date";
    }
  };

  const calculateReadingTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordsPerMinute = 200;
    return Math.ceil(words.length / wordsPerMinute) || 1;
  };

  const readingTime = post.readingTime || calculateReadingTime(post.content);
  const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...";

  // Format date for metadata display
  const formatMetadataDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown date";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return "Unknown date";
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 transition-all duration-300"
    >
      {/* Cover Image */}
      {post.coverImage && (
        <motion.figure
          whileHover={{ scale: 1.02 }}
          className="relative w-full sm:w-56 md:w-64 lg:w-72 xl:w-80 h-40 xs:h-48 sm:h-56 md:h-64 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </motion.figure>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title */}
        <motion.h2
          whileHover={{ x: 4 }}
          className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary leading-tight group-hover:text-primary/80 transition-colors duration-300"
        >
          <Link to={`/blog/${post.id}`} className="hover:underline inline-block">
            {post.title}
          </Link>
        </motion.h2>

        {/* Excerpt */}
        <p className="text-base-content/80 text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3">
          {excerpt}
        </p>

        {/* Read More Link and Like Button */}
        <div className="mb-3 sm:mb-4 md:mb-6 flex items-center justify-between gap-3 sm:gap-4">
          <Link
            to={`/blog/${post.id}`}
            className="text-primary hover:text-primary/80 font-medium text-xs xs:text-sm sm:text-base inline-flex items-center gap-1 group/link transition-colors duration-300"
          >
            Read More
            <motion.span
              whileHover={{ x: 4 }}
              className="inline-block transition-transform duration-300"
            >
              {" >>"}
            </motion.span>
          </Link>
          
          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: isLiked ? 0 : 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            disabled={likePost.isPending || !user?.uid}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
              isLiked 
                ? "bg-error/10 text-error hover:bg-error/20 shadow-sm" 
                : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
            } ${likePost.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isLiked ? (
                <HeartIconSolid className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.div>
            {likeCount > 0 && (
              <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
            )}
          </motion.button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 xs:gap-3 sm:gap-4 text-[10px] xs:text-xs sm:text-sm text-base-content/70 mt-auto">
          {post.category && (
            <span className="font-medium text-base-content px-2 py-0.5 rounded bg-base-200">{post.category}</span>
          )}
          <span className="text-base-content/60">Text</span>
          <span className="font-medium">{post.authorName || "Anonymous"}</span>
          {post.createdAt && (
            <>
              <span className="text-base-content/60">Date</span>
              <span>{formatMetadataDate(post.createdAt)}</span>
            </>
          )}
          <span className="text-base-content/60">Read</span>
          <span>{readingTime} Min</span>
        </div>
      </div>
    </motion.article>
  );
}

