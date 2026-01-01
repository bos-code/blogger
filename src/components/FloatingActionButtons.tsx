import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolidFill,
  BookmarkIcon as BookmarkIconSolidFill,
} from "@heroicons/react/24/solid";
import { useLikePost } from "../hooks/usePosts";
import { useAuthStore } from "../stores/authStore";
import type { BlogPost } from "../types";

interface FloatingActionButtonsProps {
  post: BlogPost;
}

export default function FloatingActionButtons({
  post,
}: FloatingActionButtonsProps): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const likePost = useLikePost();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  // Calculate like count from likedBy array or fallback to likes field
  const likedBy = post.likedBy || [];
  const likeCount = likedBy.length || post.likes || 0;
  const isLiked = user?.uid ? likedBy.includes(user.uid) : false;

  const handleLike = (): void => {
    if (!user?.uid) {
      return; // Could show a toast here to prompt login
    }

    likePost.mutate({
      postId: post.id,
      currentLikedBy: likedBy,
    });
  };

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowShareMenu(false);
      // You could show a toast notification here
    }
  };

  const handleCopyLink = (): void => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="mb-3 bg-base-100 rounded-2xl shadow-2xl p-2 flex flex-col gap-2"
          >
            <button
              onClick={handleShare}
              className="btn btn-ghost btn-sm justify-start gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleCopyLink}
              className="btn btn-ghost btn-sm justify-start gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        disabled={likePost.isPending || !user?.uid}
        className={`btn btn-circle shadow-lg w-14 h-14 sm:w-16 sm:h-16 ${
          isLiked ? "btn-error" : "btn-primary"
        } ${likePost.isPending ? "loading" : ""}`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        {isLiked ? (
          <HeartIconSolidFill className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <HeartIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        )}
        {likeCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-error-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {likeCount}
          </span>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsBookmarked(!isBookmarked)}
        className={`btn btn-circle shadow-lg w-14 h-14 sm:w-16 sm:h-16 ${
          isBookmarked ? "btn-primary" : "btn-base-100"
        }`}
        aria-label="Bookmark"
      >
        {isBookmarked ? (
          <BookmarkIconSolidFill className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <BookmarkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="btn btn-circle btn-base-100 shadow-lg w-14 h-14 sm:w-16 sm:h-16"
        aria-label="Share"
      >
        <ShareIcon className="w-6 h-6 sm:w-7 sm:h-7" />
      </motion.button>
    </div>
  );
}

