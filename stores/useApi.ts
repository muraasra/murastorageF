// composables/useApi.ts
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'

export async function useApi<T = unknown>(url: string, options: any = {}) {
  const auth = useAuthStore()
  
  // Fonction pour invalider le cache après les mutations
  const invalidateRelatedCache = (url: string, method: string) => {
    if (!process.client) return
    
    try {
      const nuxtApp = useNuxtApp()
      // Accéder aux méthodes d'invalidation via le plugin
      const invalidateCacheByPattern = nuxtApp.$invalidateCacheByPattern as ((pattern: string) => void) || null
      
      // Pour les mutations, invalider les endpoints liés
      if (method !== 'GET' && method !== 'OPTIONS' && invalidateCacheByPattern) {
        console.log(`[Cache] Invalidation du cache après ${method} sur ${url}`)
        
        // Extraire le pattern de l'URL pour invalider toutes les ressources liées
        // Ex: /api/produits/123/ → invalider /api/produits/
        const match = url.match(/\/api\/([^\/]+)/)
        if (match) {
          const resource = match[1]
          invalidateCacheByPattern(`/api/${resource}`)
          
          // Invalider aussi les listes génériques
          if (resource.includes('produit')) {
            invalidateCacheByPattern('/api/produits')
            invalidateCacheByPattern('/api/stocks')
          }
          if (resource.includes('facture')) {
            invalidateCacheByPattern('/api/factures')
            invalidateCacheByPattern('/api/commandes')
          }
          if (resource.includes('user')) {
            invalidateCacheByPattern('/api/users')
          }
        }
      }
    } catch (e) {
      console.warn('[useApi] Erreur lors de l\'invalidation du cache:', e)
    }
  }
  
  // Vérifier que l'URL n'est pas undefined ou null
  if (!url) {
    console.error('[useApi] URL est undefined ou null')
    return { 
      data: ref(null),
      error: ref(new Error('URL non définie'))
    }
  }
  
  // Construire l'URL complète si nécessaire
  let fullUrl: string
  if (url.startsWith('http')) {
    fullUrl = url
  } else if (url.startsWith('/api/') || url.startsWith('/api')) {
    // URL commence déjà par /api
    fullUrl = `${API_BASE_URL}${url}`
  } else {
    // Ajouter /api/ au début
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    fullUrl = `${API_BASE_URL}/api${cleanUrl}`
  }
  
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

    // TTL par familles (en millisecondes, très courts pour quasi temps réel)
    const path = endpoint
    
    // Données critiques (produits, stocks, factures, mouvements) → cache 10s max
    if (/\/api\/(produits|stocks|factures|mouvements-stock)\/?/i.test(path)) {
      return { useCache: true as const, ttl: 10 * 1000 }
    }

    // Abonnement: plans, current, limits, usage → 30s
    if (/\/api\/(subscription-plans|subscriptions\/(current|limits|usage))\/?/i.test(path)) {
      return { useCache: true as const, ttl: 30 * 1000 }
    }

    // Listes: categories, fournisseurs, partenaires → 20s
    if (/\/api\/(categories|fournisseurs|partenaires)\/?/i.test(path)) {
      return { useCache: true as const, ttl: 20 * 1000 }
    }

    // PAS DE CACHE pour les inventaires et produits inventaires - temps réel requis
    if (/\/api\/inventaires(-produits)?/i.test(path)) {
      return { useCache: false as const, ttl: 0 }
    }

    // Par défaut: 30s
    return { useCache: true as const, ttl: 30 * 1000 }
  }
  
  try {
    // Récupérer le token depuis localStorage ou depuis le store
    let authToken = auth.token
    if (process.client && !authToken) {
      authToken = localStorage.getItem('access_token')
    }
    
    console.log('[useApi] Token utilisé:', authToken ? 'Bearer ***' : 'NONE')
    console.log('[useApi] URL:', fullUrl)
    
    // Utiliser $fetch avec cache nuxt (désactivé sélectivement via policy)
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
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
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
    
    // Invalider le cache après les mutations réussies
    if (method !== 'GET' && method !== 'OPTIONS') {
      invalidateRelatedCache(fullUrl, method)
    }
    
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
          // Récupérer le nouveau token
          let authToken = auth.token
          if (process.client && !authToken) {
            authToken = localStorage.getItem('access_token')
          }
          
          const response = await $fetch<T>(fullUrl, {
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
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
    
    // Gestion des erreurs avec messages propres pour les utilisateurs
    let userFriendlyMessage = 'Une erreur est survenue. Veuillez réessayer.';
    let statusCode = e?.status || e?.statusCode || 500;
    
    // Messages d'erreur propres selon le code de statut
    switch (statusCode) {
      case 400:
        userFriendlyMessage = 'Requête invalide. Veuillez vérifier les informations saisies.';
        break;
      case 401:
        userFriendlyMessage = 'Veuillez vous connecter pour accéder à cette ressource.';
        // Ne pas logger l'erreur 401 car elle est gérée par handleTokenRefresh
        break;
      case 403:
        userFriendlyMessage = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
        break;
      case 404:
        userFriendlyMessage = 'Ressource introuvable.';
        break;
      case 500:
        userFriendlyMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        break;
      case 502:
      case 503:
        userFriendlyMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
        break;
      default:
        // Pour les autres erreurs, utiliser un message générique
        userFriendlyMessage = 'Une erreur est survenue. Veuillez réessayer.';
    }
    
    // Logger l'erreur technique uniquement en développement
    if (process.dev) {
      console.error('[useApi] Erreur API:', {
        url: fullUrl,
        status: statusCode,
        message: e?.message || 'Erreur inconnue',
        error: e
      });
    }
    
    // Créer une erreur avec le message propre
    const friendlyError = new Error(userFriendlyMessage);
    (friendlyError as any).status = statusCode;
    (friendlyError as any).originalError = e;
    
    return { 
      data: ref(null),
      error: ref(friendlyError)
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