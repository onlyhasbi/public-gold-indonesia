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
    modulePreload: false, // Mematikan preload agar tidak mencekik gambar LCP di 3G
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-tanstack-table",
              test: (id: string) =>
                id.includes("tanstack") && id.includes("table"),
              priority: 20,
            },
            {
              name: "vendor-tanstack-query",
              test: (id: string) =>
                id.includes("tanstack") && id.includes("query"),
              priority: 15,
            },
            {
              name: "vendor-tanstack-router",
              test: (id: string) =>
                id.includes("tanstack") &&
                (id.includes("router") ||
                  id.includes("start") ||
                  id.includes("history") ||
                  id.includes("router-plugin")),
              priority: 15,
            },
            {
              name: "vendor-react-core",
              test: (id: string) =>
                id.includes("node_modules/react/") ||
                id.includes("node_modules/react-dom/") ||
                id.includes("node_modules/scheduler/"),
              priority: 10,
            },
            {
              name: "vendor-ui",
              test: (id: string) =>
                id.includes("node_modules") &&
                (id.includes("lucide-react") ||
                  id.includes("motion") ||
                  id.includes("embla-carousel") ||
                  id.includes("@base-ui") ||
                  id.includes("@radix-ui")),
              priority: 10,
            },
            {
              name: "vendor-i18n",
              test: (id: string) =>
                id.includes("node_modules") &&
                (id.includes("i18next") || id.includes("react-i18next")),
              priority: 10,
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
