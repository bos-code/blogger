// src/pages/Blog.jsx
import { useEffect, useState } from "react";
import { db } from "../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const postSnapshot = await getDocs(collection(db, "posts"));
      const postList = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postList);
    }

    fetchPosts();
  }, []);

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
