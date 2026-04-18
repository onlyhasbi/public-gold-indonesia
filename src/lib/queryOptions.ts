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
    // USER REQUIREMENT: Always get fresh data on mount (refresh)
    staleTime: 0,
    // Disable background updates to avoid excessive scraping
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Data remains in cache for 5 minutes during background refetch to avoid UI flicker
    gcTime: 5 * 60 * 1000,
  });

/**
 * Query Options for Dashboard Overview (Admin)
 */
export const overviewQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: ["overview", search],
    queryFn: async () => {
      const res = await api.get(
        `/overview${search ? `?search=${encodeURIComponent(search)}` : ""}`,
      );
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
