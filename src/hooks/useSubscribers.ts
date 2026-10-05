import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseconfig";
import { useRole } from "./useRole";
import { apiRequest } from "../services/api";
import { toTimestamp } from "../utils/date";
import type { DateValue } from "../types";

export interface Subscriber {
  id: string;
  email: string;
  status: "pending" | "confirmed";
  createdAt?: DateValue;
  confirmedAt?: DateValue;
}

const KEY = ["subscribers"] as const;

/** Newsletter subscribers (administrators only; written by the email API). */
export const useSubscribers = () => {
  const { isAdmin, isEmailVerified } = useRole();
  return useQuery<Subscriber[]>({
    queryKey: KEY,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "subscribers"));
      return snapshot.docs
        .map((subscriberDoc) => {
          const data = subscriberDoc.data();
          return {
            id: subscriberDoc.id,
            email: String(data.email ?? ""),
            status: data.status === "confirmed" ? "confirmed" : "pending",
            createdAt: data.createdAt,
            confirmedAt: data.confirmedAt,
          } as Subscriber;
        })
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
    },
    enabled: isAdmin && isEmailVerified,
  });
};

export const useRemoveSubscriber = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "subscribers", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

/** Emails a published post to confirmed subscribers via the email API. */
export const sendPostToSubscribers = async (postId: string): Promise<{ sent: number }> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Sign in again to send emails.");
  return apiRequest<{ sent: number }>("notify-subscribers", { body: { postId }, token });
};
