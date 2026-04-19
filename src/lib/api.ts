import axios from "axios";

import { getDefaultStore } from "jotai";
import {
  authTokenAtom,
  adminTokenAtom,
  authUserAtom,
  adminUserAtom,
} from "../store/authStore";

const store = getDefaultStore();

const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
// Carefully join the URL and /api segment, avoiding double slashes or missing ones
const cleanUrl = url.replace(/\/+$/, "");
const baseURL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const path = window.location.pathname;

  // Choose token based on route
  const token = path.startsWith("/admin")
    ? store.get(adminTokenAtom)
    : store.get(authTokenAtom);

  if (token && !config.headers.Authorization) {
    const cleanToken = token.replace(/^"|"$/g, "");
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// Handle expired tokens and server errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or unauthorized — force re-login
    if (error.response?.status === 401) {
      const path = window.location.pathname;

      // Admin pages handle their own auth flow — don't interfere
      if (path.startsWith("/admin")) {
        store.set(adminTokenAtom, null);
        store.set(adminUserAtom, null);
        return Promise.reject(error);
      }

      store.set(authTokenAtom, null);
      store.set(authUserAtom, null);

      // If we're on a protected route, the app should naturally
      // redirect on next navigation or route guard check.
    }

    // Rate limited
    if (error.response?.status === 429) {
      console.warn("Rate limited. Silakan tunggu beberapa saat.");
    }

    return Promise.reject(error);
  },
);
