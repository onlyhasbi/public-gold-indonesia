import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteCompression from "vite-plugin-compression";
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
      tanstackRouter({ autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
      isProduction &&
        viteCompression({
          algorithm: "gzip",
          ext: ".gz",
          threshold: 10240,
        }),
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
      target: ["es2020", "chrome61", "ios11"],
      assetsInlineLimit: 4096,
      // PERFORMANCE: Menggunakan ESBuild minifier menghasilkan proses build 10x-100x lebih cepat dibandingkan Terser
      minify: isProduction ? "terser" : "esbuild",
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug"],
              passes: 2,
              toplevel: false,
            },
            format: { comments: false },
            mangle: { safari10: true },
          }
        : undefined,
    },
    esbuild: {
      // Production logs removal
      drop: isProduction ? ["console", "debugger"] : [],
      legalComments: "none",
      // Mencegah crash simbol pada React 19 yang sebelumnya memerlukan 'toplevel: false' di Terser
      keepNames: true,
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
