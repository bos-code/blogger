import { useParams, useNavigate } from "react-router-dom";
import { usePosts, useDeletePost } from "../hooks/usePosts";
import type { BlogPost } from "../types";
import { useAuthStore } from "../stores/authStore";
import Comments from "../components/Comments";
import { motion } from "framer-motion";
import {
  TrashIcon,
  CalendarIcon,
  EyeIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";
import ReadingProgressBar from "../components/ReadingProgressBar";
import FloatingActionButtons from "../components/FloatingActionButtons";
import TableOfContents from "../components/TableOfContents";
import PremiumSpinner from "../components/PremiumSpinner";
import { useUpdatePost } from "../hooks/usePosts";
import { showDeleteConfirm, showSuccess } from "../utils/sweetalert";

export default function BlogPostDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = usePosts();
  const currentUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const post = posts.find((p) => p.id === id) as BlogPost | undefined;

  useEffect(() => {
    // Track views
    if (post && id) {
      updatePost.mutate({
        id,
        data: { views: (post.views || 0) + 1 },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, post?.id]);

  const handleDelete = (): void => {
    if (!post) return;
    // Use SweetAlert instead of window.confirm
    showDeleteConfirm(post.title, () => {
      deletePost.mutate(post.id);
      showSuccess(
        "Post Deleted",
        "The blog post has been deleted successfully!"
      );
      navigate("/blogpage");
    });
  };

  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return "Unknown date";
    try {
      let date: Date;
      if (
        typeof timestamp === "object" &&
        timestamp !== null &&
        "toDate" in timestamp &&
        typeof (timestamp as { toDate: () => Date }).toDate === "function"
      ) {
        date = (timestamp as { toDate: () => Date }).toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        date = new Date(timestamp);
      } else {
        return "Unknown date";
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return "Unknown date";
    }
  };

  const calculateReadingTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordsPerMinute = 200;
    return Math.ceil(words.length / wordsPerMinute) || 1;
  };

  if (isLoading) {
    return (
      <>
        <ReadingProgressBar />
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <PremiumSpinner
            size="lg"
            variant="primary"
            text="Loading post..."
            fullScreen={false}
            showParticles={true}
          />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <ReadingProgressBar />
        <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-base-content">
              Post not found
            </h2>
            <button
              onClick={() => navigate("/blogpage")}
              className="btn btn-primary"
            >
              Back to Blogs
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  const readingTime = post.readingTime || calculateReadingTime(post.content);

  return (
    <>
      <ReadingProgressBar />
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/blogpage")}
            className="btn btn-ghost mb-6 sm:mb-8 gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Blogs</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8"
            >
              <div className="card bg-base-100 shadow-xl rounded-2xl overflow-hidden">
                {/* Cover Image */}
                {post.coverImage && (
                  <figure className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.category && (
                      <div className="absolute top-4 left-4">
                        <span className="badge badge-primary badge-lg">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </figure>
                )}

                <div className="card-body p-6 sm:p-8 lg:p-10">
                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-base-content mb-4 sm:mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Author & Meta Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-base-300">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="avatar">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-content flex items-center justify-center">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName || "Author"}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg sm:text-xl font-bold">
                              {post.authorName && post.authorName.length > 0
                                ? post.authorName.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-base sm:text-lg text-base-content">
                          {post.authorName || "Anonymous"}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-base-content/70">
                          {post.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            <span>{readingTime} min read</span>
                          </div>
                          {post.views !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <EyeIcon className="w-4 h-4" />
                              <span>{post.views} views</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {(currentUser?.uid === post.authorId ||
                      role === "admin") && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        className="btn btn-error btn-sm sm:btn-md gap-2"
                        aria-label="Delete post"
                      >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Delete</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Technical Stack */}
                  {post.technicalStack && post.technicalStack.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-sm sm:text-base font-semibold text-base-content/70 mb-3">
                        Technical Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {post.technicalStack.map((tech, i) => (
                          <span
                            key={i}
                            className="badge badge-secondary badge-md sm:badge-lg"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="badge badge-outline badge-md sm:badge-lg"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post Content - Blog-first typography */}
                  <div
                    className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none 
                      prose-headings:text-base-content prose-headings:font-bold
                      prose-p:text-base-content prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg
                      prose-strong:text-base-content prose-strong:font-bold
                      prose-code:text-primary prose-code:bg-base-300 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-base-300 prose-pre:text-base-content
                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl prose-img:shadow-lg
                      prose-ul:text-base-content prose-ol:text-base-content
                      prose-li:marker:text-primary
                      prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                      prose-h1:mt-8 prose-h2:mt-6 prose-h3:mt-4
                      prose-h1:mb-4 prose-h2:mb-3 prose-h3:mb-2"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Comments Section */}
                  <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-base-300">
                    <Comments postId={post.id} />
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-4">
              <TableOfContents content={post.content} />
            </aside>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons post={post} />
    </>
  );
}
