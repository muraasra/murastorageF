export default defineNuxtConfig({
  ssr: false, // Mode SPA pour éviter les problèmes SSR en production

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: false, // Désactiver le crawl automatique
      ignore: ['/api/**'] // Ignorer les routes API
    }
  },

  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],

  // Optimisations pour les transitions rapides
  experimental: {
    payloadExtraction: false // Évite l'extraction de payload pour des transitions plus rapides
  },

  // Configuration des transitions
  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  // Optimisations de rendu
  render: {
    resourceHints: true
  },

  // Configuration des composants
  components: {
    global: true,
    dirs: ['~/components']
  },

  // Configuration de build optimisée
  build: {
    transpile: ['@nuxt/ui']
  },

  // Configuration Vite simplifiée
  vite: {
    optimizeDeps: {
      include: ['@nuxt/ui']
    }
  },

  app: {
    head: {
      title: 'Gestion de Stock',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Système de gestion de stock et facturation multi-entrepôts' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-05-19'
})