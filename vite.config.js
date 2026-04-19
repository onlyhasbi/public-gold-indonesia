import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { visualizer } from "rollup-plugin-visualizer";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    base: "/",
    plugins: [
      tanstackRouter({ autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
      isProduction && compression({ algorithm: "gzip", ext: ".gz" }),
      isProduction && compression({ algorithm: "brotliCompress", ext: ".br" }),
      isProduction && ViteImageOptimizer({
        webp: { quality: 80 },
        avif: { quality: 70 },
        svg: {
          multipass: true,
          plugins: [
            { name: "preset-default", params: { overrides: { cleanupIds: false, removeViewBox: false } } },
          ],
        },
      }),
      // Visualizer membantu melihat ukuran bundle saat menggunakan Bun
      isProduction && visualizer({
        filename: "stats.html",
        gzipSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Bun sangat cepat dalam resolusi modul, pastikan ekstensi ini diprioritaskan
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
    },
    build: {
      emptyOutDir: true,
      target: "esnext", // Bun mendukung fitur JS terbaru, esnext lebih optimal
      minify: "esbuild",
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-core";
              if (id.includes("@tanstack")) return "vendor-tanstack";
              return "vendor-utils";
            }
          },
        },
      },
    },
    esbuild: {
      // Bun/Esbuild akan menghapus log di production
      drop: isProduction ? ["console", "debugger"] : [],
      // Mengoptimalkan JSX untuk Bun
      jsxSideEffects: false,
    },
    server: {
      // Bun sangat cepat dalam HMR (Hot Module Replacement)
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
