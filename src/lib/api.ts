import axios from "axios";

const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
const baseURL = url.endsWith('/api') ? url : `${url}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000, // 15 second timeout — prevents hanging requests
});

// Attach JWT token to every request
// IMPORTANT: Don't overwrite Authorization if already explicitly set (e.g. admin routes)
api.interceptors.request.use((config) => {
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? rawToken.replace(/^"|"$/g, '') : null;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
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
        return Promise.reject(error);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // If we're on a protected route, the app should naturally 
      // redirect on next navigation or route guard check.
    }

    // Rate limited
    if (error.response?.status === 429) {
      console.warn("Rate limited. Silakan tunggu beberapa saat.");
    }

    return Promise.reject(error);
  }
);
