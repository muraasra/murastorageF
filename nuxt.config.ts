export default defineNuxtConfig({
  ssr: false,

  nitro: {
    preset: 'static'
  },

  devtools: { enabled: true },
  
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
        { property: 'og:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { property: 'og:description', content: 'Solution complète de gestion de stock, inventaire et facturation multi-entrepôts. Essai gratuit 14 jours.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://murastorage.netlify.app' },
        { property: 'og:image', content: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Mura Storage' },
        { property: 'og:locale', content: 'fr_FR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mura Storage - Logiciel de Gestion de Stock Professionnel' },
        { name: 'twitter:description', content: 'Solution complète de gestion de stock, inventaire et facturation multi-entrepôts. Essai gratuit 14 jours.' },
        { name: 'twitter:image', content: 'https://murastorage.netlify.app/img/og-image-MuraSrorage.png' },
        { name: 'google-site-verification', content: '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/og-image-MuraSrorage.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/og-image-MuraSrorage.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://murastorage.netlify.app' }
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
