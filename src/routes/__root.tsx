import {
  Outlet,
  useLocation,
  useMatches,
  useRouterState,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Topbar from "@/layout/topbar";
import { ToastProvider } from "@/components/toast";

import NotFound from "@/components/not_found";
import { ScrollUnlocker } from "@/components/ScrollUnlocker";
import { agentQueryOptions } from "@/lib/queryOptions";
import i18n from "i18next";
import appCss from "@/styles.css?url";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

import { getAuthToken } from "@/lib/auth";

import { RootError } from "@/components/root_error";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth?: { token: string | null; adminToken: string | null };
}>()({
  beforeLoad: async () => {
    // Determine auth status once at the root level.
    const token = getAuthToken(false);
    const adminToken = getAuthToken(true);

    return {
      auth: { token, adminToken },
    };
  },
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "5G Associates Public Gold Indonesia" },
      { name: "theme-color", content: "#dc2626" },
      {
        name: "description",
        content:
          "5G x G100 adalah Network bisnis yang terbesar di Public Gold Indonesia",
      },
      {
        name: "keywords",
        content:
          "public gold, public gold indonesia, 5g associates, 5g associates indonesia, emas",
      },
      { name: "author", content: "5G Associates" },
      { property: "og:title", content: "5G Associates Public Gold Indonesia" },
      {
        property: "og:description",
        content:
          "5G x G100 adalah Network bisnis yang terbesar di Public Gold Indonesia",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mypublicgold.id/" },
      { property: "og:image", content: "https://mypublicgold.id/me.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "5G Associates Public Gold Indonesia" },
      {
        name: "twitter:description",
        content:
          "5G x G100 adalah Network bisnis yang terbesar di Public Gold Indonesia",
      },
      { name: "twitter:image", content: "https://mypublicgold.id/me.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/webp", href: "/logo.webp" },
      { rel: "apple-touch-icon", href: "/logo192.png" },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "preconnect",
        href: "https://res.cloudinary.com",
        crossOrigin: "anonymous" as const,
      },
      {
        rel: "preconnect",
        href: "https://be-public-gold-indonesia.vercel.app",
        crossOrigin: "anonymous" as const,
      },
      { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
      { rel: "dns-prefetch", href: "https://my-cdn.publicgold.com.my" },
    ],
  }),
});

function RootDocument({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  return (
    <html lang={lang}>
      <head>
        <style>
          {`
            body {
              margin: 0;
              background-color: #f8fafc;
            }
          `}
        </style>
        <HeadContent />
      </head>
      <body>
        <div id="app">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const matches = useMatches();
  const routerState = useRouterState();

  const lang = i18n.language || "id";

  const dashboardPaths = [
    "/register",
    "/petunjuk",
    "/overview",
    "/settings",
    "/admin",
    "/legal",
  ];
  const isStandalone =
    dashboardPaths.some((p) => location.pathname.startsWith(p)) ||
    location.pathname === "/";
  const isNotFound =
    (matches.length === 1 && location.pathname !== "/") ||
    matches.some((m) => m.status === "notFound") ||
    routerState.statusCode === 404;
  const hideTopbar = isStandalone || isNotFound;

  const pgboMatch = matches.find((m) => m.routeId === "/$pgcode");
  const pgcode = (pgboMatch?.params as any)?.pgcode;
  const pgbo = pgcode
    ? queryClient.getQueryData(agentQueryOptions(pgcode).queryKey)
    : null;

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument lang={lang}>
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
      </RootDocument>
    </QueryClientProvider>
  );
}
