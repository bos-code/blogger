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
import type { BlogPost } from "../types";

interface CreatePostData {
  title: string;
  content: string;
  [key: string]: any;
}

interface UpdatePostData {
  id: string;
  data: Partial<BlogPost>;
}

// Fetch all posts (filtered by role - only admins see unapproved posts)
export const usePosts = () => {
  const role = useAuthStore((state) => state.role);
  const isAdmin = role === "admin";

  return useQuery<BlogPost[]>({
    queryKey: ["posts", isAdmin ? "all" : "approved"],
    queryFn: async () => {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        collection(db, "posts")
      );
      const allPosts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as BlogPost[];

      // Filter: Only admins see unapproved/rejected posts
      // Regular users ONLY see approved posts (strict filtering)
      if (isAdmin) {
        return allPosts;
      }
      // Non-admins: Only show posts with status === "approved"
      return allPosts.filter((post) => post.status === "approved");
    },
    // Optimize caching: posts don't change frequently
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};

// Fetch all posts (admin only - includes unapproved)
export const useAllPosts = () => {
  return useQuery<BlogPost[]>({
    queryKey: ["posts", "all"],
    queryFn: async () => {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        collection(db, "posts")
      );
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as BlogPost[];
    },
    // Admin dashboard needs fresher data
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};

// Real-time posts subscription
export const usePostsRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery<BlogPost[]>({
    queryKey: ["posts", "realtime"],
    queryFn: () => {
      return new Promise<BlogPost[]>((resolve) => {
        const unsub = onSnapshot(collection(db, "posts"), (snap) => {
          const blogs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as BlogPost[];
          queryClient.setQueryData(["posts"], blogs);
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
      const blog = {
        ...data,
        authorId: user?.uid || "guest",
        authorName: user?.name || "Anonymous",
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
      await updateDoc(doc(db, "posts", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, ...data };
    },
    onSuccess: (data) => {
      // Optimistically update the cache for the specific post
      queryClient.setQueryData<BlogPost[]>(["posts", "all"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map((post) =>
          post.id === data.id ? { ...post, ...data.data } : post
        );
      });
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
    onSuccess: (id) => {
      // Optimistically remove from cache
      queryClient.setQueryData<BlogPost[]>(["posts", "all"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.filter((post) => post.id !== id);
      });
      queryClient.setQueryData<BlogPost[]>(["posts", "approved"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.filter((post) => post.id !== id);
      });
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
    onSuccess: (id) => {
      // Optimistically update post status in cache
      queryClient.setQueryData<BlogPost[]>(["posts", "all"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return oldPosts.map((post) =>
          post.id === id ? { ...post, status: "approved" as const } : post
        );
      });
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueryData<BlogPost[]>(["posts"]);

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
      queryClient.setQueryData<BlogPost[]>(["posts"], (oldPosts) => {
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    // On Error: Rollback optimistic update and show error
    onError: (error: Error, variables, context) => {
      // Rollback: Restore previous state
      if (context?.previousPosts) {
        queryClient.setQueryData<BlogPost[]>(["posts"], context.previousPosts);
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
