import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL } from '@/constants'

export async function useTokenCheck(): Promise<boolean> {
  const auth = useAuthStore()

  if (!auth.token) return false

  try {
    // Utiliser $fetch au lieu de useFetch pour éviter les problèmes d'injection
    const response = await $fetch(`${API_BASE_URL}/api/token/verify/`, {
      method: 'POST',
      body: { token: auth.token },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Si on arrive ici, le token est valide
    return true
  } catch (err: any) {
    console.warn('[TokenCheck] Token invalide ou expiré:', err.message)
    
    // Essayer de rafraîchir le token si possible
    if (await tryRefreshToken()) {
      return true
    }
    
    // Si le refresh échoue, déconnecter l'utilisateur
    auth.logout()
    return false
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (!process.client) return false
  
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false

    const response = await $fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      body: { refresh: refreshToken },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.access) {
      // Sauvegarder le nouveau token
      const auth = useAuthStore()
      auth.setToken(response.access)
      
      // Sauvegarder le nouveau refresh token s'il est fourni
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh)
      }
      
      console.log('[TokenCheck] Token rafraîchi avec succès')
      return true
    }
    
    return false
  } catch (err) {
    console.warn('[TokenCheck] Impossible de rafraîchir le token:', err)
    return false
  }
}