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
  const maxSize = ref(100) // Taille maximale du cache (non utilisé si cache désactivé)
  const defaultTTL = ref(0) // TTL 0 → cache désactivé (données toujours recalculées)

  // Nettoyer le cache expiré
  const cleanExpiredCache = () => {
    // Cache désactivé : ne rien faire
  }

  // Obtenir une valeur du cache
  const get = (key: string) => {
    // Cache désactivé : toujours miss
    console.log(`[Cache] (désactivé) Cache miss forcé: ${key}`)
    return null
  }

  // Mettre une valeur dans le cache
  const set = (key: string, data: any, ttl?: number) => {
    // Cache désactivé : ne rien stocker
    console.log(`[Cache] (désactivé) set ignoré pour: ${key}`)
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
    console.log('[Cache] Cache vidé (désactivé)')
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
    // Cache désactivé : appeler directement le fetcher à chaque fois
    try {
      const data = await fetcher()
      return data
    } catch (error) {
      console.error(`[Cache] Erreur lors de la récupération pour ${key}:`, error)
      throw error
    }
  }

  // Précharger des données
  const preload = async (keys: string[], fetchers: (() => Promise<any>)[], ttl?: number) => {
    // Cache désactivé : exécuter les fetchers sans stocker
    const promises = keys.map((key, index) =>
      fetchers[index]().catch(err => {
        console.warn(`[Cache] Erreur préchargement ${key}:`, err)
        return null
      })
    )

    await Promise.allSettled(promises)
    console.log(`[Cache] Préchargement terminé (cache désactivé) pour ${keys.length} clés`)
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