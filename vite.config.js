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
      tanstackRouter({ autoCodeSplitting: true }),
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
        "/hasbi": {
          target: "https://mypublicgold.id",
          changeOrigin: true,
          secure: true,
          headers: {
            accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "id,en-US;q=0.9,en;q=0.8",
            dnt: "1",
            priority: "u=0, i",
            "sec-ch-ua":
              '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent":
              "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
          },
        },
      },
    },
  };
});
