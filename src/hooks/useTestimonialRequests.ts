import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { apiRequest } from "../services/api";
import { toTimestamp } from "../utils/date";
import type { TestimonialRequest, TestimonialRequestInvite } from "../types";

const KEY = ["testimonialRequests"] as const;

/** Every testimonial request sent to clients (admins only). */
export const useTestimonialRequests = (enabled = true) =>
  useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "testimonialRequests"));
      return snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<TestimonialRequest, "id">) }))
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
    },
    enabled,
  });

export interface TestimonialRequestInput {
  clientName: string;
  email?: string;
  phone?: string;
  note?: string;
  projectSlug: string;
  projectTitle: string;
  projectImage?: string | null;
  /** Email the request from the site (when an email address is given). */
  sendEmail: boolean;
}

export interface CreatedTestimonialRequest {
  id: string;
  url: string;
  emailed: boolean;
  emailError: string | null;
}

export const useCreateTestimonialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<CreatedTestimonialRequest, Error, TestimonialRequestInput>({
    mutationFn: async (input) => {
      const token = await auth.currentUser?.getIdToken();
      return apiRequest<CreatedTestimonialRequest>("testimonial", { token, body: { action: "request", ...input } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteTestimonialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteDoc(doc(db, "testimonialRequests", id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

/** The client's view of a request, from the token in their link. */
export const useTestimonialInvite = (token: string | undefined) =>
  useQuery({
    queryKey: ["testimonialInvite", token],
    queryFn: () =>
      apiRequest<TestimonialRequestInvite>(`testimonial?request=${encodeURIComponent(token ?? "")}`, { method: "GET" }),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

export interface SendPostInput {
  postId: string;
  name?: string;
  email: string;
  note?: string;
}

/** Emails a published post to one person from the site. */
export const useSendPost = () =>
  useMutation<{ ok: boolean; url: string }, Error, SendPostInput>({
    mutationFn: async (input) => {
      const token = await auth.currentUser?.getIdToken();
      return apiRequest("share", { token, body: input });
    },
  });
