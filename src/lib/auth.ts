import { redirect } from "@tanstack/react-router";
import { queryClient } from "./queryClient";
import { authDealerQueryOptions, authAdminQueryOptions } from "./queryOptions";

/**
 * DEEP LOGOUT: Purges absolutely all sensitive data from memory and storage.
 * Since we use persistQueryClient, clearing the client will also wipe the storage.
 */
export const purgeAllSessions = () => {
  // Clear React Query Cache and persist to storage
  queryClient.removeQueries({ queryKey: ["auth"] });
  queryClient.clear();
  
  // Explicitly clear specific raw keys just in case of any legacy residuals
  if (typeof window !== "undefined") {
    localStorage.removeItem("PUBLIC_GOLD_QUERY_CACHE");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user");
    localStorage.removeItem("portal_lock_expiry");
  }
};

/**
 * Clears session data and redirects to login.
 */
export const clearAuthAndRedirect = () => {
  purgeAllSessions();
  throw redirect({ to: "/", replace: true });
};

/**
 * Guard for routes that require an authenticated PGBO agent.
 */
export async function requireAuth() {
  try {
    // Ensure we have the latest user data (hydrated from cache or fetched)
    const authData = await queryClient.ensureQueryData(authDealerQueryOptions());

    if (!authData || !authData.token || !authData.user) {
      clearAuthAndRedirect();
      return;
    }

    const { user } = authData;
    // Check role and activation status
    const isPGBO = user.role === "pgbo";
    const isActive = user.is_active === 1 || user.is_active === true;

    if (!isPGBO || !isActive) {
      clearAuthAndRedirect();
      return;
    }

    return authData;
  } catch (err) {
    console.error("Auth Guard Error:", err);
    clearAuthAndRedirect();
  }
}

/**
 * Guard for routes that should only be accessible by guests.
 */
export function requireGuest() {
  const authData = queryClient.getQueryData<any>(["auth", "dealer"]);

  // If data exists in cache (hydrated from persistence), redirect to dashboard
  if (authData?.token && authData?.user) {
    throw redirect({ to: "/overview", replace: true });
  }
}

/**
 * --- ADMIN AUTH HELPERS ---
 */

export const clearAdminAndRedirect = () => {
  purgeAllSessions();
  throw redirect({ to: "/admin/login", replace: true });
};

export async function requireAdminAuth() {
  try {
    // Ensure we have the latest admin data
    const authData = await queryClient.ensureQueryData(authAdminQueryOptions());

    if (!authData || !authData.token || !authData.user) {
      clearAdminAndRedirect();
      return;
    }

    if (authData.user.role !== "admin") {
      clearAdminAndRedirect();
      return;
    }
    return authData;
  } catch (err) {
    console.error("Admin Auth Guard Error:", err);
    clearAdminAndRedirect();
  }
}

export function requireAdminGuest() {
  const authData = queryClient.getQueryData<any>(["auth", "admin"]);

  if (authData?.token && authData?.user) {
    throw redirect({ to: "/admin", replace: true });
  }
}
