import { redirect } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import {
  authUserAtom,
  authTokenAtom,
  adminUserAtom,
  adminTokenAtom,
} from "../store/authStore";

const store = getDefaultStore();

/**
 * Helper to get value from localStorage during initial rehydration / refresh.
 */
function getFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Clears session data and redirects to login.
 */
export const clearAuthAndRedirect = () => {
  store.set(authTokenAtom, null);
  store.set(authUserAtom, null);
  // Also clear legacy localStorage just in case of inconsistency
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  throw redirect({ to: "/", replace: true });
};

/**
 * Guard for routes that require an authenticated PGBO agent.
 */
export function requireAuth() {
  const token = store.get(authTokenAtom) ?? getFromStorage<string>("token");
  const user =
    store.get(authUserAtom) ?? getFromStorage<Record<string, any>>("user");

  if (!token || !user) {
    clearAuthAndRedirect();
  }

  try {
    // Check role and activation status
    const isPGBO = user?.role === "pgbo";
    const isActive = user?.is_active === 1 || user?.is_active === true;

    if (!isPGBO || !isActive) {
      clearAuthAndRedirect();
    }

    return { user, token };
  } catch (err) {
    clearAuthAndRedirect();
  }
}

/**
 * Guard for routes that should only be accessible by guests.
 */
export function requireGuest() {
  const token = store.get(authTokenAtom) ?? getFromStorage<string>("token");
  if (token) {
    throw redirect({ to: "/overview", replace: true });
  }
}

/**
 * --- ADMIN AUTH HELPERS ---
 */

export const clearAdminAndRedirect = () => {
  store.set(adminTokenAtom, null);
  store.set(adminUserAtom, null);
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  throw redirect({ to: "/admin/login", replace: true });
};

export function requireAdminAuth() {
  const token =
    store.get(adminTokenAtom) ?? getFromStorage<string>("admin_token");
  const user =
    store.get(adminUserAtom) ??
    getFromStorage<Record<string, any>>("admin_user");

  if (!token || !user) {
    clearAdminAndRedirect();
  }

  try {
    if (user?.role !== "admin") {
      clearAdminAndRedirect();
    }
    return { user, token };
  } catch {
    clearAdminAndRedirect();
  }
}

export function requireAdminGuest() {
  const token =
    store.get(adminTokenAtom) ?? getFromStorage<string>("admin_token");
  if (token) {
    throw redirect({ to: "/admin", replace: true });
  }
}
