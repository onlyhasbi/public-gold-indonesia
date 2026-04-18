import { redirect } from '@tanstack/react-router'
import { getDefaultStore } from 'jotai'
import { authUserAtom, authTokenAtom, adminUserAtom, adminTokenAtom } from '../store/authStore'

const store = getDefaultStore()

/**
 * Clears session data and redirects to login.
 */
export const clearAuthAndRedirect = () => {
  store.set(authTokenAtom, null)
  store.set(authUserAtom, null)
  throw redirect({ to: '/', replace: true });
};

/**
 * Guard for routes that require an authenticated PGBO agent.
 */
export function requireAuth() {
  const token = store.get(authTokenAtom);
  const user = store.get(authUserAtom);

  if (!token || !user) {
    clearAuthAndRedirect();
  }

  try {
    // Check role and activation status
    const isPGBO = user?.role === 'pgbo';
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
  const token = store.get(authTokenAtom);
  if (token) {
    throw redirect({ to: '/overview', replace: true });
  }
}

/**
 * --- ADMIN AUTH HELPERS ---
 */

export const clearAdminAndRedirect = () => {
  store.set(adminTokenAtom, null)
  store.set(adminUserAtom, null)
  throw redirect({ to: '/admin/login', replace: true });
};

export function requireAdminAuth() {
  const token = store.get(adminTokenAtom);
  const user = store.get(adminUserAtom);

  if (!token || !user) {
    clearAdminAndRedirect();
  }

  try {
    if (user?.role !== 'admin') {
      clearAdminAndRedirect();
    }
    return { user, token };
  } catch {
    clearAdminAndRedirect();
  }
}

export function requireAdminGuest() {
  const token = store.get(adminTokenAtom);
  if (token) {
    throw redirect({ to: '/admin', replace: true });
  }
}
