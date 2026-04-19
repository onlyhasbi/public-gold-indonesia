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
      tanstackRouter({ autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
      // Gzip compression for static assets
      isProduction && compression({ algorithm: "gzip", ext: ".gz" }),
      // Brotli compression for modern browsers
      isProduction && compression({ algorithm: "brotliCompress", ext: ".br" }),
      isProduction &&
        ViteImageOptimizer({
          webp: { quality: 80 },
          avif: { quality: 70 },
          svg: {
            multipass: true,
            plugins: [
              {
                name: "preset-default",
                params: {
                  overrides: { cleanupIds: false, removeViewBox: false },
                },
              },
            ],
          },
        }),
      // Visualizer helps audit bundle sizes in production
      isProduction &&
        visualizer({
          filename: "stats.html",
          gzipSize: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
    },
    build: {
      emptyOutDir: true,
      manifest: true, // Required for backend-frontend synchronization
      modulePreload: {
        polyfill: true, // Ensures stable chunk loading across all browsers
      },
      target: "es2022", // Vercel-Stable target (avoid esnext for better compatibility)
      minify: "esbuild",
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // Group core libraries together for deterministic initialization
              // This prevents 'undefined' reference crashes in production
              if (
                id.match(
                  /node_modules\/(react|react-dom|@tanstack\/react-router|jotai|@tanstack\/react-query)/,
                )
              ) {
                return "vendor-core";
              }
              if (id.includes("lucide-react") || id.includes("motion")) {
                return "vendor-ui";
              }
              return "vendor-utils";
            }
          },
        },
      },
    },
    esbuild: {
      // Production logs removal
      drop: isProduction ? ["console", "debugger"] : [],
    },
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
