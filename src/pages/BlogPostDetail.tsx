import { useParams, useNavigate } from "react-router-dom";
import { usePosts, useAllPosts, useDeletePost } from "../hooks/usePosts";
import type { BlogPost } from "../types";
import { useAuthStore } from "../stores/authStore";
import Comments from "../components/Comments";
import { motion } from "framer-motion";
import { TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import ReadingProgressBar from "../components/ReadingProgressBar";
import FloatingActionButtons from "../components/FloatingActionButtons";
import TableOfContents from "../components/TableOfContents";
import BlogPostSkeleton from "../components/BlogPostSkeleton";
import { useUpdatePost } from "../hooks/usePosts";
import { showDeleteConfirm, showSuccess } from "../utils/sweetalert";

export default function BlogPostDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";

  // Use filtered posts for non-admins (only approved), all posts for admins
  const filteredPostsQuery = usePosts();
  const allPostsQuery = useAllPosts();
  const postsQuery = isAdmin ? allPostsQuery : filteredPostsQuery;
  const { data: posts = [], isLoading } = postsQuery;

  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const post = posts.find((p) => p.id === id) as BlogPost | undefined;

  // Strict check: Only admins can see unapproved posts, non-admins only see approved posts
  const isPostAccessible =
    post && (isAdmin ? true : post.status === "approved");

  useEffect(() => {
    // Track views
    if (post && id) {
      updatePost.mutate({
        id,
        data: { views: (post.views || 0) + 1 },
      });
    }
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
        <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <BlogPostSkeleton />
          </div>
        </div>
      </>
    );
  }

  if (!post || !isPostAccessible) {
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
              {!post ? "Post not found" : "Post not available"}
            </h2>
            <p className="text-base-content/70 mb-6">
              {!post
                ? "The post you're looking for doesn't exist."
                : "This post is pending approval and is not yet available."}
            </p>
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

  // Format date for metadata display (matching reference design)
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
    <>
      <ReadingProgressBar />
      <div className="min-h-screen bg-base-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/blogpage")}
            className="btn btn-ghost mb-6 sm:mb-8 gap-2 text-base-content/70 hover:text-base-content"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Blogs</span>
          </motion.button>

          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-base-100 rounded-2xl overflow-hidden">
              {/* Title - Large, centered, primary color */}
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Metadata - Format: Text Author | Date | Read X Min */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base text-base-content/70 mb-4 sm:mb-6">
                  <span>Text {post.authorName || "Anonymous"}</span>
                  <span className="text-base-content/40">|</span>
                  {post.createdAt && (
                    <>
                      <span>Date {formatMetadataDate(post.createdAt)}</span>
                      <span className="text-base-content/40">|</span>
                    </>
                  )}
                  <span>Read {readingTime} Min</span>
                </div>
              </div>

              {/* Cover Image */}
              {post.coverImage && (
                <figure className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] mb-8 sm:mb-10 md:mb-12 overflow-hidden rounded-xl">
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

              <div className="px-0 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-10 md:pb-12">
                {/* Admin/Author Actions */}
                {(currentUser?.uid === post.authorId || role === "admin") && (
                  <div className="mb-6 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="btn btn-error btn-sm gap-2"
                      aria-label="Delete post"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                )}

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
          <aside className="mt-8 lg:mt-0">
            <TableOfContents content={post.content} />
          </aside>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons post={post} />
    </>
  );
}
