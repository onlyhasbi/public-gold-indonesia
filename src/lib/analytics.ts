import { api } from "./api";

/**
 * Tracks a public analytic event for a specific agent page.
 * Uses navigator.sendBeacon as primary method for reliability —
 * it guarantees delivery even when the page is being navigated away
 * or backgrounded (e.g., after clicking a WhatsApp link on mobile).
 * Falls back to axios if sendBeacon is unavailable.
 *
 * @param pageid The unique identifier for the agent's page
 * @param event The type of event (e.g., 'visitor', 'whatsapp_click')
 */
export const trackEvent = async (pageid: string | undefined | null, event: string) => {
  if (!pageid) return null;

  const payload = { pageid, event };

  // Primary: sendBeacon — reliable even during page navigation/backgrounding
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    try {
      const baseURL = api.defaults.baseURL;
      const url = `${baseURL}/public/analytics`;
      // Use text/plain to avoid CORS preflight (sendBeacon can't handle preflight)
      // Backend must parse JSON from text/plain body
      const blob = new Blob([JSON.stringify(payload)], { type: "text/plain" });
      const queued = navigator.sendBeacon(url, blob);
      if (queued) return { success: true };
    } catch {
      // sendBeacon failed, fall through to axios
    }
  }

  // Fallback: axios — for environments without sendBeacon support
  try {
    const res = await api.post("/public/analytics", payload);
    return res.data;
  } catch (error) {
    console.error(`[Analytics] Failed to track ${event}:`, error);
    return null;
  }
};
