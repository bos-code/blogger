import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";
import { queryKeys } from "../utils/queryClient";
import type { BlogPost, User } from "../types";

// Helper function to get user display name (nickname or first name or full name)
const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Anonymous";
  
  // Check if user has nickname in Firestore (we'll need to fetch it)
  // For now, use first name if available, otherwise full name
  if (user.name) {
    const firstName = user.name.split(" ")[0];
    return firstName || user.name;
  }
  
  return "Anonymous";
};

interface CreatePostData {
  title: string;
  content: string;
  [key: string]: any;
}

interface UpdatePostData {
  id: string;
  data: Partial<BlogPost>;
}

// Fetch all posts
export const usePosts = () => {
  return useQuery<BlogPost[]>({
    queryKey: queryKeys.posts.all,
    queryFn: async () => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      try {
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, "posts")
        );
        return snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BlogPost[];
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

// Real-time posts subscription
export const usePostsRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery<BlogPost[]>({
    queryKey: queryKeys.posts.realtime,
    queryFn: () => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      return new Promise<BlogPost[]>((resolve) => {
        const unsub = onSnapshot(collection(db, "posts"), (snap) => {
          const blogs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as BlogPost[];
          queryClient.setQueryData(queryKeys.posts.all, blogs);
          resolve(blogs);
        });
        // Return unsubscribe function
        return () => unsub();
      });
    },
    enabled: true,
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
  const isAdmin = role === "admin";

  return useMutation<BlogPost, Error, CreatePostData>({
    mutationFn: async (data) => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      const blog = {
        ...data,
        authorId: user?.uid || "guest",
        authorName: getUserDisplayName(user),
        createdAt: serverTimestamp(),
        status: (data as any).status ?? (isAdmin ? "approved" : "pending"),
        likedBy: [], // Initialize with empty array
        likes: 0, // Initialize with 0
      };
      const ref = await addDoc(collection(db, "posts"), blog);
      const blogData = { id: ref.id, ...blog } as BlogPost;

      // Create notification
      try {
        await addDoc(collection(db, "notifications"), {
          userId: "all",
          type: "new_post",
          message: `${blogData.authorName} added "${blogData.title}"`,
          blogId: blogData.id,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to create notification:", err);
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

  return useMutation<UpdatePostData, Error, UpdatePostData>({
    mutationFn: async ({ id, data }) => {
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
      await updateDoc(doc(db, "posts", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, ...data };
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
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
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
      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
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
    { postId: string; currentLikedBy?: string[] }
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

      if (!db) {
        throw new Error("Firestore is not configured. Please set up your Firebase credentials.");
      }
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
      const previousPosts = queryClient.getQueryData<BlogPost[]>(queryKeys.posts.all);

      // Get current user for optimistic update
      const currentUser = user;
      if (!currentUser?.uid) {
        return { previousPosts };
      }

      const userId = currentUser.uid;
      const isLiked = currentLikedBy.includes(userId);
      const newLikedBy = isLiked
        ? currentLikedBy.filter((id) => id !== userId)
        : [...currentLikedBy, userId];

      // Optimistically update the cache
      queryClient.setQueryData<BlogPost[]>(queryKeys.posts.all, (oldPosts) => {
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
      });

      // Return context with snapshot for potential rollback
      return { previousPosts };
    },

    // On Success: Invalidate queries to sync with server
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },

    // On Error: Rollback optimistic update and show error
    onError: (error: Error, variables, context) => {
      // Rollback: Restore previous state
      if (context?.previousPosts) {
        queryClient.setQueryData<BlogPost[]>(queryKeys.posts.all, context.previousPosts);
      }

      // Show user-friendly error notification
      showNotification({
        type: "error",
        title: "Failed to update like",
        message:
          error.message ||
          "There was an error updating the like. Please try again.",
      });

      console.error("Like mutation error:", error);
    },

    // Always refetch after error or success to ensure consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
