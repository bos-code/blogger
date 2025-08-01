// pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { db } from "../firebaseconfig";
import { addDoc, collection } from "firebase/firestore";
import { auth } from "../firebaseconfig";

import { doc, getDoc } from "firebase/firestore";

const checkAdmin = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));

  return userDoc.exists() && userDoc.data().role == "admin";
};


export default function AdminPanel({ user, role }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");



  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "posts"), {
      title,
      content,
      createdAt: new Date(),
      approved: true,
    });
    setTitle("");
    setContent("");
  };

  

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p>welcome {user?.name} ur role is {role}</p>
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
      <button type="submit" className="btn btn-primary">
        Publish
      </button>
    </form>
  );
}
