import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Topbar from "../layout/topbar";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { i18n } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <Topbar />
      <main key={i18n.language}>
        <Outlet />
      </main>
      <TanStackRouterDevtools position="bottom-right" />
    </QueryClientProvider>
  );
}
