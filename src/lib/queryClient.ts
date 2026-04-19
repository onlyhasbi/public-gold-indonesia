import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Shared QueryClient instance.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ensuring stale state doesn't trigger unexpected background refetches
      // during initial hydration of sensitive auth data.
      staleTime: 1000 * 60 * 5, // 5 minutes default
    },
  },
});

/**
 * PERSISTENCE LAYER: Automated Synchronization with localStorage.
 * Configured specifically for Auth data to act as the single source of truth.
 */
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "PUBLIC_GOLD_QUERY_CACHE",
});

persistQueryClient({
  queryClient,
  persister,
  dehydrateOptions: {
    // ONLY persist authentication queries.
    // This includes data under ['auth', 'dealer'] and ['auth', 'admin'].
    shouldDehydrateQuery: (query) => {
      return query.queryKey[0] === "auth";
    },
  },
  // Ensure that old stale auth data is discarded if it's too old (e.g., 24h)
  maxAge: 1000 * 60 * 60 * 24,
});
