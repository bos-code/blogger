import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import { FALLBACK_PROJECTS } from "../data/projects";
import type { Project } from "../types";

const PROJECTS_KEY = ["projects"] as const;

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

const sortProjects = (projects: Project[]) =>
  [...projects].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

/**
 * Portfolio projects from Firestore (publicly readable). Falls back to the
 * built-in list when none have been added or the request fails.
 */
export const useProjects = () =>
  useQuery<{ projects: Project[]; fromDatabase: boolean }>({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      try {
        const snapshot = await getDocs(collection(db, "projects"));
        const projects = snapshot.docs.map((projectDoc) => ({
          id: projectDoc.id,
          ...(projectDoc.data() as Omit<Project, "id">),
        }));
        return projects.length
          ? { projects: sortProjects(projects), fromDatabase: true }
          : { projects: FALLBACK_PROJECTS, fromDatabase: false };
      } catch {
        return { projects: FALLBACK_PROJECTS, fromDatabase: false };
      }
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: { projects: FALLBACK_PROJECTS, fromDatabase: false },
  });

export const useSaveProject = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id?: string; data: ProjectInput }>({
    mutationFn: async ({ id, data }) => {
      if (id) {
        await updateDoc(doc(db, "projects", id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "projects", id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};
