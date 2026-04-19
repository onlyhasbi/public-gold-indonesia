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
      target: "es2022", // Stable modern target
      assetsInlineLimit: 8192,
      // PERFORMANCE: Using Terser for superior bundle compression compared to esbuild
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ["console.log"] : [],
          passes: 2, // Two passes for maximum optimization
          // IMPORTANT: toplevel must be false to prevent React 19 symbol crashes
          toplevel: false,
        },
        format: {
          comments: false,
        },
        mangle: {
          safari10: true, // Compatibility for legacy mobile browsers
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // CONSOLIDATED VENDOR STRATEGY:
              // Group all libraries into a single solid vendor chunk.
              // This drastically reduces HTTP request count from 89+ to <10,
              // which is the single most important factor for mobile PageSpeed score.
              return "vendor";
            }
          },
        },
      },
    },
    esbuild: {
      // Production logs removal (handled by Terser, but kept here for dev sync)
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
