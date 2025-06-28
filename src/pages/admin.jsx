// pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { db } from "../firebaseconfig";
import { addDoc, collection } from "firebase/firestore";
import { auth } from "../firebaseconfig";

import { doc, getDoc } from "firebase/firestore";


 const checkAdmin = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  console.log(`Checking admin status for user ${uid}:`, userDoc.exists(), userDoc.data());
  return userDoc.exists() && userDoc.data().role == "admin";
};

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      checkAdmin(user.uid).then(setIsAdmin);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "posts"), {
      title,
      content,
      createdAt: new Date(),
      approved: true, // or false if you want admin approval later
    });
    setTitle("");
    setContent("");
  };

  if (!isAdmin) return <p>Access denied. Admins only.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-4"
      />
      <textarea
        placeholder="Write your blog post here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="textarea textarea-bordered w-full h-40 mb-4"
      ></textarea>
      <button type="submit" className="btn btn-primary">Publish</button>
    </form>
  );
}
