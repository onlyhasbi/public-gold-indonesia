import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * ScrollUnlocker is a renderless component that monitors route and language changes
 * to forcefully remove any "stuck" scroll locks on the body or html elements.
 *
 * This is a safety net for UI libraries (like Base UI or Radix UI) that might
 * fail to cleanup scroll locks during rapid unmounts or heavy re-renders.
 */
export function ScrollUnlocker() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const unlock = () => {
      // Remove inline styles possibly added by scroll-locking libraries
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("pointer-events");
      document.body.style.removeProperty("padding-right"); // Usually added to prevent layout shift

      document.documentElement.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("pointer-events");
      document.documentElement.style.removeProperty("padding-right");

      // Some libraries use data attributes
      document.body.removeAttribute("data-scroll-locked");
    };

    // Immediate unlock
    unlock();

    // Secondary unlock after a short delay to account for exit animations/portal unmounts
    const timer = setTimeout(unlock, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, i18n.language]);

  return null;
}
