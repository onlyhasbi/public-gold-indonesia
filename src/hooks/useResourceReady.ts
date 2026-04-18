import { useState, useEffect, useCallback } from "react";

/**
 * Critical images that must load before showing the website.
 * These are above-the-fold / hero images.
 */
const CRITICAL_IMAGES = ["/logo.svg", "/me.webp", "/5g.webp"];

/**
 * Maximum time (ms) to wait for resources before forcing reveal.
 */
const MAX_WAIT = 6000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't block on failure
    img.src = src;
  });
}

export function useResourceReady() {
  const [isReady, setIsReady] = useState(false);

  const dismissLoader = useCallback(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.classList.add("fade-out");
      setTimeout(() => loader.remove(), 600);
    }
  }, []);

  useEffect(() => {
    // Admin pages don't need the landing page image preload — dismiss immediately
    if (window.location.pathname.startsWith("/admin")) {
      setIsReady(true);
      dismissLoader();
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const loadResources = async () => {
      // Wait for all critical images (with timeout safety)
      await Promise.race([
        Promise.all(CRITICAL_IMAGES.map(preloadImage)),
        new Promise((r) => {
          timeout = setTimeout(r, MAX_WAIT);
        }),
      ]);

      // Wait one more frame to ensure React has painted
      requestAnimationFrame(() => {
        setIsReady(true);
        dismissLoader();
      });
    };

    loadResources();

    return () => clearTimeout(timeout);
  }, [dismissLoader]);

  return isReady;
}
