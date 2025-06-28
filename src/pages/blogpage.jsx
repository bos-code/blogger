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
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card bg-base-100 shadow mb-4 p-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2">{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
