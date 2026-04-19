import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    base: "/",
    plugins: [
      // REQUIRED: Enable router transformations and route generation
      tanstackRouter(),
      viteReact(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // REQUIRED: Fixes all "@/..." imports used throughout the project
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
      // REQUIRED: Maintain mobile compatibility fix
      target: ["es2017", "chrome61", "ios11"],
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
              if (id.includes("react") || id.includes("scheduler")) {
                return "vendor-core";
              }
              if (id.includes("@tanstack")) {
                return "vendor-tanstack";
              }
              if (id.includes("lucide")) {
                return "vendor-icons";
              }
              if (
                id.includes("motion") ||
                id.includes("framer-motion") ||
                id.includes("@radix-ui") ||
                id.includes("embla-carousel")
              ) {
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
