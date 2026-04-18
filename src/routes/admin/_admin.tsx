import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdminAuth } from "../../lib/auth";

const routeOptions = {
  beforeLoad: () => requireAdminAuth(),
  component: () => <AdminLayout />,
};

export const Route = createFileRoute("/admin/_admin")(routeOptions);

function AdminLayout() {
  return <Outlet />;
}
