import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      // Pertimbangkan untuk mengaktifkan ini jika ada halaman statis
      // untuk mempercepat LCP secara drastis
      prerender: {
        enabled: false, 
      },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // PERBAIKAN: Menggunakan manualChunks untuk Rollup/Vite
        codeSplitting: {
          groups: [
            {
              name: "vendor-tanstack-table",
              test: (id) => id.includes("tanstack") && id.includes("table"),
            },
            {
              name: "vendor-tanstack-query",
              test: (id) => id.includes("tanstack") && id.includes("query"),
            },
            {
              name: "vendor-tanstack-router",
              test: (id) =>
                id.includes("tanstack") &&
                (id.includes("router") ||
                  id.includes("start") ||
                  id.includes("history") ||
                  id.includes("router-plugin")),
            },
            {
              name: "vendor-react-core",
              test: (id) =>
                id.includes("node_modules") &&
                (id.includes("react/") ||
                  id.includes("react-dom/") ||
                  id.includes("scheduler/")),
            },
            {
              name: "vendor-ui",
              test: (id) =>
                id.includes("node_modules") &&
                (id.includes("lucide-react") ||
                  id.includes("motion") ||
                  id.includes("embla-carousel") ||
                  id.includes("@base-ui") ||
                  id.includes("@radix-ui")),
            },
          ],
        },
      },
    },
  },
  ssr: {
    noExternal: ["@tanstack/react-start-server", "@tanstack/react-start"],
    resolve: {
      conditions: ["import", "module", "node", "default"],
      externalConditions: ["import", "module", "node", "default"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      components: path.resolve(__dirname, "./src/components"),
      ui: path.resolve(__dirname, "./src/components/ui"),
      lib: path.resolve(__dirname, "./src/lib"),
      hooks: path.resolve(__dirname, "./src/hooks"),
    },
    conditions: ["import", "module", "browser", "default"],
  },
  server: {
    proxy: {
      "/api-proxy": {
        target: "https://publicgold.co.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
      "/api-proxy-my": {
        target: "https://publicgold.com.my",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy-my/, ""),
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});