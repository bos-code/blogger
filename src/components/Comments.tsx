import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { motion } from "framer-motion";

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: any;
}

export default function Comments({ postId }: { postId: string }): React.ReactElement {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const cs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setComments(cs as Comment[]);
    });
    return () => unsub();
  }, [postId]);

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }).format(date);
    } catch {
      return "Unknown time";
    }
  };

  const submit = async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!text.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        authorId: user.uid,
        authorName: user.name || "Anonymous",
        content: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 sm:mt-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-base-content">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {comments.length === 0 ? (
          <p className="text-base-content/60 text-sm sm:text-base text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-base-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-base-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-8 h-8 sm:w-10 sm:h-10">
                      <span className="text-xs sm:text-sm font-bold">
                        {c.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-base-content">
                      {c.authorName}
                    </div>
                    <div className="text-xs sm:text-sm text-base-content/60">
                      {formatDate(c.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm sm:text-base text-base-content ml-0 sm:ml-12 sm:ml-14">
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            className="input input-bordered flex-1 text-sm sm:text-base"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            minLength={1}
            maxLength={500}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary text-sm sm:text-base"
            type="submit"
            disabled={isSubmitting || !text.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                <span className="hidden sm:inline">Posting...</span>
              </>
            ) : (
              "Comment"
            )}
          </motion.button>
        </form>
      ) : (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span className="text-sm sm:text-base">
            Please{" "}
            <a href="/login" className="link link-primary font-semibold">
              login
            </a>{" "}
            to comment
          </span>
        </div>
      )}
    </div>
  );
}
