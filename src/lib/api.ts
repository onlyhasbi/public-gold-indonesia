import axios from "axios";
import { queryClient } from "./queryClient";

const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
const cleanUrl = url.replace(/\/+$/, "");
const baseURL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

/**
 * UTILITY: Extract token independently of localStorage.
 * Reads directly from the hydrated TanStack Query cache.
 */
const getAuthData = (isAdmin: boolean) => {
  const key = isAdmin ? ["auth", "admin"] : ["auth", "dealer"];
  // getQueryData is synchronous and will find the data if hydrated by the persister
  return queryClient.getQueryData<any>(key);
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  const isAdminPath = path.startsWith("/admin");

  const authData = getAuthData(isAdminPath);
  const token = authData?.token;

  if (token && !config.headers.Authorization) {
    const cleanToken =
      typeof token === "string" ? token.replace(/^"|"$/g, "") : token;
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Handle expired tokens and server errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;

      // Wipe absolutely all auth states
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.clear();

      if (path.startsWith("/admin")) {
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      console.warn("Rate limited. Silakan tunggu beberapa saat.");
    }

    return Promise.reject(error);
  },
);
