// Composable pour la gestion du cache intelligent
import { ref, reactive } from 'vue'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live en millisecondes
}

interface CacheStore {
  [key: string]: CacheEntry
}

export const useSmartCache = () => {
  const cache = reactive<CacheStore>({})
  const maxSize = ref(100) // Taille maximale du cache
  const defaultTTL = ref(5 * 60 * 1000) // 5 minutes par défaut

  // Nettoyer le cache expiré
  const cleanExpiredCache = () => {
    const now = Date.now()
    Object.keys(cache).forEach(key => {
      const entry = cache[key]
      if (now - entry.timestamp > entry.ttl) {
        delete cache[key]
        console.log(`[Cache] Entrée expirée supprimée: ${key}`)
      }
    })
  }

  // Obtenir une valeur du cache
  const get = (key: string) => {
    cleanExpiredCache()
    
    const entry = cache[key]
    if (!entry) {
      console.log(`[Cache] Cache miss: ${key}`)
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      delete cache[key]
      console.log(`[Cache] Entrée expirée: ${key}`)
      return null
    }

    console.log(`[Cache] Cache hit: ${key}`)
    return entry.data
  }

  // Mettre une valeur dans le cache
  const set = (key: string, data: any, ttl?: number) => {
    // Nettoyer le cache si nécessaire
    if (Object.keys(cache).length >= maxSize.value) {
      cleanExpiredCache()
      
      // Si toujours plein, supprimer les plus anciennes entrées
      if (Object.keys(cache).length >= maxSize.value) {
        const entries = Object.entries(cache)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        const toDelete = entries.slice(0, Math.floor(maxSize.value / 2))
        toDelete.forEach(([key]) => delete cache[key])
        console.log(`[Cache] Cache nettoyé, ${toDelete.length} entrées supprimées`)
      }
    }

    cache[key] = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTTL.value
    }

    console.log(`[Cache] Entrée mise en cache: ${key}`)
  }

  // Supprimer une entrée du cache
  const remove = (key: string) => {
    if (cache[key]) {
      delete cache[key]
      console.log(`[Cache] Entrée supprimée: ${key}`)
    }
  }

  // Vider tout le cache
  const clear = () => {
    Object.keys(cache).forEach(key => delete cache[key])
    console.log('[Cache] Cache vidé')
  }

  // Obtenir les statistiques du cache
  const getStats = () => {
    cleanExpiredCache()
    return {
      size: Object.keys(cache).length,
      maxSize: maxSize.value,
      keys: Object.keys(cache)
    }
  }

  // Cache avec fonction de fallback
  const getOrSet = async (key: string, fetcher: () => Promise<any>, ttl?: number) => {
    const cached = get(key)
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetcher()
      set(key, data, ttl)
      return data
    } catch (error) {
      console.error(`[Cache] Erreur lors de la récupération pour ${key}:`, error)
      throw error
    }
  }

  // Précharger des données
  const preload = async (keys: string[], fetchers: (() => Promise<any>)[], ttl?: number) => {
    const promises = keys.map((key, index) => 
      getOrSet(key, fetchers[index], ttl).catch(err => {
        console.warn(`[Cache] Erreur préchargement ${key}:`, err)
        return null
      })
    )

    await Promise.allSettled(promises)
    console.log(`[Cache] Préchargement terminé pour ${keys.length} clés`)
  }

  return {
    cache,
    get,
    set,
    remove,
    clear,
    getStats,
    getOrSet,
    preload,
    cleanExpiredCache
  }
}