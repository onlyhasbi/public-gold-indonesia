import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useLocation, useMatches } from "@tanstack/react-router";
import React from "react";
import Topbar from "../layout/topbar";
import { useTranslation } from "react-i18next";
import { useIPLanguage } from "../hooks/useIPLanguage";
import { useResourceReady } from "../hooks/useResourceReady";

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
  useIPLanguage();
  useResourceReady();
  const { i18n } = useTranslation();
  const location = useLocation();
  const matches = useMatches();
  const isStandalone = location.pathname.startsWith("/register") || location.pathname.startsWith("/petunjuk");
  const isNotFound = matches.length === 1 && location.pathname !== "/";
  const hideTopbar = isStandalone || isNotFound;

  return (
    <QueryClientProvider client={queryClient}>
      {!hideTopbar && <Topbar />}
      <main key={i18n.language}>
        <Outlet />
      </main>
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </QueryClientProvider>
  );
}
