export default defineNuxtConfig({
  ssr: false, // Mode SPA pour Netlify

  nitro: {
    preset: 'static' // Preset statique pour Netlify
  },

  // Désactiver les devtools en production
  devtools: { enabled: process.env.NODE_ENV === 'development' },
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
    extractCSS: {
      ignoreOrder: true
    }
  },

  // Configuration Vite pour les performances SEO
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
    }
  },

  // Configuration SEO et performances
  nitro: {
    preset: 'static',
    compressPublicAssets: true,
    minify: true
  },

  app: {
    head: {
      title: 'Mura Storage - Logiciel de Gestion de Stock Professionnel',
      titleTemplate: '%s | Mura Storage',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Mura Storage - Solution complète de gestion de stock et inventaire pour entreprises. Optimisez vos opérations avec notre logiciel moderne et sécurisé.' },
        { name: 'keywords', content: 'gestion stock, inventaire, logiciel stock, Mura Storage, entreprise, optimisation, RGPD' },
        { name: 'author', content: 'Groupe Mura' },
        { name: 'robots', content: 'index, follow' },
        { name: 'language', content: 'fr' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'google-site-verification', content: '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA' },
        
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mura Storage' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:url', content: 'https://murastorage.netlify.app' },
        { property: 'og:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { property: 'og:description', content: 'Solution complète de gestion de stock et inventaire pour entreprises. Optimisez vos opérations avec notre logiciel moderne et sécurisé.' },
        { property: 'og:image', content: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@MuraStorage' },
        { name: 'twitter:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { name: 'twitter:description', content: 'Solution complète de gestion de stock et inventaire pour entreprises.' },
        { name: 'twitter:image', content: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png' },
        
        // Additional SEO
        { name: 'theme-color', content: '#10B981' },
        { name: 'msapplication-TileColor', content: '#10B981' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Mura Storage' }
      ],
      link: [
        { rel: 'canonical', href: 'https://murastorage.netlify.app' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
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