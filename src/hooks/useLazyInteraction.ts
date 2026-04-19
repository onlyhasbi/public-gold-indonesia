import { useState, useEffect } from "react";

/**
 * Hook to defer non-critical actions (like heavy network fetches)
 * until the user interacts with the page (scroll, mouse move, touch)
 * or a specific timeout has passed. This is extremely useful for
 * optimizing the Largest Contentful Paint (LCP) metric.
 *
 * @param timeoutMs Fallback timeout before triggering automatically (default 3000ms)
 * @returns boolean True if an interaction occurred or timeout passed
 */
export function useLazyInteraction(timeoutMs = 3000) {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Tactics for LCP: Defer non-critical network requests
    const handleInitialInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("scroll", handleInitialInteraction);
      window.removeEventListener("mousemove", handleInitialInteraction);
      window.removeEventListener("touchstart", handleInitialInteraction);
    };

    window.addEventListener("scroll", handleInitialInteraction, { once: true });
    window.addEventListener("mousemove", handleInitialInteraction, {
      once: true,
    });
    window.addEventListener("touchstart", handleInitialInteraction, {
      once: true,
    });

    // Fallback: Trigger anyway after timeout if user does nothing
    const fallbackTimer = setTimeout(() => {
      setHasInteracted(true);
    }, timeoutMs);

    return () => {
      window.removeEventListener("scroll", handleInitialInteraction);
      window.removeEventListener("mousemove", handleInitialInteraction);
      window.removeEventListener("touchstart", handleInitialInteraction);
      clearTimeout(fallbackTimer);
    };
  }, [timeoutMs]);

  return hasInteracted;
}
