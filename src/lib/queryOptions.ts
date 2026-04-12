import { queryOptions } from "@tanstack/react-query";
import { api } from "./api";
import { getGoldPrices } from "../services/getGoldPrices";

/**
 * Query Options for Agent Data (PGBO)
 * Used on the public landing page.
 */
export const agentQueryOptions = (pgcode: string) => 
  queryOptions({
    queryKey: ["agent", pgcode],
    queryFn: async () => {
      const res = await api.get(`/public/pgbo/${pgcode}`);
      return res.data.data;
    },
    // USER REQUIREMENT: Always fresh data for previews
    staleTime: 0,
  });

/**
 * Query Options for Gold Prices
 * Used on primary public landing page.
 * Guaranteed fresh data as per user requirement.
 */
export const goldPricesQueryOptions = () =>
  queryOptions({
    queryKey: ["goldPrices"],
    queryFn: getGoldPrices,
    // USER REQUIREMENT: Always get fresh data
    staleTime: 0, 
    // Data remains in cache for 5 minutes during background refetch to avoid UI flicker
    gcTime: 5 * 60 * 1000,
  });

/**
 * Query Options for Dashboard Overview (Admin)
 */
export const overviewQueryOptions = () =>
  queryOptions({
    queryKey: ["overview"],
    queryFn: async () => {
      const res = await api.get("/overview");
      return res.data?.data;
    },
    staleTime: 0,
  });

/**
 * Query Options for User Settings (Admin)
 */
export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get("/settings");
      return res.data?.data;
    },
    staleTime: 0,
  });

/**
 * Query Options for Google Connection Status
 */
export const googleStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["googleStatus"],
    queryFn: async () => {
      const res = await api.get("/google/status");
      return res.data;
    },
    staleTime: 0,
  });
