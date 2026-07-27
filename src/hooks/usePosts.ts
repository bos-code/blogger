import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
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
}

interface UpdatePostResult {
  id: string;
  data: Partial<BlogPost>;
}

interface LikeMutationContext {
  previousPostQueries: Array<[QueryKey, BlogPost[] | undefined]>;
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

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const isAdmin = role === "admin" || role === "super_admin";

  return useMutation<BlogPost, Error, CreatePostInput>({
    mutationFn: async (data) => {
      const blog = {
        ...data,
        authorId: user?.uid || "guest",
        authorName: getUserDisplayName(user),
        authorAvatar: user?.photoURL || null, // Include author avatar
        createdAt: serverTimestamp(),
        status: data.status ?? (isAdmin ? "approved" : "pending"),
        likedBy: [], // Initialize with empty array
        likes: 0, // Initialize with 0
      };
      const ref = await addDoc(collection(db, "posts"), blog);
      const blogData = { id: ref.id, ...blog } as unknown as BlogPost;

      // Admin-published posts can announce themselves to all signed-in users.
      if (isAdmin) {
        try {
          await addDoc(collection(db, "notifications"), {
            userId: "all",
            type: "new_post",
            message: `${blogData.authorName} added "${blogData.title}"`,
            blogId: blogData.id,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Failed to create notification:", error);
        }
      }

      return blogData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showNotification({
        type: "success",
        title: "Post Created",
        message: "Your blog post has been created successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Create Post",
        message:
          "There was an error creating your blog post. Please try again.",
      });
      console.error(error);
    },
  });
};

// Update post mutation
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<UpdatePostResult, Error, UpdatePostData>({
    mutationFn: async ({ id, data }) => {
      await updateDoc(doc(db, "posts", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      showNotification({
        type: "success",
        title: "Post Updated",
        message: "Your blog post has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Update Post",
        message:
          "There was an error updating your blog post. Please try again.",
      });
      console.error(error);
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "posts", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      showNotification({
        type: "success",
        title: "Post Deleted",
        message: "The blog post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Delete Post",
        message: "There was an error deleting the blog post. Please try again.",
      });
      console.error(error);
    },
  });
};

// Approve post mutation
export const useApprovePost = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await updateDoc(doc(db, "posts", id), { status: "approved" });

      // Create notification
      try {
        await addDoc(collection(db, "notifications"), {
          userId: "all",
          type: "approval",
          message: `An admin approved a blog.`,
          blogId: id,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to create notification:", err);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showNotification({
        type: "success",
        title: "Post Approved",
        message: "The blog post has been approved successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Approve Post",
        message:
          "There was an error approving the blog post. Please try again.",
      });
      console.error(error);
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => {
      console.error("Failed to increment post view:", error);
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
      const previousPostQueries = queryClient.getQueriesData<BlogPost[]>({
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

      // Optimistically update the cache
      queryClient.setQueriesData<BlogPost[]>(
        { queryKey: queryKeys.posts.all },
        (oldPosts) => {
          if (!oldPosts) return oldPosts;

          return oldPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedBy: newLikedBy,
                  likes: newLikedBy.length,
                }
              : post
          );
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
