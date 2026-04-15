import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useLocation, useMatches, useRouterState } from "@tanstack/react-router";
import React from "react";
import Topbar from "../layout/topbar";
import { useIPLanguage } from "../hooks/useIPLanguage";
import { useResourceReady } from "../hooks/useResourceReady";
import { ToastProvider } from "../components/toast";
import { queryClient } from "../lib/queryClient";
import NotFound from "../components/not_found";
import { ScrollUnlocker } from "../components/ScrollUnlocker";
import { agentQueryOptions } from "../lib/queryOptions";

const TanStackRouterDevtools =
  import.meta.env.PROD
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  useIPLanguage();
  useResourceReady();
  const location = useLocation();
  const matches = useMatches();
  const routerState = useRouterState();
  const dashboardPaths = ["/register", "/petunjuk", "/overview", "/settings", "/admin", "/legal"];
  const isStandalone = dashboardPaths.some((p) => location.pathname.startsWith(p)) || location.pathname === "/";
  const isNotFound = (matches.length === 1 && location.pathname !== "/") || routerState.statusCode === 404;
  const hideTopbar = isStandalone || isNotFound;

  const pgboMatch = matches.find(m => m.routeId === "/$pgcode");
  const pgcode = (pgboMatch?.params as any)?.pgcode;
  const pgbo = pgcode ? queryClient.getQueryData(agentQueryOptions(pgcode).queryKey) : null;

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ScrollUnlocker />
        {!hideTopbar && <Topbar pgbo={pgbo} />}
        <main>
          <Outlet />
        </main>
        <React.Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </React.Suspense>
      </ToastProvider>
    </QueryClientProvider>
  );
}
