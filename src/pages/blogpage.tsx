import { usePosts } from "../hooks/usePosts";
import type { BlogPost } from "../types";

export default function Blog(): JSX.Element {
  const { data: posts = [], isLoading, error } = usePosts();

  if (isLoading) return <div className="p-6">Loading posts...</div>;
  if (error)
    return (
      <div className="p-6">Error loading posts: {(error as Error).message}</div>
    );

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
              <h2 className="text-xl text-[var(--color-primary)] font-semibold">
                {post.title}
              </h2>
              <p className="mt-2 text-[var(  --color-secondary-content)]">
                {post.content}
              </p>
            </div>
            <div className="divider"></div>
          </div>
        ))
      )}
    </div>
  );
}


