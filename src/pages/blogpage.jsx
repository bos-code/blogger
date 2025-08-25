// src/pages/Blog.jsx
import { useEffect } from "react";
import { useState } from "react";
import { useBlog } from "../components/BlogContext";

export default function Blog() {
  const { blogList } = useBlog()
  const [posts, setPosts] = useState([]);

 useEffect(() => {
    if (blogList && blogList.length > 0) {
      setPosts(blogList);
    }
  }, [blogList]);

  console.log("Posts in Blog component:", blogList);

  return (
    <div className="p-6">
      <h1 className=" page-heading text-3xl font-bold mb-4 ">Blogs</h1>
      <div className="divider"></div>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
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
