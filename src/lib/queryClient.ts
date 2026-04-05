import { QueryClient } from "@tanstack/react-query";

/**
 * Single shared QueryClient instance.
 * Imported by both main.tsx and __root.tsx to ensure
 * cache and invalidation are always in sync.
 */
export const queryClient = new QueryClient();
