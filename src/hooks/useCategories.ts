import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useNotificationStore } from "../stores/notificationStore";

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
  postCount?: number;
}

interface CreateCategoryData {
  name: string;
  description?: string;
}

interface UpdateCategoryData {
  id: string;
  data: Partial<Category>;
}

// Fetch all categories
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        collection(db, "categories")
      );
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Category[];
    },
    // Categories rarely change
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<Category, Error, CreateCategoryData>({
    mutationFn: async (data) => {
      const category = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "categories"), category);
      return { id: ref.id, ...category } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification({
        type: "success",
        title: "Category Created",
        message: "The category has been created successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Create Category",
        message: "There was an error creating the category. Please try again.",
      });
      console.error(error);
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<UpdateCategoryData, Error, UpdateCategoryData>({
    mutationFn: async ({ id, data }) => {
      await updateDoc(doc(db, "categories", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification({
        type: "success",
        title: "Category Updated",
        message: "The category has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Update Category",
        message: "There was an error updating the category. Please try again.",
      });
      console.error(error);
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "categories", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification({
        type: "success",
        title: "Category Deleted",
        message: "The category has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      showNotification({
        type: "error",
        title: "Failed to Delete Category",
        message: "There was an error deleting the category. Please try again.",
      });
      console.error(error);
    },
  });
};


