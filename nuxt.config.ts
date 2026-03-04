export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',
  app: {
    head: {
      title: 'Kander',
      link: [
        {rel: 'icon', type: 'image/x-icon', href: 'kander_favicon.ico'},
        {rel: 'apple-touch-icon', href: '/images/kander_512.png', sizes: '512x512'},
      ],
      meta: [
        {name: "theme-color", content: '#ffffff', media: "(prefers-color-scheme: light)"},
        {name: "theme-color", content: '#171717', media: "(prefers-color-scheme: dark)"},
        {
          name: 'description',
          content: 'A reliable order management solution for SMEs powered by Nuxt 4. Kanbanize your workflow starting today.'
        }
      ],
    },
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
  icon: {
    mode: "css",
    cssLayer: "base",
    clientBundle: {
      scan: true
    }
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
        'quinary',
        'info',
        'success',
        'warning',
        'error'
      ]
    }
  },
  fonts: {
    processCSSVariables: true,
    families: [
      {name: 'Inter', provider: 'google', weights: [200, 400, 600, 700, 900]},
    ],
  },
  runtimeConfig: {
    resendKey: '',
    jwtSecret: ''
  }
})
