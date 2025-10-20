// Composable pour optimiser les requêtes API
import { ref } from 'vue'
import { API_BASE_URL } from '@/constants'

export const useApiOptimizer = () => {
  const requestQueue = ref<Map<string, Promise<any>>>(new Map())
  const retryCount = ref(3)
  const timeout = ref(10000) // 10 secondes

  // Gérer les requêtes en cours pour éviter les doublons
  const getOrCreateRequest = async <T>(
    key: string, 
    requestFn: () => Promise<T>
  ): Promise<T> => {
    // Si une requête est déjà en cours, retourner la même promesse
    if (requestQueue.value.has(key)) {
      return requestQueue.value.get(key)!
    }

    // Créer une nouvelle requête
    const request = requestFn()
    requestQueue.value.set(key, request)

    try {
      const result = await request
      return result
    } finally {
      // Nettoyer la queue
      requestQueue.value.delete(key)
    }
  }

  // Requête avec retry automatique
  const requestWithRetry = async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = retryCount.value
  ): Promise<T> => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error
        console.warn(`[API] Tentative ${attempt + 1} échouée:`, error)

        // Ne pas retry pour certaines erreurs
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status === 401 || status === 403 || status === 404) {
            throw error
          }
        }

        // Attendre avant de retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Toutes les tentatives ont échoué')
  }

  // Requête avec timeout
  const requestWithTimeout = async <T>(
    requestFn: () => Promise<T>,
    timeoutMs: number = timeout.value
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    })

    return Promise.race([requestFn(), timeoutPromise])
  }

  // Requête optimisée complète
  const optimizedRequest = async <T>(
    url: string,
    options: any = {},
    requestKey?: string
  ): Promise<T> => {
    const key = requestKey || `${options.method || 'GET'}:${url}`
    
    return getOrCreateRequest(key, async () => {
      return requestWithRetry(async () => {
        return requestWithTimeout(async () => {
          // Vérifier que l'URL n'est pas undefined ou null
          if (!url) {
            throw new Error('URL non définie')
          }
          const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
          
          const response = await $fetch(fullUrl, {
            timeout: timeout.value,
            ...options
          })

          return response
        })
      })
    })
  }

  // Requêtes en batch
  const batchRequest = async <T>(
    requests: Array<{ key: string; url: string; options?: any }>
  ): Promise<Map<string, T>> => {
    const results = new Map<string, T>()
    const promises = requests.map(async ({ key, url, options }) => {
      try {
        const result = await optimizedRequest<T>(url, options, key)
        results.set(key, result)
      } catch (error) {
        console.error(`[API] Erreur requête batch ${key}:`, error)
        results.set(key, null as T)
      }
    })

    await Promise.allSettled(promises)
    return results
  }

  // Précharger des données
  const preloadData = async <T>(
    urls: string[],
    options: any = {}
  ): Promise<T[]> => {
    const requests = urls.map((url, index) => ({
      key: `preload_${index}`,
      url,
      options
    }))

    const results = await batchRequest<T>(requests)
    return Array.from(results.values()).filter(Boolean)
  }

  // Nettoyer la queue de requêtes
  const clearQueue = () => {
    requestQueue.value.clear()
  }

  // Obtenir les statistiques de la queue
  const getQueueStats = () => {
    return {
      pendingRequests: requestQueue.value.size,
      queueKeys: Array.from(requestQueue.value.keys())
    }
  }

  return {
    getOrCreateRequest,
    requestWithRetry,
    requestWithTimeout,
    optimizedRequest,
    batchRequest,
    preloadData,
    clearQueue,
    getQueueStats,
    retryCount,
    timeout
  }
}

