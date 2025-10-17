export const useApi = async (url: string, options: any = {}) => {
  const baseUrl = '/api'
  
  // Construire l'URL complète
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  
  // Récupérer le token d'authentification
  let headers = {
    'Content-Type': 'application/json',
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
    const nuxtApp = useNuxtApp()
    const $cachedFetch = (nuxtApp?.$cachedFetch as any) || $fetch
    const response = await $cachedFetch(fullUrl, {
      ...options,
      headers,
      cacheTTL: options?.cacheTTL ?? 5 * 60 * 1000 // 5 minutes par défaut
    })
    
    return {
      data: ref(response),
      error: ref(null)
    }
  } catch (err: any) {
    // Ne pas exposer l'URL du backend dans les erreurs
    
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
    
    return {
      data: ref(null),
      error: ref({
        message: err?.message || 'Une erreur est survenue. Veuillez réessayer plus tard.',
        status: err?.status || err?.statusCode || 500
      })
    }
  }
}














