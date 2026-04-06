import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet, useLocation, useMatches, useRouterState } from "@tanstack/react-router";
import React from "react";
import Topbar from "../layout/topbar";
import { useTranslation } from "react-i18next";
import { useIPLanguage } from "../hooks/useIPLanguage";
import { useResourceReady } from "../hooks/useResourceReady";
import { ToastProvider } from "../components/toast";
import { queryClient } from "../lib/queryClient";
import NotFound from "../components/not_found";

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
  const { i18n } = useTranslation();
  const location = useLocation();
  const matches = useMatches();
  const routerState = useRouterState();
  const dashboardPaths = ["/register", "/petunjuk", "/signin", "/signup", "/overview", "/settings", "/admin"];
  const isStandalone = dashboardPaths.some((p) => location.pathname.startsWith(p)) || location.pathname === "/";
  const isNotFound = (matches.length === 1 && location.pathname !== "/") || routerState.statusCode === 404;
  const hideTopbar = isStandalone || isNotFound;

  const pgboMatch = matches.find(m => m.routeId === "/$pgcode");
  const pgbo = (pgboMatch?.loaderData as any)?.pgbo;

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {!hideTopbar && <Topbar pgbo={pgbo} />}
        <main key={i18n.language}>
          <Outlet />
        </main>
        <React.Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </React.Suspense>
      </ToastProvider>
    </QueryClientProvider>
  );
}
