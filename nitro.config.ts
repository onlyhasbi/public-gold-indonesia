import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  routeRules: {
    "/**": {
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Strict-Transport-Security":
          "max-age=31536000; includeSubDomains; preload",
      },
    },
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
