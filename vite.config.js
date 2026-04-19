import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { visualizer } from "rollup-plugin-visualizer";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    // Gzip compression for static assets
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    // Brotli compression for modern browsers
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    ViteImageOptimizer({
      webp: { quality: 80 },
      avif: { quality: 70 },
      png: { quality: 80 },
      jpeg: { quality: 80 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupIds: false,
                removeViewBox: false,
              },
            },
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
            },
          },
        ],
      },
    }),
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    transformer: "lightningcss",
  },
  build: {
    emptyOutDir: true,
    manifest: true,
    modulePreload: {
      polyfill: true,
    },
    cssMinify: "lightningcss",
    target: "es2022",
    assetsInlineLimit: 8192,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
        pure_funcs: mode === "production" ? ["console.log"] : [],
        passes: 1,
      },
      toplevel: false,
      module: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Group core libraries together to ensure deterministic initialization
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
            if (id.includes("@base-ui")) {
              return "vendor-base-ui";
            }
            if (id.includes("yup") || id.includes("@hookform")) {
              return "vendor-form";
            }
            if (id.includes("embla-carousel")) {
              return "vendor-carousel";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api-proxy-my": {
        target: "https://publicgold.com.my",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy-my/, ""),
        cookieDomainRewrite: "localhost",
      },
      "/api-proxy": {
        target: "https://publicgold.co.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
        // This helps forward cookies during local dev
        cookieDomainRewrite: "localhost",
      },
    },
  },
  preview: {
    proxy: {
      "/api-proxy-my": {
        target: "https://publicgold.com.my",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy-my/, ""),
        cookieDomainRewrite: "mypublicgold.id",
      },
      "/api-proxy": {
        target: "https://publicgold.co.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
        // Important: match this with your deploy domain to accept cookies
        cookieDomainRewrite: "mypublicgold.id",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
}));
