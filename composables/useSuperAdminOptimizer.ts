// Composable principal pour toutes les optimisations superadmin
import { useSuperAdminPreloader } from './useSuperAdminPreloader'
import { useWarehouseRedirect } from './useWarehouseRedirect'
import { useOptimizedNavigation } from './useOptimizedNavigation'
import { usePerformanceOptimizer } from './usePerformanceOptimizer'
import { useSmartCache } from './useSmartCache'
import { usePageTransitions } from './usePageTransitions'
import { useApiOptimizer } from './useApiOptimizer'

export const useSuperAdminOptimizer = () => {
  // Initialiser tous les composables
  const preloader = useSuperAdminPreloader()
  const warehouseRedirect = useWarehouseRedirect()
  const navigation = useOptimizedNavigation()
  const performance = usePerformanceOptimizer()
  const cache = useSmartCache()
  const transitions = usePageTransitions()
  const apiOptimizer = useApiOptimizer()

  // Initialisation complète
  const initializeOptimizations = async () => {
    console.log('[SuperAdminOptimizer] Initialisation des optimisations')
    
    try {
      // Précharger les données critiques
      await preloader.preloadAllData()
      
      // Précharger les routes superadmin (désactivé pour éviter les redirections automatiques)
      // if (performance.preloadEnabled.value) {
      //   await navigation.preloadSuperAdminRoutes()
      // }
      
      console.log('[SuperAdminOptimizer] Optimisations initialisées avec succès')
    } catch (error) {
      console.error('[SuperAdminOptimizer] Erreur initialisation:', error)
    }
  }

  // Navigation optimisée vers une page superadmin
  const navigateToSuperAdminPage = async (route: string) => {
    if (performance.preloadEnabled.value) {
      await navigation.navigateOptimized(route)
    } else {
      await navigation.navigateQuick(route)
    }
  }

  // Accès optimisé à un entrepôt
  const accessWarehouseOptimized = async (boutique: any) => {
    try {
      // Précharger les données de l'entrepôt
      await preloader.preloadBoutiqueData(boutique.id)
      
      // Rediriger vers l'entrepôt
      await warehouseRedirect.redirectToWarehouse(boutique)
    } catch (error) {
      console.error('[SuperAdminOptimizer] Erreur accès entrepôt:', error)
    }
  }

  // Rafraîchir toutes les données
  const refreshAllData = async () => {
    console.log('[SuperAdminOptimizer] Rafraîchissement des données')
    
    try {
      // Invalider le cache
      preloader.invalidateCache()
      cache.clear()
      
      // Recharger les données
      await preloader.preloadAllData()
      
      console.log('[SuperAdminOptimizer] Données rafraîchies')
    } catch (error) {
      console.error('[SuperAdminOptimizer] Erreur rafraîchissement:', error)
    }
  }

  // Obtenir les statistiques de performance
  const getPerformanceStats = () => {
    return {
      preloader: {
        isLoading: preloader.isLoading.value,
        hasData: {
          entreprise: preloader.hasData('entreprise'),
          boutiques: preloader.hasData('boutiques'),
          users: preloader.hasData('users'),
          produits: preloader.hasData('produits'),
          factures: preloader.hasData('factures')
        }
      },
      navigation: {
        isNavigating: navigation.isNavigating.value,
        preloadedRoutes: Array.from(navigation.preloadedRoutes.value)
      },
      performance: {
        isOnline: performance.isOnline.value,
        connectionSpeed: performance.connectionSpeed.value,
        preloadEnabled: performance.preloadEnabled.value
      },
      cache: cache.getStats(),
      transitions: {
        isTransitioning: transitions.isTransitioning.value
      },
      api: apiOptimizer.getQueueStats()
    }
  }

  // Nettoyer toutes les optimisations
  const cleanup = () => {
    console.log('[SuperAdminOptimizer] Nettoyage des optimisations')
    
    preloader.invalidateCache()
    cache.clear()
    apiOptimizer.clearQueue()
    navigation.preloadedRoutes.value.clear()
  }

  return {
    // Composables individuels
    preloader,
    warehouseRedirect,
    navigation,
    performance,
    cache,
    transitions,
    apiOptimizer,
    
    // Fonctions combinées
    initializeOptimizations,
    navigateToSuperAdminPage,
    accessWarehouseOptimized,
    refreshAllData,
    getPerformanceStats,
    cleanup
  }
}
