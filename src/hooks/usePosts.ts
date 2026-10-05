import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  collection,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { createNotification } from "./useNotifications";
import { queryKeys } from "../utils/queryClient";
import type { BlogPost, CreatePostInput, User } from "../types";

// Helper function to get user display name (nickname or first name or full name)
const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Anonymous";
  
  if (user.nickname?.trim()) {
    return user.nickname.trim();
  }

  // Use first name if available, otherwise full name
  if (user.name) {
    const firstName = user.name.split(" ")[0];
    return firstName || user.name;
  }
  
  return "Anonymous";
};

interface UpdatePostData {
  id: string;
  data: Partial<BlogPost>;
  /** Status before this update; used to send notifications on changes. */
  previousStatus?: BlogPost["status"];
}

interface UpdatePostResult {
  id: string;
  data: Partial<BlogPost>;
}

interface LikeMutationContext {
  previousPostQueries: Array<[QueryKey, BlogPost[] | BlogPost | null | undefined]>;
}

type PostReadScope = "all" | "writer" | "public";

const postsFromSnapshot = (
  snapshot: QuerySnapshot<DocumentData>
): BlogPost[] =>
  snapshot.docs.map((snapshotDocument) => ({
    id: snapshotDocument.id,
    ...snapshotDocument.data(),
  })) as BlogPost[];

const fetchPosts = async (
  scope: PostReadScope,
  userId?: string
): Promise<BlogPost[]> => {
  const postsCollection = collection(db, "posts");

  if (scope === "all") {
    return postsFromSnapshot(await getDocs(postsCollection));
  }

  const approvedPostsQuery = query(
    postsCollection,
    where("status", "==", "approved")
  );

  if (scope !== "writer" || !userId) {
    return postsFromSnapshot(await getDocs(approvedPostsQuery));
  }

  const ownPostsQuery = query(
    postsCollection,
    where("authorId", "==", userId)
  );
  const [approvedSnapshot, ownSnapshot] = await Promise.all([
    getDocs(approvedPostsQuery),
    getDocs(ownPostsQuery),
  ]);

  const uniquePosts = new Map<string, BlogPost>();
  for (const post of [
    ...postsFromSnapshot(approvedSnapshot),
    ...postsFromSnapshot(ownSnapshot),
  ]) {
    uniquePosts.set(post.id, post);
  }

  return [...uniquePosts.values()];
};

// Fetch all posts
export const usePosts = () => {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const scope: PostReadScope =
    role === "admin" || role === "super_admin"
      ? "all"
      : role === "writer"
        ? "writer"
        : "public";

  return useQuery<BlogPost[]>({
    queryKey: [...queryKeys.posts.all, scope, user?.uid ?? "anonymous"],
    queryFn: async () => {
      try {
        return await fetchPosts(scope, user?.uid);
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw new Error("Failed to fetch posts. Please try again later.");
      }
    },
    // Reduced stale time for blog page - data considered fresh for 30 seconds
    staleTime: 30 * 1000, // 30 seconds (instead of default 5 minutes)
    // Cache data for 2 minutes
    gcTime: 2 * 60 * 1000, // 2 minutes
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes("permission")) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
  });
};

/**
 * One post by id. Uses the post list cache when available and otherwise
 * reads the document directly (approved posts are publicly readable).
 */
export const usePost = (id: string | undefined) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const displayStatus = useAuthStore((state) => state.displayStatus);

  return useQuery<BlogPost | null>({
    queryKey: [...queryKeys.posts.detail(id ?? ""), user?.uid ?? "anonymous"],
    queryFn: async () => {
      try {
        const snapshot = await getDoc(doc(db, "posts", id!));
        return snapshot.exists()
          ? ({ id: snapshot.id, ...snapshot.data() } as BlogPost)
          : null;
      } catch (error) {
        // Private posts are unreadable to other users: treat as not found.
        if ((error as { code?: string }).code === "permission-denied") return null;
        throw error;
      }
    },
    initialData: () =>
      queryClient
        .getQueriesData<BlogPost[]>({ queryKey: queryKeys.posts.all })
        .flatMap(([, posts]) => (Array.isArray(posts) ? posts : []))
        .find((post) => post.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(queryKeys.posts.all)?.dataUpdatedAt,
    enabled: Boolean(id) && displayStatus !== "loading",
    staleTime: 30 * 1000,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === "admin" || role === "super_admin";

  return useMutation<BlogPost, Error, CreatePostInput>({
    mutationFn: async (data) => {
      if (!user?.uid) throw new Error("You must be signed in to create posts.");
      const blog = {
        ...data,
        authorId: user.uid,
        authorName: getUserDisplayName(user),
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        status: data.status ?? (isAdmin ? "approved" : "pending"),
        likedBy: [],
        likes: 0,
        views: 0,
      };
      const ref = await addDoc(collection(db, "posts"), blog);
      const blogData = { id: ref.id, ...blog } as unknown as BlogPost;
      await notifyStatusChange(blogData, blogData.status, isAdmin);
      return blogData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Sends the in-app notifications that go with a post entering a new state:
 * writers' submissions alert administrators; admin-published posts are
 * announced to every signed-in reader.
 */
export const notifyStatusChange = async (
  post: Pick<BlogPost, "id" | "title" | "authorName">,
  status: BlogPost["status"],
  isAdmin: boolean
): Promise<void> => {
  if (status === "pending" && !isAdmin) {
    await createNotification({
      userId: "admins",
      type: "pending_post",
      message: `${post.authorName || "A writer"} submitted "${post.title}" for review`,
      blogId: post.id,
    });
  }
  if (status === "approved" && isAdmin) {
    await createNotification({
      userId: "all",
      type: "new_post",
      message: `New post: "${post.title}"`,
      blogId: post.id,
    });
  }
};

// Update post mutation
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === "admin" || role === "super_admin";

  return useMutation<UpdatePostResult, Error, UpdatePostData>({
    mutationFn: async ({ id, data, previousStatus }) => {
      await updateDoc(doc(db, "posts", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      if (data.status && data.status !== previousStatus && data.title) {
        await notifyStatusChange(
          { id, title: data.title, authorName: data.authorName ?? null },
          data.status,
          isAdmin
        );
      }
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "posts", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

// Approve post mutation
export const useApprovePost = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, Pick<BlogPost, "id" | "title" | "authorId">>({
    mutationFn: async (post) => {
      await updateDoc(doc(db, "posts", post.id), {
        status: "approved",
        rejectionReason: null,
        updatedAt: serverTimestamp(),
      });

      await createNotification({
        userId: post.authorId,
        type: "post_approved",
        message: `Your post "${post.title}" was published`,
        blogId: post.id,
      });
      await createNotification({
        userId: "all",
        type: "new_post",
        message: `New post: "${post.title}"`,
        blogId: post.id,
      });

      return post.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Reject post mutation (with an optional reason shown to the writer)
export const useRejectPost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    string,
    Error,
    { post: Pick<BlogPost, "id" | "title" | "authorId">; reason: string }
  >({
    mutationFn: async ({ post, reason }) => {
      const trimmed = reason.trim();
      await updateDoc(doc(db, "posts", post.id), {
        status: "rejected",
        rejectionReason: trimmed || null,
        updatedAt: serverTimestamp(),
      });
      await createNotification({
        userId: post.authorId,
        type: "post_rejected",
        message: trimmed
          ? `"${post.title}" needs changes: ${trimmed}`
          : `"${post.title}" was sent back for changes`,
        link: `/edit/${post.id}`,
      });
      return post.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Feature/unfeature a post on the homepage (admins).
export const useSetFeaturedPost = () => {
  const queryClient = useQueryClient();
  const { data: posts = [] } = usePosts();

  return useMutation<void, Error, { id: string; featured: boolean }>({
    mutationFn: async ({ id, featured }) => {
      const batch = writeBatch(db);
      // Only one featured post at a time.
      if (featured) {
        posts
          .filter((post) => post.featured && post.id !== id)
          .forEach((post) =>
            batch.update(doc(db, "posts", post.id), { featured: false })
          );
      }
      batch.update(doc(db, "posts", id), { featured });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

// Apply one status/delete action to many posts at once (admins).
export const useBulkPostAction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { ids: string[]; action: "approve" | "draft" | "delete" }
  >({
    mutationFn: async ({ ids, action }) => {
      const batch = writeBatch(db);
      for (const id of ids) {
        const ref = doc(db, "posts", id);
        if (action === "delete") batch.delete(ref);
        else
          batch.update(ref, {
            status: action === "approve" ? "approved" : "draft",
            updatedAt: serverTimestamp(),
          });
      }
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

export const useIncrementPostView = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (postId) => {
      await updateDoc(doc(db, "posts", postId), {
        views: increment(1),
        updatedAt: serverTimestamp(),
      });
      // Daily totals for the analytics dashboard (best-effort).
      const day = new Date().toISOString().slice(0, 10);
      try {
        await setDoc(
          doc(db, "dailyStats", day),
          { date: day, views: increment(1), posts: { [postId]: increment(1) } },
          { merge: true }
        );
      } catch {
        // Analytics must never affect reading.
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Failed to increment post view:", error);
    },
  });
};

/**
 * Like/Unlike Post Mutation Hook
 *
 * Implements a complete like system with:
 * - Optimistic UI updates for instant feedback
 * - Automatic rollback on failure
 * - Prevention of duplicate likes
 * - Atomic updates to Firestore
 * - Proper error handling
 * - Authentication checks
 *
 * Database Schema:
 * posts/{postId}
 *   - likedBy: string[] (array of user IDs who liked the post)
 *   - likes: number (count for backward compatibility, synced with likedBy.length)
 *
 * Security:
 * - Only authenticated users can like (checked client-side and should be enforced in Firestore rules)
 * - Each user can only like once (enforced by array operations)
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<
    { postId: string; likedBy: string[] },
    Error,
    { postId: string; currentLikedBy?: string[] },
    LikeMutationContext
  >({
    mutationFn: async ({ postId, currentLikedBy = [] }) => {
      // Security: Ensure user is authenticated
      if (!user?.uid) {
        throw new Error("You must be logged in to like posts");
      }

      const userId = user.uid;

      // Prevent duplicate likes: Check if user already liked
      const isLiked = currentLikedBy.includes(userId);

      // Toggle like state: Add user ID if not liked, remove if already liked
      const newLikedBy = isLiked
        ? currentLikedBy.filter((id) => id !== userId) // Unlike: remove user ID
        : [...currentLikedBy, userId]; // Like: add user ID

      // Atomic update: Update both likedBy array and likes count in single transaction
      await updateDoc(doc(db, "posts", postId), {
        likedBy: newLikedBy,
        likes: newLikedBy.length, // Keep count in sync for backward compatibility
        updatedAt: serverTimestamp(),
      });

      return { postId, likedBy: newLikedBy };
    },

    // Optimistic Update: Update UI immediately before server confirms
    onMutate: async ({ postId, currentLikedBy = [] }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      // Snapshot the previous value for rollback
      const previousPostQueries = queryClient.getQueriesData<
        BlogPost[] | BlogPost | null
      >({
        queryKey: queryKeys.posts.all,
      });

      // Get current user for optimistic update
      const currentUser = user;
      if (!currentUser?.uid) {
        return { previousPostQueries };
      }

      const userId = currentUser.uid;
      const isLiked = currentLikedBy.includes(userId);
      const newLikedBy = isLiked
        ? currentLikedBy.filter((id) => id !== userId)
        : [...currentLikedBy, userId];

      // Optimistically update both post lists and single-post entries.
      const applyLike = (post: BlogPost): BlogPost =>
        post.id === postId
          ? { ...post, likedBy: newLikedBy, likes: newLikedBy.length }
          : post;
      queryClient.setQueriesData<BlogPost[] | BlogPost | null>(
        { queryKey: queryKeys.posts.all },
        (cached) => {
          if (!cached) return cached;
          return Array.isArray(cached) ? cached.map(applyLike) : applyLike(cached);
        }
      );

      // Return context with snapshot for potential rollback
      return { previousPostQueries };
    },

    // On Success: Invalidate queries to sync with server
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },

    // On Error: Rollback optimistic update and show error
    onError: (error: Error, variables, context) => {
      // Rollback: Restore previous state
      if (context) {
        for (const [queryKey, posts] of context.previousPostQueries) {
          queryClient.setQueryData(queryKey, posts);
        }
      }

      // Show user-friendly error notification
      showNotification({
        type: "error",
        title: "Failed to update like",
        message:
          error.message ||
          "There was an error updating the like. Please try again.",
      });

      console.error(`Like mutation error for ${variables.postId}:`, error);
    },

    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
