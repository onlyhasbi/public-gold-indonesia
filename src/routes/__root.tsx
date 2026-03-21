import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import React from "react";
import Topbar from "../layout/topbar";
import { useTranslation } from "react-i18next";

const TanStackRouterDevtools =
  import.meta.env.PROD
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isStandalone = location.pathname.startsWith("/register");

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: isStandalone ? "none" : "block" }}>
        <Topbar />
      </div>
      <main key={i18n.language}>
        <Outlet />
      </main>
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </QueryClientProvider>
  );
}
