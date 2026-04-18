import { useState, useEffect, useCallback } from "react";

export function useResourceReady() {
  const [isReady, setIsReady] = useState(false);

  const dismissLoader = useCallback(() => {
    const loader = document.getElementById("initial-loader");
    if (loader && loader.style.display !== "none") {
      loader.classList.add("fade-out");
      setTimeout(() => loader.remove(), 600);
    }
  }, []);

  useEffect(() => {
    // No more image preloading! Just dismiss the loader once React has safely mounted
    // and layout effects are done painting.
    requestAnimationFrame(() => {
      setIsReady(true);
      dismissLoader();
    });
  }, [dismissLoader]);

  return isReady;
}
