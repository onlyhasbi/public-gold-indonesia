import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter({ autoCodeSplitting: true }), viteReact(), tailwindcss()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://publicgold.co.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        // This helps forward cookies during local dev
        cookieDomainRewrite: "localhost"
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
  },

});
