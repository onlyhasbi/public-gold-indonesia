import { api } from "./api";

/**
 * Tracks a public analytic event for a specific agent page.
 * @param pageid The unique identifier for the agent's page
 * @param event The type of event (e.g., 'visitor', 'whatsapp_click')
 */
export const trackEvent = async (pageid: string | undefined | null, event: string) => {
  if (!pageid) return null;
  
  try {
    const res = await api.post('/public/analytics', { pageid, event });
    return res.data;
  } catch (error) {
    // Fail silently to not impact user experience, but log for debugging
    console.error(`[Analytics] Failed to track ${event}:`, error);
    return null;
  }
};
