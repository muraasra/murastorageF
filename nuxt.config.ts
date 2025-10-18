export default defineNuxtConfig({
  ssr: false, // Désactiver SSR temporairement pour debug

  nitro: {
    preset: 'node-server'
  },

  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt'],

  // Optimisations pour les transitions rapides
  experimental: {
    payloadExtraction: false, // Évite l'extraction de payload pour des transitions plus rapides
    inlineSSRStyles: false,   // Optimise le rendu SSR
  },

  // Configuration des transitions
  router: {
    options: {
      scrollBehaviorType: 'smooth'
    },
    prefetchLinks: true
  },

  // Optimisations de rendu
  render: {
    resourceHints: true,
    http2: {
      push: true,
      pushAssets: (req, res, publicPath, preloadFiles) => {
        return preloadFiles
          .filter(f => f.asType === 'script' && f.file.includes('runtime'))
          .map(f => `<${publicPath}${f.file}>; rel=preload; as=${f.asType}`)
      }
    }
  },

  // Configuration des composants
  components: {
    global: true,
    dirs: ['~/components']
  },

  // Configuration de build optimisée
  build: {
    transpile: ['@nuxt/ui'],
    extractCSS: {
      ignoreOrder: true
    }
  },

  // Configuration Vite pour des builds plus rapides
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            ui: ['@nuxt/ui']
          }
        }
      }
    },
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