import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/petunjuk")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    return {
      ref: (search.ref as string) || undefined,
    };
  },
});
