import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { createNotification } from "./useNotifications";
import type { Comment } from "../types";

export const COMMENT_MAX_LENGTH = 500;

/** Live comments for a post, oldest first. */
export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      ),
      (snapshot) => {
        setComments(
          snapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...(commentDoc.data() as Omit<Comment, "id">),
          }))
        );
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Comments couldn't be loaded right now.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [postId]);

  return { comments, loading, error };
};

export const useCommentActions = (post: { id: string; title: string; authorId: string }) => {
  const user = useAuthStore((state) => state.user);

  const addComment = async (content: string, parent?: Comment | null) => {
    if (!user) throw new Error("Sign in to comment.");
    const text = content.trim();
    if (!text) throw new Error("Write something first.");
    if (text.length > COMMENT_MAX_LENGTH) {
      throw new Error(`Comments can be at most ${COMMENT_MAX_LENGTH} characters.`);
    }
    await addDoc(collection(db, "comments"), {
      postId: post.id,
      authorId: user.uid,
      authorName: user.nickname || user.name || "Anonymous",
      authorAvatar: user.photoURL || null,
      content: text,
      parentId: parent?.id ?? null,
      createdAt: serverTimestamp(),
    });

    const author = user.nickname || user.name || "Someone";
    const recipients = new Set<string>();
    if (post.authorId && post.authorId !== user.uid) recipients.add(post.authorId);
    if (parent && parent.authorId !== user.uid) recipients.add(parent.authorId);
    for (const recipient of recipients) {
      void createNotification({
        userId: recipient,
        type: "comment",
        message:
          parent && recipient === parent.authorId
            ? `${author} replied to your comment on "${post.title}"`
            : `${author} commented on "${post.title}"`,
        blogId: post.id,
      });
    }
  };

  const editComment = async (comment: Comment, content: string) => {
    const text = content.trim();
    if (!text) throw new Error("Comments can't be empty.");
    if (text.length > COMMENT_MAX_LENGTH) {
      throw new Error(`Comments can be at most ${COMMENT_MAX_LENGTH} characters.`);
    }
    await updateDoc(doc(db, "comments", comment.id), {
      content: text,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteComment = async (comment: Comment) => {
    await deleteDoc(doc(db, "comments", comment.id));
  };

  return { addComment, editComment, deleteComment };
};
