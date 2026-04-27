import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: {
        enabled: false,
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    modulePreload: false,
  },
  ssr: {
    noExternal: ["@tanstack/react-start-server", "@tanstack/react-start"],
    resolve: {
      conditions: ["import", "module", "node", "default"],
      externalConditions: ["import", "module", "node", "default"],
    },
  },
  server: {
    port: 3003,
    strictPort: true,
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "../../packages/ui/src"),
      "@/lib": path.resolve(__dirname, "../../packages/lib/src"),
      "@/hooks": path.resolve(__dirname, "../../packages/hooks/src"),
      "@/schemas": path.resolve(__dirname, "../../packages/schemas/src"),
      "@/constant": path.resolve(__dirname, "../../packages/constant/src"),
      "@/services": path.resolve(__dirname, "../../packages/services/src"),
      "@/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
    },
    conditions: ["import", "module", "browser", "default"],
  },
});
