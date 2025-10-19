// Composable pour l'optimisation des performances
import { ref, computed } from 'vue'
import performanceConfig from '~/performance.config.js'

export const usePerformance = () => {
  const isLoading = ref(false)
  const loadingError = ref(false)
  const cache = ref(new Map())
  const connectionSpeed = ref('fast') // fast, medium, slow

  // Détecter la vitesse de connexion
  const detectConnectionSpeed = () => {
    if (navigator.connection) {
      const connection = navigator.connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        connectionSpeed.value = 'slow'
      } else if (connection.effectiveType === '3g') {
        connectionSpeed.value = 'medium'
      } else {
        connectionSpeed.value = 'fast'
      }
    }
  }

  // Obtenir le timeout approprié selon la connexion
  const getTimeout = (type = 'api') => {
    const baseTimeout = performanceConfig.timeouts[type]
    if (connectionSpeed.value === 'slow') {
      return baseTimeout * 2
    } else if (connectionSpeed.value === 'medium') {
      return baseTimeout * 1.5
    }
    return baseTimeout
  }

  // Obtenir la taille de pagination appropriée
  const getPaginationSize = () => {
    if (connectionSpeed.value === 'slow') {
      return performanceConfig.pagination.slowConnectionSize
    }
    return performanceConfig.pagination.defaultSize
  }

  // Fonction de cache optimisée
  const getCachedData = (key) => {
    const cached = cache.value.get(key)
    if (cached && (Date.now() - cached.timestamp) < performanceConfig.cache.duration) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key, data) => {
    // Limiter la taille du cache
    if (cache.value.size >= performanceConfig.cache.maxSize) {
      const firstKey = cache.value.keys().next().value
      cache.value.delete(firstKey)
    }
    
    cache.value.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Fonction de requête optimisée avec cache et timeout
  const optimizedRequest = async (key, requestFn, useCache = true) => {
    // Vérifier le cache d'abord
    if (useCache) {
      const cached = getCachedData(key)
      if (cached) {
        return cached
      }
    }

    isLoading.value = true
    loadingError.value = false

    try {
      const timeout = getTimeout('api')
      const result = await Promise.race([
        requestFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ])

      // Mettre en cache le résultat
      if (useCache) {
        setCachedData(key, result)
      }

      return result
    } catch (error) {
      loadingError.value = true
      console.error(`Erreur lors de la requête ${key}:`, error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Fonction pour nettoyer le cache
  const clearCache = () => {
    cache.value.clear()
  }

  // Fonction pour précharger les données importantes
  const preloadData = async (dataKeys) => {
    const promises = dataKeys.map(key => {
      // Implémentation spécifique selon la clé
      // Cette fonction sera étendue selon les besoins
      return Promise.resolve()
    })
    
    await Promise.allSettled(promises)
  }

  // Computed pour l'état de chargement
  const loadingState = computed(() => ({
    isLoading: isLoading.value,
    hasError: loadingError.value,
    connectionSpeed: connectionSpeed.value
  }))

  return {
    // État
    isLoading,
    loadingError,
    connectionSpeed,
    loadingState,
    
    // Fonctions
    detectConnectionSpeed,
    getTimeout,
    getPaginationSize,
    optimizedRequest,
    clearCache,
    preloadData,
    
    // Cache
    getCachedData,
    setCachedData
  }
}


















