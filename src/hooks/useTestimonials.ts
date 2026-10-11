import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { ApiError, apiRequest } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { toTimestamp } from "../utils/date";
import type { Testimonial, TestimonialRequest, TestimonialStatus } from "../types";

export const TESTIMONIAL_MIN_LENGTH = 20;
export const TESTIMONIAL_MAX_LENGTH = 1000;

const KEYS = {
  approved: ["testimonials", "approved"] as const,
  mine: (uid: string) => ["testimonials", "mine", uid] as const,
  admin: ["testimonials", "admin"] as const,
};

const newestFirst = <T extends { createdAt?: Testimonial["createdAt"] }>(items: T[]) =>
  [...items].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

/** Direct Firestore read, used if the API isn't reachable (e.g. local dev without it). */
const readDirect = async (constraint?: ReturnType<typeof where>) => {
  const ref = collection(db, "testimonials");
  const snapshot = await getDocs(constraint ? query(ref, constraint) : ref);
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Testimonial, "id">) }));
};

/**
 * Testimonials are read through /api/testimonial (the server), so they load
 * whatever version of the Firestore rules is deployed.
 */
const readList = async (which: "approved" | "mine", fallback: () => Promise<Testimonial[]>) => {
  try {
    const token = await auth.currentUser?.getIdToken().catch(() => undefined);
    const { testimonials } = await apiRequest<{ testimonials: Testimonial[] }>(`testimonial?list=${which}`, { method: "GET", token });
    return newestFirst(testimonials);
  } catch (error) {
    if (error instanceof ApiError && error.status !== 404 && error.status !== 503 && error.status !== 0) throw error;
    return newestFirst(await fallback());
  }
};

/** Public, approved testimonials. */
export const useApprovedTestimonials = () =>
  useQuery({
    queryKey: KEYS.approved,
    queryFn: () => readList("approved", () => readDirect(where("status", "==", "approved"))),
    staleTime: 5 * 60 * 1000,
  });

/** The signed-in user's own testimonials, including ones awaiting approval. */
export const useMyTestimonials = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  return useQuery({
    queryKey: KEYS.mine(uid ?? "none"),
    queryFn: () => readList("mine", () => readDirect(where("authorId", "==", uid))),
    enabled: Boolean(uid),
  });
};

export interface TestimonialAdminData {
  testimonials: Testimonial[];
  /** Private contact details, keyed by testimonial id. */
  contacts: Map<string, string>;
  requests: TestimonialRequest[];
}

/** Everything for the dashboard: testimonials, contacts and requests (admins only). */
export const useTestimonialAdminData = (enabled = true) =>
  useQuery({
    queryKey: KEYS.admin,
    queryFn: async (): Promise<TestimonialAdminData> => {
      const token = await auth.currentUser?.getIdToken();
      const data = await apiRequest<{ testimonials: Testimonial[]; contacts: Record<string, string>; requests: TestimonialRequest[] }>(
        "testimonial?list=admin",
        { method: "GET", token }
      );
      return {
        testimonials: newestFirst(data.testimonials),
        contacts: new Map(Object.entries(data.contacts)),
        requests: newestFirst(data.requests),
      };
    },
    enabled,
  });

/** Every testimonial, for moderation (admins only). */
export const useAllTestimonials = (enabled = true) => {
  const result = useTestimonialAdminData(enabled);
  return { ...result, data: result.data?.testimonials };
};

const manage = async (body: Record<string, unknown>) => {
  const token = await auth.currentUser?.getIdToken();
  await apiRequest("testimonial", { token, body });
};

export interface TestimonialInput {
  name: string;
  /** Email or phone, private to the site owner. */
  contact: string;
  content: string;
  authorTitle?: string;
  projectSlug?: string | null;
  rating?: number | null;
  /** Honeypot field; real people leave it empty. */
  website?: string;
  /** Token from a personal request link, when answering one. */
  requestToken?: string;
}

/**
 * Submits a testimonial through /api/testimonial. Anyone can submit (no
 * account needed); signed-in users are linked to theirs so they can see it
 * while it waits for approval.
 */
export const useSubmitTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, TestimonialInput>({
    mutationFn: async (input) => {
      const content = input.content.trim();
      if (input.name.trim().length < 2) throw new Error("Please enter your name.");
      if (!input.contact.trim()) throw new Error("Please add an email address or phone number.");
      if (content.length < TESTIMONIAL_MIN_LENGTH) {
        throw new Error(`Please write at least ${TESTIMONIAL_MIN_LENGTH} characters.`);
      }
      if (content.length > TESTIMONIAL_MAX_LENGTH) {
        throw new Error(`Testimonials can be at most ${TESTIMONIAL_MAX_LENGTH} characters.`);
      }
      const token = await auth.currentUser?.getIdToken().catch(() => undefined);
      await apiRequest("testimonial", {
        token,
        body: {
          name: input.name.trim(),
          contact: input.contact.trim(),
          content,
          authorTitle: input.authorTitle?.trim() || null,
          projectSlug: input.projectSlug || null,
          rating: input.rating ?? null,
          website: input.website ?? "",
          ...(input.requestToken ? { requestToken: input.requestToken } : {}),
        },
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

export const useModerateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { testimonial: Testimonial; status: TestimonialStatus }>({
    mutationFn: ({ testimonial, status }) => manage({ action: "moderate", id: testimonial.id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => manage({ action: "delete", id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => manage({ action: "deleteRequest", id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};
