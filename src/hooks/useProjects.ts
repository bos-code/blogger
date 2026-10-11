import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
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
 *
 * There is deliberately no placeholder list: showing the built-in projects
 * while Firestore loads made the page swap lists a moment later whenever
 * saved projects existed. Callers show a loading state instead.
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
  });

/** True when the saved projects are exactly the built-in list (same slugs). */
export const matchesBuiltInList = (projects: Project[]): boolean => {
  const saved = projects.map((project) => project.slug).sort().join("|");
  const builtIn = FALLBACK_PROJECTS.map((project) => project.slug).sort().join("|");
  return saved === builtIn;
};

/**
 * Replaces every saved project with the built-in list in one atomic batch
 * (admins only), e.g. after the built-in list has been updated in code.
 */
export const useReplaceWithBuiltInProjects = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const existing = await getDocs(collection(db, "projects"));
      const batch = writeBatch(db);
      const keep = new Set(FALLBACK_PROJECTS.map((project) => project.id));
      existing.docs.filter((projectDoc) => !keep.has(projectDoc.id)).forEach((projectDoc) => batch.delete(projectDoc.ref));
      FALLBACK_PROJECTS.forEach(({ id, ...project }) => {
        batch.set(doc(db, "projects", id), { ...project, createdAt: serverTimestamp() });
      });
      await batch.commit();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
};

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
