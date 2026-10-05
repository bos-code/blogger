import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";

const bookmarksKey = (uid?: string) => ["bookmarks", uid] as const;

/** IDs of posts the signed-in user has saved (stored on their user profile). */
export const useBookmarks = () => {
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);

  return useQuery<string[]>({
    queryKey: bookmarksKey(user?.uid),
    queryFn: async () => {
      const snapshot = await getDoc(doc(db, "users", user!.uid));
      const value = snapshot.data()?.bookmarks;
      return Array.isArray(value) ? (value as string[]) : [];
    },
    enabled: Boolean(user?.uid && emailVerified),
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation<void, Error, { postId: string; saved: boolean }, { previous?: string[] }>({
    mutationFn: async ({ postId, saved }) => {
      if (!user?.uid) throw new Error("Sign in to save posts.");
      await updateDoc(doc(db, "users", user.uid), {
        bookmarks: saved ? arrayRemove(postId) : arrayUnion(postId),
      });
    },
    onMutate: async ({ postId, saved }) => {
      const key = bookmarksKey(user?.uid);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key);
      queryClient.setQueryData<string[]>(key, (current = []) =>
        saved ? current.filter((id) => id !== postId) : [...current, postId]
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(bookmarksKey(user?.uid), context?.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: bookmarksKey(user?.uid) }),
  });
};
