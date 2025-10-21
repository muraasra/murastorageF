// Composable simplifié pour les optimisations superadmin (sans redirections automatiques)
import { useSuperAdminPreloader } from './useSuperAdminPreloader'
import { useWarehouseRedirect } from './useWarehouseRedirect'
import { useSmartCache } from './useSmartCache'
import { useApiOptimizer } from './useApiOptimizer'

export const useSuperAdminOptimizerSafe = () => {
  // Initialiser seulement les composables sûrs
  const preloader = useSuperAdminPreloader()
  const warehouseRedirect = useWarehouseRedirect()
  const cache = useSmartCache()
  const apiOptimizer = useApiOptimizer()

  // Initialisation sécurisée (sans préchargement de routes)
  const initializeOptimizations = async () => {
    console.log('[SuperAdminOptimizerSafe] Initialisation sécurisée des optimisations')
    
    try {
      // Précharger seulement les données critiques
      await preloader.preloadAllData()
      
      console.log('[SuperAdminOptimizerSafe] Optimisations initialisées avec succès')
    } catch (error) {
      console.error('[SuperAdminOptimizerSafe] Erreur initialisation:', error)
    }
  }

  // Accès optimisé à un entrepôt (sans préchargement automatique)
  const accessWarehouseOptimized = async (boutique: any) => {
    try {
      // Rediriger directement vers l'entrepôt sans préchargement
      await warehouseRedirect.redirectToWarehouse(boutique)
    } catch (error) {
      console.error('[SuperAdminOptimizerSafe] Erreur accès entrepôt:', error)
    }
  }

  // Rafraîchir toutes les données
  const refreshAllData = async () => {
    console.log('[SuperAdminOptimizerSafe] Rafraîchissement des données')
    
    try {
      // Invalider le cache
      preloader.invalidateCache()
      cache.clear()
      
      // Recharger les données
      await preloader.preloadAllData()
      
      console.log('[SuperAdminOptimizerSafe] Données rafraîchies')
    } catch (error) {
      console.error('[SuperAdminOptimizerSafe] Erreur rafraîchissement:', error)
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
      cache: cache.getStats(),
      api: apiOptimizer.getQueueStats()
    }
  }

  // Nettoyer toutes les optimisations
  const cleanup = () => {
    console.log('[SuperAdminOptimizerSafe] Nettoyage des optimisations')
    
    preloader.invalidateCache()
    cache.clear()
    apiOptimizer.clearQueue()
  }

  return {
    // Composables individuels
    preloader,
    warehouseRedirect,
    cache,
    apiOptimizer,
    
    // Fonctions combinées
    initializeOptimizations,
    accessWarehouseOptimized,
    refreshAllData,
    getPerformanceStats,
    cleanup
  }
}


