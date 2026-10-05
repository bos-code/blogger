import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useAuthStore } from "../stores/authStore";
import { queryKeys } from "../utils/queryClient";
import type { BlogPost } from "../types";

export interface Category {
  id: string;
  name: string;
}

/**
 * Categories managed by administrators in the `categories` collection.
 * Readable by any verified account (writers pick from this list).
 */
export const useCategories = () => {
  const user = useAuthStore((state) => state.user);
  const emailVerified = useAuthStore((state) => state.emailVerified);

  return useQuery<Category[]>({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      return snapshot.docs
        .map((categoryDoc) => ({
          id: categoryDoc.id,
          name: String(categoryDoc.data().name ?? "").trim(),
        }))
        .filter((category) => category.name)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: Boolean(user && emailVerified),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: async (name) => {
      const ref = await addDoc(collection(db, "categories"), {
        name: name.trim(),
        createdAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};

interface RenameCategoryInput {
  category: Category | null;
  oldName: string;
  newName: string;
  posts: BlogPost[];
}

/** Renames a category and every post that uses it in one atomic batch. */
export const useRenameCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RenameCategoryInput>({
    mutationFn: async ({ category, oldName, newName, posts }) => {
      const batch = writeBatch(db);
      const trimmed = newName.trim();
      if (category) {
        batch.update(doc(db, "categories", category.id), { name: trimmed });
      } else {
        batch.set(doc(collection(db, "categories")), {
          name: trimmed,
          createdAt: serverTimestamp(),
        });
      }
      posts
        .filter((post) => post.category === oldName)
        .forEach((post) =>
          batch.update(doc(db, "posts", post.id), {
            category: trimmed,
            updatedAt: serverTimestamp(),
          })
        );
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};

interface DeleteCategoryInput {
  category: Category | null;
  name: string;
  posts: BlogPost[];
}

/** Deletes a category and clears it from the posts that use it. */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteCategoryInput>({
    mutationFn: async ({ category, name, posts }) => {
      const batch = writeBatch(db);
      if (category) batch.delete(doc(db, "categories", category.id));
      posts
        .filter((post) => post.category === name)
        .forEach((post) =>
          batch.update(doc(db, "posts", post.id), {
            category: "",
            updatedAt: serverTimestamp(),
          })
        );
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
};
