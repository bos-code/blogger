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

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: any;
}

export default function Comments({ postId }: { postId: string }): JSX.Element {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
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

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        authorId: user?.uid || "anonymous",
        authorName: user?.name || "Anonymous",
        content: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="p-2 border rounded">
            <div className="text-sm font-semibold">{c.authorName}</div>
            <div className="text-sm">{c.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          className="input input-sm flex-1"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-sm" type="submit">
          Comment
        </button>
      </form>
    </div>
  );
}
