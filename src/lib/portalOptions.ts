import { queryOptions } from "@tanstack/react-query";

/**
 * Local State for Portal Security
 * Managed via React Query cache and persisted to localStorage.
 */

export const portalUnlockedOptions = () =>
  queryOptions({
    queryKey: ["portal", "unlocked"],
    initialData: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const portalLockoutOptions = () =>
  queryOptions({
    queryKey: ["portal", "lockout"],
    initialData: null as number | null,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const portalAttemptsOptions = () =>
  queryOptions({
    queryKey: ["portal", "attempts"],
    initialData: 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
