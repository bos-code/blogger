/**
 * React Query utility functions
 * Centralized query client configuration and helpers
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create the app's QueryClient with shared defaults.
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus to reduce unnecessary requests
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnMount: true,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 0,
        throwOnError: false,
      },
    },
  });
};

/**
 * Query keys factory for type-safe query keys
 */
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    detail: (id: string) => ["posts", id] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  notifications: {
    all: (userId?: string) => ["notifications", userId] as const,
  },
} as const;
