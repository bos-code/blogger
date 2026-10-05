import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { useRole } from "./useRole";
import { toTimestamp } from "../utils/date";
import type { ContactMessage } from "../types";

const MESSAGES_KEY = ["messages"] as const;

/** Contact-form submissions. Readable by administrators only. */
export const useMessages = () => {
  const { isAdmin, isEmailVerified } = useRole();

  return useQuery<ContactMessage[]>({
    queryKey: MESSAGES_KEY,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "messages"));
      return snapshot.docs
        .map((messageDoc) => ({
          id: messageDoc.id,
          ...(messageDoc.data() as Omit<ContactMessage, "id">),
        }))
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
    },
    enabled: isAdmin && isEmailVerified,
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
};

export const useSetMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; read: boolean }>({
    mutationFn: async ({ id, read }) => {
      await updateDoc(doc(db, "messages", id), { read });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES_KEY }),
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "messages", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MESSAGES_KEY }),
  });
};
