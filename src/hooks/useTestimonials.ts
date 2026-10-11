import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
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
  content: string;
  authorTitle?: string;
  projectSlug?: string | null;
  rating?: number | null;
}

export const useSubmitTestimonial = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  return useMutation<void, Error, TestimonialInput>({
    mutationFn: async (input) => {
      if (!user) throw new Error("Sign in to leave a testimonial.");
      const content = input.content.trim();
      if (content.length < TESTIMONIAL_MIN_LENGTH) {
        throw new Error(`Please write at least ${TESTIMONIAL_MIN_LENGTH} characters.`);
      }
      if (content.length > TESTIMONIAL_MAX_LENGTH) {
        throw new Error(`Testimonials can be at most ${TESTIMONIAL_MAX_LENGTH} characters.`);
      }
      const authorName = user.nickname || user.name || "Anonymous";
      await addDoc(collection(db, "testimonials"), {
        authorId: user.uid,
        authorName,
        authorAvatar: user.photoURL || null,
        authorTitle: input.authorTitle?.trim() || null,
        projectSlug: input.projectSlug || null,
        rating: input.rating ?? null,
        content,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      void createNotification({
        userId: "admins",
        type: "pending_testimonial",
        message: `${authorName} left a testimonial waiting for your approval`,
        link: "/admin",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

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
    mutationFn: async (id) => deleteDoc(doc(db, "testimonials", id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};
