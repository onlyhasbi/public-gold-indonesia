import { createFileRoute } from "@tanstack/react-router";

export type RegisterSearch = {
  type?: "dewasa" | "anak";
  ref?: string;
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => {
    return {
      type: search.type === "anak" ? "anak" : "dewasa",
      ref: search.ref as string | undefined,
    };
  },
});
