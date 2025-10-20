// composables/useApi.ts
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'

export async function useApi<T = unknown>(url: string, options: any = {}) {
  const auth = useAuthStore()
  
  // Vérifier que l'URL n'est pas undefined ou null
  if (!url) {
    console.error('[useApi] URL est undefined ou null')
    return { 
      data: ref(null),
      error: ref(new Error('URL non définie'))
    }
  }
  
  // Construire l'URL complète si nécessaire
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
  
  // Déterminer un TTL de cache par type d'endpoint et méthode
  const resolveCachePolicy = (endpoint: string, method: string) => {
    // Pas de cache pour non-GET
    if (method && method.toUpperCase() !== 'GET') {
      return { useCache: false as const, ttl: 0 }
    }

    // Pas de cache pour les endpoints de détail du type /api/ressource/:id/
    const isDetail = /\/api\/[^/]+\/(\d+)(\/)?(\?.*)?$/i.test(endpoint)
    if (isDetail) {
      return { useCache: false as const, ttl: 0 }
    }

    // TTL par familles
    const path = endpoint
    // Abonnement: plans, current, limits, usage → 5 min
    if (/\/api\/(subscription-plans|subscriptions\/(current|limits|usage))\/?/i.test(path)) {
      return { useCache: true as const, ttl: 5 * 60 * 1000 }
    }

    // Listes: produits, categories, fournisseurs, partenaires → 10-15 min
    if (/\/api\/(produits|categories|fournisseurs|partenaires)\/?/i.test(path)) {
      return { useCache: true as const, ttl: 10 * 60 * 1000 }
    }

    // Stocks et factures varient plus → 5 min
    if (/\/api\/(stocks|factures|mouvements-stock)\/?/i.test(path)) {
      return { useCache: true as const, ttl: 5 * 60 * 1000 }
    }

    // Par défaut: 30 min (hérite du plugin)
    return { useCache: true as const, ttl: 30 * 60 * 1000 }
  }
  
  try {
    // Utiliser $fetch au lieu de useFetch pour éviter les problèmes d'injection
    // utiliser le cache persistant
    const nuxtApp = useNuxtApp()
    const $cachedFetch = (nuxtApp?.$cachedFetch as any) || $fetch
    const method = (options?.method || 'GET').toUpperCase()
    const policy = resolveCachePolicy(fullUrl, method)

    // Calculer les options de cache finales
    const explicitCacheTTL = options?.cacheTTL
    const explicitDisableCache = options?.cache === false

    // Si l'appelant a précisé, on respecte; sinon on applique la policy
    const finalCacheDisabled = explicitDisableCache || (!explicitCacheTTL && !policy.useCache)
    const finalTTL = explicitCacheTTL ?? (policy.useCache ? policy.ttl : undefined)

    const response = await $cachedFetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
      },
      // Application de la stratégie de cache
      ...(finalCacheDisabled ? { cache: false } : {}),
      ...(finalTTL ? { cacheTTL: finalTTL } : {}),
      ...options,
      onResponseError({ response }: { response?: { status?: number } }) {
        if (response?.status === 401) {
          // Token expiré, essayer de le rafraîchir
          handleTokenRefresh().then(success => {
            if (!success) {
              auth.logout()
              if (process.client) {
                navigateTo('/connexion')
              }
            }
          })
        }
      }
    })

    return { 
      data: ref(response), 
      error: ref(null) 
    }
  } catch (e: any) {
    // Si c'est une erreur 401, essayer de rafraîchir le token
    if (e.status === 401 || e.statusCode === 401) {
      const refreshSuccess = await handleTokenRefresh()
      if (refreshSuccess) {
        // Réessayer la requête avec le nouveau token
        try {
          const response = await $fetch<T>(url, {
            headers: {
              'Content-Type': 'application/json',
              ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {})
            },
            ...options
          })
          return { 
            data: ref(response), 
            error: ref(null) 
          }
        } catch (retryError) {
          console.error('API Error after token refresh:', retryError)
          return { 
            data: ref(null),
            error: ref(retryError instanceof Error ? retryError : new Error('Une erreur est survenue'))
          }
        }
      } else {
        // Refresh échoué, déconnecter
        auth.logout()
        if (process.client) {
          navigateTo('/connexion')
        }
      }
    }
    
    console.error('API Error:', e)
    return { 
      data: ref(null),
      error: ref(e instanceof Error ? e : new Error('Une erreur est survenue'))
    }
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (!process.client) return false
  
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    const response: any = await $fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      body: { refresh: refreshToken },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if ((response as any).access) {
      // Sauvegarder le nouveau token
      const auth = useAuthStore()
      auth.setToken((response as any).access)
      
      // Sauvegarder le nouveau refresh token s'il est fourni
      if ((response as any).refresh) {
        localStorage.setItem('refresh_token', (response as any).refresh)
      }
      
      console.log('[useApi] Token rafraîchi avec succès')
      return true
    }
    
    return false
  } catch (err) {
    console.warn('[useApi] Impossible de rafraîchir le token:', err)
    return false
  }
}