import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdminAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    // Escape hatch for login/signup to prevent redirect loops
    if (
      location.pathname === "/admin/login" ||
      location.pathname === "/admin/signup"
    ) {
      return;
    }
    return requireAdminAuth();
  },
  component: () => <AdminLayout />,
});

function AdminLayout() {
  return <Outlet />;
}
