export const useAuth = () => {
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (process.client) {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('access_token')
    }
    return null
  }

  const isAuthenticated = () => {
    if (process.client) {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      return !!(token && user)
    }
    return false
  }

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('entreprise')
      localStorage.removeItem('boutique')
      navigateTo('/connexion')
    }
  }

  return {
    getAuthHeaders,
    getToken,
    isAuthenticated,
    logout
  }
}


