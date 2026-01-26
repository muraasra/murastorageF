import { API_BASE_URL } from '@/constants'

export const useApi = async (url: string, options: any = {}) => {
  // Construire l'URL complète avec le backend
  let fullUrl: string
  
  if (url.startsWith('http')) {
    fullUrl = url
  } else if (url.startsWith('/api')) {
    // Si l'URL commence déjà par /api, utiliser directement avec API_BASE_URL
    fullUrl = `${API_BASE_URL}${url}`
  } else if (url.startsWith('/')) {
    // Si l'URL commence par /, ajouter /api
    fullUrl = `${API_BASE_URL}/api${url}`
  } else {
    // Sinon, ajouter /api/
    fullUrl = `${API_BASE_URL}/api/${url}`
  }
  
  console.log('[useApi] URL:', fullUrl, 'Method:', options.method || 'GET')
  
  // Récupérer le token d'authentification
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  }
  
  if (process.client) {
    // Essayer d'abord localStorage, puis cookies
    const token = localStorage.getItem('access_token') || 
                  document.cookie.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  try {
    // Utiliser $fetch directement (pas de cache pour les mutations)
    const response = await $fetch(fullUrl, {
      method: options.method || 'GET',
      body: options.body,
      headers,
      // Ne pas utiliser le cache pour les requêtes non-GET
      ...(options.method && options.method !== 'GET' ? {} : { cache: 'default' })
    })
    
    console.log('[useApi] Success:', response)
    
    return {
      data: ref(response),
      error: ref(null)
    }
  } catch (err: any) {
    console.error('[useApi] Error:', err)
    console.error('[useApi] Error status:', err.status || err.statusCode)
    console.error('[useApi] Error data:', err.data)
    
    // Si c'est une erreur 403, rediriger vers la connexion
    if (err.status === 403 || err.statusCode === 403) {
      if (process.client) {
        // Nettoyer les tokens invalides
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        
        // Rediriger vers la connexion
        window.location.href = '/connexion'
      }
    }
    
    // Message d'erreur convivial sans URL du backend
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
    
    if (err.status === 400 || err.statusCode === 400) {
      // Erreur de validation - extraire le message
      if (err.data?.detail) {
        errorMessage = err.data.detail
      } else if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.data?.user) {
        // Erreurs de validation sur l'utilisateur
        const userErrors = Object.values(err.data.user).flat().join(', ')
        errorMessage = userErrors || 'Données utilisateur invalides'
      } else if (err.data?.non_field_errors) {
        errorMessage = Array.isArray(err.data.non_field_errors) 
          ? err.data.non_field_errors.join(', ') 
          : err.data.non_field_errors
      } else if (typeof err.data === 'object' && err.data !== null) {
        // Autres erreurs de validation
        const errors = Object.entries(err.data)
          .map(([key, value]) => {
            const val = Array.isArray(value) ? value.join(', ') : String(value)
            return `${key}: ${val}`
          })
          .filter(Boolean)
          .join('. ')
        errorMessage = errors || 'Données invalides'
      } else {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.'
      }
    } else if (err.status === 401 || err.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (err.status === 404 || err.statusCode === 404) {
      errorMessage = 'Ressource introuvable.'
    } else if (err.status === 500 || err.statusCode === 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.'
    } else if (err.name === 'FetchError' || err.message?.includes('fetch')) {
      errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.'
    }
    
    return {
      data: ref(null),
      error: ref({
        message: errorMessage,
        status: err?.status || err?.statusCode || 500,
        data: err?.data
      })
    }
  }
}
