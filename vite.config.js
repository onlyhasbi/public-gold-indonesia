import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { visualizer } from "rollup-plugin-visualizer";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    base: "/",
    plugins: [
      // Enable router transformations with auto code splitting for routes
      viteReact(),
      tailwindcss()],
    server: {
      hmr: true,
      proxy: {
        "/api-proxy-my": {
          target: "https://publicgold.com.my",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api-proxy-my/, ""),
        },
        "/api-proxy": {
          target: "https://publicgold.co.id",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api-proxy/, ""),
        },
      },
    },
  };
});
