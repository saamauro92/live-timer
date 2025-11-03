// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/color-mode", "@nuxtjs/google-fonts", "@storyblok/nuxt"],

  devServer: {
    port: 3000,
  },

  // Fix HMR issues in development
  vite: {
    server: {
      hmr: {
        overlay: false,
      },
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
  },

  // Development optimizations
  experimental: {
    payloadExtraction: false,
  },

  // Fix middleware and routing issues
  router: {
    options: {
      strict: false,
    },
  },

  // Source map configuration for better debugging
  sourcemap: {
    server: true,
    client: false,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001",
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      storyblokAccessToken: process.env.NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || "",
      storyblokVersion: process.env.NUXT_PUBLIC_STORYBLOK_VERSION || "draft",
    },
  },

  storyblok: {
    accessToken: process.env.NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || "",
    version: process.env.NUXT_PUBLIC_STORYBLOK_VERSION || "draft",
    apiOptions: {
      region: "us", // or 'eu' based on your Storyblok space region
    },
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
    },
  },

  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
  },

  // Security headers
  nitro: {
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      },
      // Exclude existing routes from catch-all Storyblok handler
      "/login": { prerender: false },
      "/register": { prerender: false },
      "/dashboard": { prerender: false },
      "/billing": { prerender: false },
      "/pricing": { prerender: false },
      "/rooms/**": { prerender: false },
      "/room/**": { prerender: false },
      "/auth/**": { prerender: false },
    },
  },

  // Security headers are handled in nitro configuration above
});
