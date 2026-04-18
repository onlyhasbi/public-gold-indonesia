import { api } from "../lib/api";
import type { GoldPricesResult } from "../types";

/**
 * Fetches gold prices from our internal backend API.
 * The backend handles the scraping from the source and returns clean JSON.
 */
export const getGoldPrices = async (): Promise<GoldPricesResult | null> => {
  try {
    const res = await api.get("/public/gold-prices");

    if (res.data.success && res.data.data) {
      return res.data.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch gold prices from backend:", error);
    return null;
  }
};
