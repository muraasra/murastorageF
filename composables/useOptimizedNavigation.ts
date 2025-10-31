// Composable pour optimiser les liens de navigation
import { ref } from 'vue'

export const useOptimizedNavigation = () => {
  const isNavigating = ref(false)
  const preloadedRoutes = ref(new Set<string>())

  // Précharger une route avant la navigation
  const preloadRoute = async (route: string) => {
    if (preloadedRoutes.value.has(route)) {
      console.log('[Navigation] Route déjà préchargée:', route)
      return
    }

    try {
      console.log('[Navigation] Préchargement de la route:', route)
      
      // Précharger les données spécifiques à la route
      switch (route) {
        case '/superadmin/utilisateurs':
          // Précharger les données utilisateurs si pas déjà fait
          break
        case '/superadmin/entrepots':
          // Précharger les données entrepôts si pas déjà fait
          break
        case '/superadmin/produits':
          // Précharger les données produits si pas déjà fait
          break
        case '/superadmin/factures':
          // Précharger les données factures si pas déjà fait
          break
      }
      
      preloadedRoutes.value.add(route)
      console.log('[Navigation] Route préchargée:', route)
    } catch (error) {
      console.warn('[Navigation] Erreur préchargement route:', error)
    }
  }

  // Navigation optimisée avec préchargement
  const navigateOptimized = async (route: string) => {
    if (isNavigating.value) return
    
    isNavigating.value = true
    
    try {
      // Précharger la route si pas déjà fait
      await preloadRoute(route)
      
      // Naviguer
      await navigateTo(route)
    } catch (error) {
      console.error('[Navigation] Erreur navigation:', error)
    } finally {
      isNavigating.value = false
    }
  }

  // Navigation rapide sans préchargement
  const navigateQuick = async (route: string) => {
    if (isNavigating.value) return
    
    isNavigating.value = true
    
    try {
      await navigateTo(route)
    } catch (error) {
      console.error('[Navigation] Erreur navigation rapide:', error)
    } finally {
      isNavigating.value = false
    }
  }

  // Précharger toutes les routes superadmin
  const preloadSuperAdminRoutes = async () => {
    const routes = [
      '/superadmin/utilisateurs',
      '/superadmin/entrepots',
      '/superadmin/produits',
      '/superadmin/factures',
      '/superadmin/tarification'
    ]

    console.log('[Navigation] Préchargement des routes superadmin')
    
    // Précharger en parallèle
    await Promise.allSettled(
      routes.map(route => preloadRoute(route))
    )
    
    console.log('[Navigation] Routes superadmin préchargées')
  }

  return {
    isNavigating,
    preloadedRoutes,
    preloadRoute,
    navigateOptimized,
    navigateQuick,
    preloadSuperAdminRoutes
  }
}











