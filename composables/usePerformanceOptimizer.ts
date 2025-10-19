// Composable pour les performances globales
import { ref, onMounted, onUnmounted } from 'vue'

export const usePerformanceOptimizer = () => {
  const isOnline = ref(true)
  const connectionSpeed = ref<'slow' | 'medium' | 'fast'>('medium')
  const preloadEnabled = ref(true)

  // Détecter la vitesse de connexion
  const detectConnectionSpeed = () => {
    if (process.client && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          connectionSpeed.value = 'slow'
          preloadEnabled.value = false
        } else if (effectiveType === '3g') {
          connectionSpeed.value = 'medium'
          preloadEnabled.value = true
        } else {
          connectionSpeed.value = 'fast'
          preloadEnabled.value = true
        }
      }
    }
  }

  // Optimiser les requêtes selon la connexion
  const optimizeRequest = (url: string, options: any = {}) => {
    if (connectionSpeed.value === 'slow') {
      // Désactiver le préchargement pour les connexions lentes
      options.preload = false
      options.priority = 'low'
    } else if (connectionSpeed.value === 'fast') {
      // Activer toutes les optimisations pour les connexions rapides
      options.preload = true
      options.priority = 'high'
    }
    
    return { url, options }
  }

  // Précharger les ressources critiques (SANS NAVIGATION)
  const preloadCriticalResources = async () => {
    if (!preloadEnabled.value || !process.client) return

    try {
      console.log('[Performance] Préchargement des ressources critiques (sans navigation)')
      
      // Précharger seulement les données, pas les routes
      // Les routes seront préchargées par le composable de navigation
      console.log('[Performance] Préchargement terminé')
    } catch (error) {
      console.warn('[Performance] Erreur préchargement ressources:', error)
    }
  }

  // Gérer les événements de connexion
  const handleOnline = () => {
    isOnline.value = true
    console.log('[Performance] Connexion rétablie')
  }

  const handleOffline = () => {
    isOnline.value = false
    console.log('[Performance] Connexion perdue')
  }

  onMounted(() => {
    if (process.client) {
      detectConnectionSpeed()
      
      // Écouter les changements de connexion
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      
      // Précharger les ressources critiques après un délai (désactivé pour éviter les redirections)
      // setTimeout(preloadCriticalResources, 2000)
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  return {
    isOnline,
    connectionSpeed,
    preloadEnabled,
    detectConnectionSpeed,
    optimizeRequest,
    preloadCriticalResources
  }
}
