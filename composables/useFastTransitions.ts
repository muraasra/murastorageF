// Composable pour les transitions rapides entre pages
import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useFastTransitions = () => {
  const isTransitioning = ref(false)
  const preloadedPages = ref(new Set())
  const pageCache = ref(new Map())

  // Configuration des transitions
  const transitionConfig = {
    duration: 150, // Durée très courte pour les transitions
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Easing optimisé
    preloadDelay: 100, // Délai avant préchargement
    cacheDuration: 300000 // 5 minutes de cache
  }

  // Précharger les pages importantes
  const preloadImportantPages = () => {
    const importantPages = [
      '/user',
      '/facturation', 
      '/listes-factures',
      '/mouvements-stock',
      '/stock-produit'
    ]

    importantPages.forEach(page => {
      setTimeout(() => {
        preloadPage(page)
      }, transitionConfig.preloadDelay)
    })
  }

  // Précharger une page spécifique
  const preloadPage = async (path: string) => {
    if (preloadedPages.value.has(path)) return

    try {
      // Vérifier que le path n'est pas undefined ou null
      if (!path) {
        console.warn('⚠️ Path est undefined ou null pour le préchargement')
        return
      }

      // Précharger le composant de la page
      const componentPath = `~/pages${path === '/' ? '/index' : path}.vue`
      const component = await import(/* @vite-ignore */ componentPath)
      
      // Mettre en cache
      pageCache.value.set(path, {
        component: component.default,
        timestamp: Date.now()
      })
      
      preloadedPages.value.add(path)
      console.log(`✅ Page préchargée: ${path}`)
    } catch (error) {
      console.warn(`⚠️ Impossible de précharger ${path}:`, error)
    }
  }

  // Navigation optimisée avec préchargement
  const navigateToOptimized = async (path: string, options = {}) => {
    isTransitioning.value = true

    try {
      // Précharger la page si elle n'est pas déjà en cache
      if (!preloadedPages.value.has(path)) {
        await preloadPage(path)
      }

      // Navigation avec transition rapide
      await navigateTo(path, options)
      
      // Marquer la transition comme terminée
      setTimeout(() => {
        isTransitioning.value = false
      }, transitionConfig.duration)

    } catch (error) {
      console.error('Erreur de navigation:', error)
      isTransitioning.value = false
    }
  }

  // Navigation avec préchargement intelligent
  const smartNavigate = async (path: string, options = {}) => {
    // Précharger les pages liées
    const relatedPages = getRelatedPages(path)
    relatedPages.forEach(page => {
      if (!preloadedPages.value.has(page)) {
        preloadPage(page)
      }
    })

    // Navigation immédiate
    return navigateToOptimized(path, options)
  }

  // Obtenir les pages liées à une page donnée
  const getRelatedPages = (currentPath: string) => {
    // Vérifier que le path n'est pas undefined ou null
    if (!currentPath) {
      return []
    }

    const relations = {
      '/user': ['/facturation', '/listes-factures', '/mouvements-stock'],
      '/facturation': ['/listes-factures', '/stock-produit'],
      '/listes-factures': ['/facturation', '/mouvements-stock'],
      '/mouvements-stock': ['/stock-produit', '/user'],
      '/stock-produit': ['/facturation', '/mouvements-stock']
    }

    return relations[currentPath] || []
  }

  // Précharger les composants lourds
  const preloadHeavyComponents = async () => {
    const heavyComponents = [
      '~/components/table_factures.vue',
      '~/components/table_produit_stock.vue'
    ]

    heavyComponents.forEach(async (componentPath) => {
      try {
        await import(/* @vite-ignore */ componentPath)
        console.log(`✅ Composant lourd préchargé: ${componentPath}`)
      } catch (error) {
        console.warn(`⚠️ Impossible de précharger ${componentPath}:`, error)
      }
    })
  }

  // Nettoyer le cache des pages
  const clearPageCache = () => {
    const now = Date.now()
    for (const [path, data] of pageCache.value.entries()) {
      if (now - data.timestamp > transitionConfig.cacheDuration) {
        pageCache.value.delete(path)
        preloadedPages.value.delete(path)
      }
    }
  }

  // Optimiser les transitions CSS
  const optimizeTransitions = () => {
    // Ajouter des styles CSS optimisés pour les transitions
    const style = document.createElement('style')
    style.textContent = `
      .page-transition-enter-active,
      .page-transition-leave-active {
        transition: all ${transitionConfig.duration}ms ${transitionConfig.easing};
      }
      
      .page-transition-enter-from {
        opacity: 0;
        transform: translateX(10px);
      }
      
      .page-transition-leave-to {
        opacity: 0;
        transform: translateX(-10px);
      }

      .fast-transition {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .loading-transition {
        transition: opacity 100ms ease-in-out;
      }
    `
    document.head.appendChild(style)
  }

  // Initialisation
  onMounted(() => {
    optimizeTransitions()
    preloadImportantPages()
    preloadHeavyComponents()
    
    // Nettoyer le cache périodiquement
    const cacheCleanup = setInterval(clearPageCache, 60000) // Toutes les minutes
    
    onUnmounted(() => {
      clearInterval(cacheCleanup)
    })
  })

  return {
    // État
    isTransitioning,
    preloadedPages: computed(() => preloadedPages.value),
    
    // Fonctions
    navigateTo: navigateToOptimized,
    smartNavigate,
    preloadPage,
    preloadImportantPages,
    clearPageCache,
    
    // Configuration
    transitionConfig
  }
}
