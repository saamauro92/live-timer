// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts'
  ],

  devServer: {
    port: 3000
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    }
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },

  // Security headers
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
            ? 'https://yourdomain.com' 
            : '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    }
  },

  // Security configuration
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? 'require-corp' : false
    }
  }
})
