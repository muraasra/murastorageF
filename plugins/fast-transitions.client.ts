// Plugin pour optimiser les transitions globales
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return

  // Configuration des transitions globales
  const router = useRouter()
  
  // Optimiser les transitions de route
  router.beforeEach((to, from, next) => {
    // Précharger les composants de la page de destination
    if (to.matched.length > 0) {
      const component = to.matched[0].components?.default
      if (component && typeof component === 'function') {
        // Précharger le composant
        component().catch(() => {
          // Ignorer les erreurs de préchargement
        })
      }
    }
    
    next()
  })

  // Optimiser les transitions après navigation
  router.afterEach((to, from) => {
    // Scroll vers le haut de la page
    if (process.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })

  // Précharger les pages importantes au démarrage
  if (process.client) {
    const importantPages = [
      '/user',
      '/facturation',
      '/listes-factures',
      '/mouvements-stock',
      '/stock-produit'
    ]

    // Précharger après un délai pour ne pas bloquer le chargement initial
    setTimeout(() => {
      importantPages.forEach(async (path) => {
        try {
          await router.resolve(path)
        } catch (error) {
          // Ignorer les erreurs de préchargement
        }
      })
    }, 2000)
  }

  // Optimiser les performances CSS
  if (process.client) {
    // Ajouter des styles CSS optimisés
    const style = document.createElement('style')
    style.textContent = `
      /* Transitions optimisées */
      * {
        transition-duration: 150ms !important;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Optimisations pour les animations */
      .animate-spin {
        animation-duration: 1s;
      }

      .animate-pulse {
        animation-duration: 2s;
      }

      /* Optimisations pour les transitions de page */
      .page-transition-enter-active,
      .page-transition-leave-active {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .page-transition-enter-from {
        opacity: 0;
        transform: translateX(10px);
      }

      .page-transition-leave-to {
        opacity: 0;
        transform: translateX(-10px);
      }

      /* Optimisations pour les composants */
      .fast-transition {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Optimisations pour les liens */
      a, button {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Optimisations pour les formulaires */
      input, select, textarea {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
    `
    document.head.appendChild(style)
  }

  // Prefetch after idle
  requestIdleCallback?.(() => {
    const links = ['/stock-produit', '/facturation', '/mouvements-stock', '/listes-factures']
    links.forEach((l) => { try { useRouter().resolve(l) } catch {} })

    // Cache logo entreprise si présent
    try {
      const ent = localStorage.getItem('entreprise')
      if (ent) {
        const e = JSON.parse(ent)
        const logo = e?.logo
        if (logo && typeof logo === 'string') {
          const isAbs = /^https?:\/\//i.test(logo)
          const url = isAbs ? logo : `${location.origin}${logo.startsWith('/') ? logo : `/${logo}`}`
          fetch(url).then(r => r.blob()).then(b => {
            const fr = new FileReader()
            fr.onload = () => localStorage.setItem('entreprise_logo_cache', fr.result as string)
            fr.readAsDataURL(b)
          }).catch(() => {})
        }
      }
    } catch {}
  })

  // Masquage des URLs backend et messages FR
  nuxtApp.hook('app:rendered', () => {
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const res = await originalFetch(input, init)
        if (!res.ok) {
          const status = res.status
          let message = 'Une erreur est survenue. Veuillez réessayer plus tard.'
          if (status === 401) message = "Votre session a expiré. Veuillez vous reconnecter."
          if (status === 403) message = "Accès refusé. Vous n'avez pas les permissions nécessaires."
          if (status === 404) message = "Ressource introuvable."
          if (status >= 500) message = "Erreur serveur. Veuillez réessayer plus tard."
          // N'affiche jamais l'URL backend
          throw new Error(message)
        }
        return res
      } catch (e: any) {
        // Laissez les composants gérer via try/catch
        throw new Error(e?.message || 'Une erreur réseau est survenue.')
      }
    }
  })
})

