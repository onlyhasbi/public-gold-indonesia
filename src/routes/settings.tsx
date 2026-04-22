import { createFileRoute } from "@tanstack/react-router";
import { createProtectedLoader } from "../lib/auth";
import { settingsQueryOptions } from "../lib/queryOptions";

export const Route = createFileRoute("/settings")({
  loader: async ({ context: { queryClient } }) => {
    return createProtectedLoader({
      queryClient,
      extraQueries: [(c?: string) => settingsQueryOptions(c)],
    });
  },
});
