/**
 * GLOBAL CONFIGURATION
 * Centralized point for environment-specific variables and site metadata.
 */

export const API_URL = typeof window !== "undefined"
  ? "/api"
  : (process.env.API_URL || "http://localhost:3001/api");

export const SITE_URL = typeof window !== "undefined"
  ? window.location.origin
  : (process.env.VITE_SITE_URL || "https://mypublicgold.id");

export const IS_DEV = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  : process.env.NODE_ENV === "development";

export const APP_CONFIG = {
  name: "Public Gold Indonesia",
  description: "Portal Dealer Resmi Public Gold Indonesia",
  defaultLang: "id",
  supportedLangs: ["id", "en", "ms", "zh", "ta", "ar"],
};
