export default defineNuxtConfig({
  ssr: false,

  nitro: {
    preset: 'static'
  },

  devtools: { enabled: false },
  
  modules: ['@nuxt/ui', '@pinia/nuxt'],

  // Configuration du module tailwindcss pour éviter les problèmes avec jiti
  tailwindcss: {
    exposeConfig: false,
    injectPosition: 'first',
    viewer: false,
  },

  // Configuration des composants
  components: {
    global: true,
    dirs: ['~/components']
  },

  // Configuration de build
  build: {
    transpile: ['@nuxt/ui']
  },

  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia']
    },
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug'],
        },
      },
      minify: 'terser',
      // Isoler les libs lourdes dans leurs propres chunks — téléchargés seulement si utilisés
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/xlsx')) return 'vendor-xlsx'
            if (id.includes('node_modules/jspdf')) return 'vendor-jspdf'
            if (id.includes('node_modules/jszip')) return 'vendor-jszip'
            if (id.includes('node_modules/jsbarcode')) return 'vendor-jsbarcode'
            if (id.includes('node_modules/qrcode')) return 'vendor-qrcode'
            if (id.includes('node_modules/quagga')) return 'vendor-quagga'
            if (id.includes('node_modules/@nuxt/ui') || id.includes('node_modules/@headlessui')) return 'vendor-ui'
            if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) return 'vendor-vue'
          }
        }
      }
    },
  },

  app: {
    head: {
      title: 'Mura Storage - Logiciel de Gestion de Stock et Facturation Multi-Entrepôts',
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Mura Storage : Solution complète de gestion de stock, inventaire et facturation pour entreprises. Multi-entrepôts, codes-barres, alertes, transferts. Essai gratuit 14 jours. Sécurité RGPD, support 24/7. Optimisez vos opérations avec Groupe Mura.' 
        },
        { 
          name: 'keywords', 
          content: 'gestion de stock, logiciel stock, inventaire, facturation, gestion entrepôt, multi-entrepôts, codes-barres, transfert stock, alertes stock, Mura Storage, Groupe Mura, logiciel gestion entreprise, ERP stock, suivi stock, gestion inventaire, logiciel facturation, gestion produits, stock management, inventory management, warehouse management, point de vente, POS, caisse enregistreuse, gestion clients, gestion fournisseurs, gestion commandes, rapports stock, analyse stock, optimisation stock, réapprovisionnement, wilfried tayou, Cameroun, Afrique' 
        },
        { name: 'author', content: 'Groupe Mura' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'language', content: 'French' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'rating', content: 'general' },
        { name: 'theme-color', content: '#10b981' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Mura Storage' },
        { name: 'application-name', content: 'Mura Storage' },
        { property: 'og:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { property: 'og:description', content: 'Solution complète de gestion de stock, inventaire et facturation multi-entrepôts. Essai gratuit 90 jours.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://murastorage.com' },
        { property: 'og:image', content: 'https://murastorage.com/img/logo-mura-storage.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Mura Storage' },
        { property: 'og:locale', content: 'fr_FR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { name: 'twitter:description', content: 'Solution complète de gestion de stock, inventaire et facturation multi-entrepôts. Essai gratuit 90 jours.' },
        { name: 'twitter:image', content: 'https://murastorage.com/img/logo-mura-storage.png' },
        { name: 'google-site-verification', content: '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/logo-mura-storage.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/logo-mura-storage.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'canonical', href: 'https://murastorage.com' },
        // Préconnexion API pour réduire la latence au premier appel
        { rel: 'preconnect', href: 'https://murastorage.pythonanywhere.com', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://murastorage.pythonanywhere.com' },
        // Inter — police professionnelle SaaS (self-served via Google Fonts)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css', '~/assets/css/transitions.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-07-01'
})
