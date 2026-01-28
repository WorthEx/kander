export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },
  icon: {
    mode: "css",
    cssLayer: "base",
    clientBundle: {
      scan: true
    }
  },
  fonts: {
    processCSSVariables: true,
    families: [
      {name: 'Open Sans', provider: 'google', weights: [200, 400, 600, 700, 900]},
    ],
  },
  pwa: {
    includeManifestIcons: true,
    includeAssets: ["favicon.ico", "/images/kander_512.png", "/images/kander_192.png"],
    strategies: "generateSW",
    registerType: "autoUpdate",
    manifest: {
      name: 'Kander',
      short_name: 'Kander',
      description: 'A reliable solution for order management powered by Nuxt 4.',
      icons: [
        {
          src: '/images/kander_192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/images/kander_512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      start_url: "/",
      display: "standalone",
      id: "/",
    },
    workbox: {
      navigateFallback: '/',
    },
    devOptions: {
      enabled: true,
    },
  },
})
