import { API_BASE_URL } from '@/constants'

export const useApiBase = () => {
  const getApiUrl = (endpoint: string) => {
    // Vérifier que l'endpoint n'est pas undefined ou null
    if (!endpoint) {
      console.error('[useApiBase] Endpoint est undefined ou null')
      return API_BASE_URL
    }
    
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

  const parseApiList = <T = any>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[]
    if (data && typeof data === 'object' && 'results' in data) {
      const results = (data as { results?: unknown }).results
      return Array.isArray(results) ? results as T[] : []
    }
    return []
  }

  const getEntrepriseId = (): number | null => {
    if (!process.client) return null
    try {
      const entreprise = JSON.parse(localStorage.getItem('entreprise') || 'null')
      if (entreprise?.id) return Number(entreprise.id)

      const boutique = JSON.parse(localStorage.getItem('boutique') || 'null')
      const ent = boutique?.entreprise
      if (ent?.id) return Number(ent.id)
      if (typeof ent === 'number') return ent

      const user = JSON.parse(localStorage.getItem('user') || 'null')
      const userEnt = user?.entreprise
      if (userEnt?.id) return Number(userEnt.id)
      if (typeof userEnt === 'number') return userEnt

      return null
    } catch {
      return null
    }
  }

  const getStockQuantity = (data: unknown, fallback = 0): number => {
    const list = parseApiList<{ quantite?: number; quantite_disponible?: number }>(data)
    if (!list.length) return fallback
    const row = list[0]
    return row.quantite ?? row.quantite_disponible ?? fallback
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
    parseApiList,
    getEntrepriseId,
    getStockQuantity,
    isAuthenticated
  }
}








