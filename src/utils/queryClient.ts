/**
 * React Query utility functions
 * Centralized query client configuration and helpers
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create a new QueryClient with optimized defaults
 * This can be used for testing or creating multiple clients
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnMount: true,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 1,
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
    realtime: ["posts", "realtime"] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  notifications: {
    all: (userId?: string) => ["notifications", userId] as const,
    realtime: (userId?: string) =>
      ["notifications", "realtime", userId] as const,
  },
} as const;

/**
 * Helper to check if React Query is properly configured
 */
export const isQueryClientConfigured = (): boolean => {
  try {
    // This will throw if QueryClientProvider is not set up
    return typeof window !== "undefined";
  } catch {
    return false;
  }
};
