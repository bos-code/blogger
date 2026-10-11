import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig";
import { apiRequest } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { createNotification } from "./useNotifications";
import { toTimestamp } from "../utils/date";
import type { Testimonial, TestimonialStatus } from "../types";

export const TESTIMONIAL_MIN_LENGTH = 20;
export const TESTIMONIAL_MAX_LENGTH = 1000;

const KEYS = {
  approved: ["testimonials", "approved"] as const,
  mine: (uid: string) => ["testimonials", "mine", uid] as const,
  all: ["testimonials", "all"] as const,
};

const newestFirst = (items: Testimonial[]) =>
  [...items].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

const read = async (constraint?: ReturnType<typeof where>) => {
  const ref = collection(db, "testimonials");
  const snapshot = await getDocs(constraint ? query(ref, constraint) : ref);
  return newestFirst(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Testimonial, "id">) })));
};

/** Public, approved testimonials (sorted client-side, so no composite index is needed). */
export const useApprovedTestimonials = () =>
  useQuery({ queryKey: KEYS.approved, queryFn: () => read(where("status", "==", "approved")), staleTime: 5 * 60 * 1000 });

/** The signed-in user's own testimonials, including ones awaiting approval. */
export const useMyTestimonials = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  return useQuery({
    queryKey: KEYS.mine(uid ?? "none"),
    queryFn: () => read(where("authorId", "==", uid)),
    enabled: Boolean(uid),
  });
};

/** Every testimonial, for moderation (admins only). */
export const useAllTestimonials = (enabled = true) => useQuery({ queryKey: KEYS.all, queryFn: () => read(), enabled });

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
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

/** Private contact details for testimonials, keyed by testimonial id (admins only). */
export const useTestimonialContacts = (enabled = true) =>
  useQuery({
    queryKey: ["testimonials", "contacts"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "testimonialContacts"));
      return new Map(snapshot.docs.map((item) => [item.id, String(item.get("contact") ?? "")]));
    },
    enabled,
  });

export const useModerateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { testimonial: Testimonial; status: TestimonialStatus }>({
    mutationFn: async ({ testimonial, status }) => {
      await updateDoc(doc(db, "testimonials", testimonial.id), { status, reviewedAt: serverTimestamp() });
      if (status === "approved") {
        void createNotification({
          userId: testimonial.authorId,
          type: "testimonial_approved",
          message: "Your testimonial is now live. Thank you!",
          link: "/#testimonials",
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "testimonials", id));
      // Contact details go with it (admins only; ignored for others).
      await deleteDoc(doc(db, "testimonialContacts", id)).catch(() => undefined);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};
