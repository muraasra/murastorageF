export default defineNuxtPlugin(() => {
  // Cache global persistant avec localStorage
  const CACHE_PREFIX = 'app_cache_'
  const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes par défaut
  
  // Interface pour les entrées de cache
  interface CacheEntry {
    data: any
    timestamp: number
    ttl: number
  }
  
  // Fonction pour générer une clé de cache
  const getCacheKey = (url: string, options?: any): string => {
    const method = options?.method || 'GET'
    const body = options?.body ? JSON.stringify(options.body) : ''
    return `${CACHE_PREFIX}${method}:${url}:${body}`
  }
  
  // Fonction pour vérifier si une entrée est valide
  const isCacheValid = (entry: CacheEntry): boolean => {
    const now = Date.now()
    return (now - entry.timestamp) < entry.ttl
  }
  
  // Fonction pour sauvegarder dans le cache
  const saveToCache = (key: string, data: any, ttl: number = DEFAULT_TTL): void => {
    if (!process.client) return
    
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (e) {
      // Si localStorage est plein, nettoyer les anciennes entrées
      clearOldCacheEntries()
      try {
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (e2) {
        console.warn('Impossible de sauvegarder dans le cache:', e2)
      }
    }
  }
  
  // Fonction pour récupérer du cache
  const getFromCache = (key: string): any | null => {
    if (!process.client) return null
    
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      
      const entry: CacheEntry = JSON.parse(cached)
      if (isCacheValid(entry)) {
        return entry.data
      } else {
        // Supprimer l'entrée expirée
        localStorage.removeItem(key)
        return null
      }
    } catch (e) {
      console.warn('Erreur lors de la lecture du cache:', e)
      return null
    }
  }
  
  // Fonction pour nettoyer les anciennes entrées
  const clearOldCacheEntries = (): void => {
    if (!process.client) return
    
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key)
            if (cached) {
              const entry: CacheEntry = JSON.parse(cached)
              if ((now - entry.timestamp) >= entry.ttl) {
                localStorage.removeItem(key)
              }
            }
          } catch (e) {
            // Supprimer les entrées corrompues
            localStorage.removeItem(key)
          }
        }
      })
    } catch (e) {
      console.warn('Erreur lors du nettoyage du cache:', e)
    }
  }
  
  // Fonction pour vider tout le cache
  const clearAllCache = (): void => {
    if (!process.client) return
    
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      console.log('[Cache] Tout le cache a été vidé')
    } catch (e) {
      console.warn('Erreur lors du vidage du cache:', e)
    }
  }
  
  // Fonction pour invalider le cache par pattern (ex: "/api/produits/")
  const invalidateCacheByPattern = (pattern: string): void => {
    if (!process.client) return
    
    try {
      const keys = Object.keys(localStorage)
      let deletedCount = 0
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          // Extraire l'URL de la clé de cache
          // Format: "app_cache_GET:http://127.0.0.1:8000/api/produits/:body"
          const urlStart = key.indexOf(':')
          const urlEnd = key.indexOf(':', urlStart + 1)
          const url = key.substring(urlStart + 1, urlEnd !== -1 ? urlEnd : key.length)
          
          if (url.includes(pattern)) {
            localStorage.removeItem(key)
            deletedCount++
          }
        }
      })
      
      if (deletedCount > 0) {
        console.log(`[Cache] ${deletedCount} entrées invalidées pour le pattern "${pattern}"`)
      }
    } catch (e) {
      console.warn('Erreur lors de l\'invalidation du cache:', e)
    }
  }
  
  // Fonction pour invalider le cache d'un endpoint spécifique
  const invalidateCache = (url: string): void => {
    if (!process.client) return
    
    try {
      const keys = Object.keys(localStorage)
      let deletedCount = 0
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) && key.includes(url)) {
          localStorage.removeItem(key)
          deletedCount++
        }
      })
      
      if (deletedCount > 0) {
        console.log(`[Cache] ${deletedCount} entrées invalidées pour "${url}"`)
      }
    } catch (e) {
      console.warn('Erreur lors de l\'invalidation du cache:', e)
    }
  }
  
  // Cache en mémoire pour les requêtes en cours (déduplication)
  const inflightRequests = new Map<string, Promise<any>>()
  
// Fonction principale de cache avec fetch
const cachedFetch = async (url: string, options: any = {}): Promise<any> => {
  const method = options.method || 'GET'
  const ttl = options.cacheTTL || DEFAULT_TTL
  const disableCache = options.cache === false

  // Nettoyer les options pour éviter les conflits avec fetch natif
  const cleanOptions = { ...options }
  delete cleanOptions.cacheTTL
  delete cleanOptions.cache

  // Pour les requêtes non-GET, ne pas utiliser le cache
  if (method !== 'GET' || disableCache) {
    return $fetch(url, cleanOptions)
  }

  const cacheKey = getCacheKey(url, options)

  // Vérifier le cache d'abord
  const cachedData = getFromCache(cacheKey)
  if (cachedData) {
    console.log(`[Cache] Hit pour ${url}`)
    return cachedData
  }

  // Vérifier si une requête est déjà en cours
  if (inflightRequests.has(cacheKey)) {
    console.log(`[Cache] Déduplication pour ${url}`)
    return inflightRequests.get(cacheKey)
  }

  // Faire la requête
  console.log(`[Cache] Miss pour ${url}, requête en cours...`)
  const requestPromise = $fetch(url, cleanOptions)
    .then(data => {
      // Sauvegarder dans le cache
      saveToCache(cacheKey, data, ttl)
      console.log(`[Cache] Sauvegardé ${url}`)
      return data
    })
    .catch(error => {
      console.error(`[Cache] Erreur pour ${url}:`, error)
      throw error
    })
    .finally(() => {
      // Nettoyer la requête en cours
      inflightRequests.delete(cacheKey)
    })

  inflightRequests.set(cacheKey, requestPromise)
  return requestPromise
}
  
  // Nettoyer le cache au démarrage
  if (process.client) {
    clearOldCacheEntries()
  }
  
  return {
    provide: {
      cachedFetch,
      clearCache: clearAllCache,
      invalidateCache,
      invalidateCacheByPattern,
      getCacheSize: () => {
        if (!process.client) return 0
        return Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX)).length
      }
    },
    // Exposer les méthodes d'invalidation pour un accès global
    $invalidateCacheByPattern: invalidateCacheByPattern,
    $invalidateCache: invalidateCache
  }
})
