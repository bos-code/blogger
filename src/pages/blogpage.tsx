import { usePosts, useUpdatePost, useDeletePost } from "../hooks/usePosts";
import type { BlogPost } from "../types";
import { useAuthStore } from "../stores/authStore";
import Comments from "../components/Comments";

export default function Blog(): JSX.Element {
  const { data: posts = [], isLoading, error } = usePosts();

  if (isLoading) return <div className="p-6">Loading posts...</div>;
  if (error)
    return (
      <div className="p-6">Error loading posts: {(error as Error).message}</div>
    );

  const currentUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  return (
    <div className="p-6">
      <h1 className=" page-heading text-3xl font-bold mb-4 ">Blogs</h1>
      <div className="divider"></div>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        (posts as BlogPost[]).map((post) => (
          <div key={post.id}>
            <div className="card bg-base-100 shadow mb-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl text-[var(--color-primary)] font-semibold">
                    {post.title}
                  </h2>
                  <div className="text-sm text-muted">By {post.authorName}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      updatePost.mutate({ id: post.id, data: { likes: (post.likes || 0) + 1 } })
                    }
                  >
                    👍 {post.likes || 0}
                  </button>

                  {(currentUser?.uid === post.authorId || role === "admin") && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          deletePost.mutate(post.id)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-2 prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

              <Comments postId={post.id} />
            </div>
            <div className="divider"></div>
          </div>
        ))
      )}
    </div>
  );
}



