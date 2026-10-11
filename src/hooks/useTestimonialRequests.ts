import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../firebaseconfig";
import { apiRequest } from "../services/api";
import { useDeleteTestimonialRequest, useTestimonialAdminData } from "./useTestimonials";
import type { TestimonialRequestInvite } from "../types";

/** Every testimonial request sent to clients (admins only). */
export const useTestimonialRequests = (enabled = true) => {
  const result = useTestimonialAdminData(enabled);
  return { ...result, data: result.data?.requests };
};

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export { useDeleteTestimonialRequest };

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
