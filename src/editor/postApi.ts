import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { toTimestamp } from "../utils/date";
import type { BlogPost, PostRevision, PostStatus, User } from "../types";

/** Fields the editor owns. Author, likes and views are never written from here. */
export interface EditorFields {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  scheduledAt: string; // datetime-local value
  seoTitle: string;
  seoDescription: string;
  series: string;
  seriesOrder: string;
}

export const EMPTY_FIELDS: EditorFields = {
  title: "",
  content: "",
  excerpt: "",
  category: "",
  tags: [],
  coverImage: "",
  coverImageAlt: "",
  scheduledAt: "",
  seoTitle: "",
  seoDescription: "",
  series: "",
  seriesOrder: "",
};

export const toPostData = (fields: EditorFields) => {
  const scheduled = fields.scheduledAt ? new Date(fields.scheduledAt) : null;
  const order = Number.parseInt(fields.seriesOrder, 10);
  return {
    title: fields.title.trim(),
    content: fields.content,
    excerpt: fields.excerpt.trim() || null,
    category: fields.category,
    tags: fields.tags,
    coverImage: fields.coverImage.trim() || null,
    coverImageAlt: fields.coverImageAlt.trim() || null,
    scheduledFor:
      scheduled && !Number.isNaN(scheduled.getTime()) ? scheduled : null,
    seoTitle: fields.seoTitle.trim() || null,
    seoDescription: fields.seoDescription.trim() || null,
    series: fields.series.trim() || null,
    seriesOrder: Number.isFinite(order) ? order : null,
  };
};

export interface LoadedPost {
  post: BlogPost;
  updatedAtMs: number;
}

export const fetchPostForEditing = async (id: string): Promise<LoadedPost | null> => {
  const snapshot = await getDoc(doc(db, "posts", id));
  if (!snapshot.exists()) return null;
  const post = { id: snapshot.id, ...snapshot.data() } as BlogPost;
  return { post, updatedAtMs: toTimestamp(post.updatedAt ?? post.createdAt) };
};

export class EditConflictError extends Error {
  constructor(public readonly serverPost: BlogPost) {
    super("This post was changed by someone else since you opened it.");
    this.name = "EditConflictError";
  }
}

/**
 * Updates a post unless someone else has saved it since `knownUpdatedAtMs`.
 * Returns the new local timestamp to compare against next time.
 */
export const updatePostSafely = async ({
  id,
  data,
  status,
  knownUpdatedAtMs,
  userId,
  force = false,
}: {
  id: string;
  data: ReturnType<typeof toPostData>;
  status: PostStatus;
  knownUpdatedAtMs: number;
  userId: string;
  force?: boolean;
}): Promise<number> => {
  if (!force) {
    const current = await fetchPostForEditing(id);
    if (
      current &&
      current.updatedAtMs > knownUpdatedAtMs + 1000 &&
      (current.post as BlogPost & { lastEditedBy?: string }).lastEditedBy !== userId
    ) {
      throw new EditConflictError(current.post);
    }
  }

  await updateDoc(doc(db, "posts", id), {
    ...data,
    status,
    lastEditedBy: userId,
    updatedAt: serverTimestamp(),
  });
  return Date.now();
};

export const getAuthorDisplayName = (user: User | null): string => {
  if (!user) return "Anonymous";
  return user.nickname?.trim() || user.name?.trim() || "Anonymous";
};

export const addRevision = async (
  postId: string,
  revision: Pick<PostRevision, "title" | "content" | "savedBy" | "savedByName">
): Promise<void> => {
  await addDoc(collection(db, "posts", postId, "revisions"), {
    ...revision,
    createdAt: serverTimestamp(),
  });
};

export const listRevisions = async (postId: string): Promise<PostRevision[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, "posts", postId, "revisions"),
      orderBy("createdAt", "desc"),
      limit(30)
    )
  );
  return snapshot.docs.map((revisionDoc) => ({
    id: revisionDoc.id,
    ...(revisionDoc.data() as Omit<PostRevision, "id">),
  }));
};
