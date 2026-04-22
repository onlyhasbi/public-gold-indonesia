import { defineNitroConfig } from "nitro/config";
import path from "path";

export default defineNitroConfig({
  preset: "vercel",
  compressPublicAssets: true,
  alias: {
    "@": path.resolve(__dirname, "./src"),
    components: path.resolve(__dirname, "./src/components"),
    ui: path.resolve(__dirname, "./src/components/ui"),
    lib: path.resolve(__dirname, "./src/lib"),
    hooks: path.resolve(__dirname, "./src/hooks"),
  },
  routeRules: {
    "/sitemap.xml": {
      proxy:
        "https://be-public-gold-indonesia.vercel.app/api/public/sitemap.xml",
    },
    "/api-proxy/**": {
      proxy: "https://publicgold.co.id/**",
    },
    "/api-proxy-my/**": {
      proxy: "https://publicgold.com.my/**",
    },
  },
});
