import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "../lib/queryClient";
import { clearAuthAndRedirect } from "../lib/auth";
import { settingsQueryOptions } from "../lib/queryOptions";

export const Route = createFileRoute("/_auth/settings")({
  loader: async () => {
    try {
      await queryClient.ensureQueryData(settingsQueryOptions());
    } catch {
      // Break redirect loop: clear session if data fails to load
      queryClient.clear();
      clearAuthAndRedirect();
    }
  },
});
