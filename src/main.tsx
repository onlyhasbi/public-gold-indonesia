import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./components/not_found";
import { queryClient, hydrationPromise } from "./lib/queryClient";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import reportWebVitals from "./reportWebVitals.ts";
import "./styles.css";
import "./i18n";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultNotFoundComponent: () => (
    <QueryClientProvider client={queryClient}>
      <NotFound />
    </QueryClientProvider>
  ),
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  // CRITICAL: Wait for hydration before rendering the router
  // This prevents race conditions where the auth guard runs with empty cache
  hydrationPromise.then(() => {
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
}

// OPTIMIZATION: Defer performance measuring to avoid blocking the main thread during initial load
if (typeof window !== "undefined") {
  // Use requestIdleCallback if available, fallback to 3s delay
  const deferReport = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => reportWebVitals());
    } else {
      setTimeout(reportWebVitals, 3000);
    }
  };

  if (document.readyState === "complete") {
    deferReport();
  } else {
    window.addEventListener("load", deferReport);
  }
}
