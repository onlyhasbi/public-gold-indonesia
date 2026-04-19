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

let resolveHydration: (value: void) => void;
export const hydrationPromise = new Promise<void>((resolve) => {
  resolveHydration = resolve;
});

persistQueryClient({
  queryClient,
  persister,
  dehydrateOptions: {
    // ONLY persist authentication queries.
    // This includes data under ['auth', 'dealer'] and ['auth', 'admin'].
    shouldDehydrateQuery: (query) => {
      return query.queryKey[0] === "auth" || query.queryKey[0] === "portal";
    },
  },
  // Ensure that old stale auth data is discarded if it's too old (e.g., 24h)
  maxAge: 1000 * 60 * 60 * 24,
});

// Since we use createSyncStoragePersister (localStorage),
// hydration happens synchronously during initialization.
// We resolve on the next tick to ensure the internal state is updated.
setTimeout(() => {
  resolveHydration();
}, 1);

/**
 * TAB SYNCHRONIZATION: Listen for cache updates from other tabs.
 * This ensures that if the portal is unlocked in Tab A, Tab B updates instantly.
 */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "PUBLIC_GOLD_QUERY_CACHE") {
      // Small delay to ensure localStorage is fully updated before invalidating
      setTimeout(() => {
        // We only invalidate 'portal' queries as they are the most critical for multi-tab consistency
        queryClient.invalidateQueries({ queryKey: ["portal"] });
      }, 100);
    }
  });
}
