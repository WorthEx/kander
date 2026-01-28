export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  }
})
