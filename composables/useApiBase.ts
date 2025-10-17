import { API_BASE_URL } from '@/constants'

export const useApiBase = () => {
  const getApiUrl = (endpoint: string) => {
    // Si l'endpoint commence déjà par http, le retourner tel quel
    if (endpoint.startsWith('http')) {
      return endpoint
    }
    
    // Sinon, construire l'URL complète
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${API_BASE_URL}${cleanEndpoint}`
  }

  const getAuthHeaders = () => {
    if (process.client) {
      const token = localStorage.getItem('access_token')
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  const isAuthenticated = () => {
    if (process.client) {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      return !!(token && user)
    }
    return false
  }

  return {
    API_BASE_URL,
    getApiUrl,
    getAuthHeaders,
    isAuthenticated
  }
}




