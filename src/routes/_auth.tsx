import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth } from '../lib/auth'

const routeOptions = {
  beforeLoad: () => requireAuth(),
  component: AuthLayout,
}

export const Route = createFileRoute('/_auth')(routeOptions)

function AuthLayout() {
  return <Outlet />
}
