import { redirect } from '@tanstack/react-router'

/**
 * Clears session data and redirects to login.
 */
export const clearAuthAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  throw redirect({ to: '/', replace: true });
};

/**
 * Guard for routes that require an authenticated PGBO agent.
 */
export function requireAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  if (!token || !userStr) {
    clearAuthAndRedirect();
  }

  try {
    const user = JSON.parse(userStr!);
    
    // Check role and activation status (SQLite 0/1 or boolean)
    const isPGBO = user.role === 'pgbo';
    const isActive = user.is_active === 1 || user.is_active === true;

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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    throw redirect({ to: '/overview', replace: true });
  }
}

/**
 * --- ADMIN AUTH HELPERS ---
 */

export const clearAdminAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
  throw redirect({ to: '/admin/login', replace: true });
};

export function requireAdminAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;

  if (!token || !userStr) {
    clearAdminAndRedirect();
  }

  try {
    const user = JSON.parse(userStr!);
    if (user.role !== 'admin') {
      clearAdminAndRedirect();
    }
    return { user, token };
  } catch {
    clearAdminAndRedirect();
  }
}

export function requireAdminGuest() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) {
    throw redirect({ to: '/admin', replace: true });
  }
}
