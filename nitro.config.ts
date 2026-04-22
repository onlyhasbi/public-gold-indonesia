import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
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
