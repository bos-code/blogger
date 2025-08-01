// src/pages/Blog.jsx
import { useEffect } from "react";
import { useState } from "react";

export default function Blog({ bloglist }) {
  const [posts, setPosts] = useState([]);

 useEffect(() => {
    if (bloglist && bloglist.length > 0) {
      setPosts(bloglist);
    }
  }, [bloglist]);

  console.log("Posts in Blog component:", posts);

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
