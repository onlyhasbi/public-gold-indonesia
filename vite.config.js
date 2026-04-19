import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
    },
    build: {
      // REQUIRED: Maintain mobile compatibility fix
      target: ["es2020", "safari14"],
      emptyOutDir: true,
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
