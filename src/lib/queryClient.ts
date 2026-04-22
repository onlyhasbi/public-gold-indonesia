import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * FACTORY FUNCTION: Creates a fresh QueryClient instance.
 * Mandatory for SSR per-request isolation.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes default
      },
    },
  });

/**
 * SINGLETON INSTANCE: Shared instance for browser-side utilities.
 * Restored to fix broken imports in api.ts, auth.ts, and UI components.
 */
export const queryClient = createQueryClient();

/**
 * PERSISTENCE & TAB SYNC
 */
if (typeof window !== "undefined") {
  // Sync the singleton instance on the browser
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "PUBLIC_GOLD_QUERY_CACHE",
  });

  // One-time migration: remove stale portal entries from old persisted cache
  try {
    const raw = localStorage.getItem("PUBLIC_GOLD_QUERY_CACHE");
    if (raw) {
      const cache = JSON.parse(raw);
      if (
        cache?.clientState?.queries?.some(
          (q: { queryKey: unknown[] }) => q.queryKey[0] === "portal",
        )
      ) {
        cache.clientState.queries = cache.clientState.queries.filter(
          (q: { queryKey: unknown[] }) => q.queryKey[0] !== "portal",
        );
        localStorage.setItem("PUBLIC_GOLD_QUERY_CACHE", JSON.stringify(cache));
      }
    }
  } catch {}

  persistQueryClient({
    queryClient,
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const key = query.queryKey[0];
        return key === "auth" || key === "agent";
      },
    },
    maxAge: 1000 * 60 * 60 * 24,
  });
}

// Helper to initialize persistence on a specific client instance (if needed)
export const setupPersistence = (targetClient: QueryClient) => {
  if (typeof window === "undefined" || targetClient === queryClient) return;

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "PUBLIC_GOLD_QUERY_CACHE",
  });

  persistQueryClient({
    queryClient: targetClient,
    persister,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const key = query.queryKey[0];
        return key === "auth" || key === "agent";
      },
    },
    maxAge: 1000 * 60 * 60 * 24,
  });
};
