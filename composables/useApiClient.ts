// Composable centralisé pour tous les appels API
import { API_BASE_URL } from '@/constants'

export const useApiClient = () => {
  const { smartFetch } = useSmartCache()
  
  // Fonction pour construire l'URL complète
  const buildUrl = (endpoint: string): string => {
    // Si l'endpoint commence déjà par http, le retourner tel quel
    if (endpoint.startsWith('http')) {
      return endpoint
    }
    
    // Sinon, construire l'URL avec la base
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${API_BASE_URL}${cleanEndpoint}`
  }
  
  // Fonction pour ajouter les headers d'authentification
  const getAuthHeaders = () => {
    if (!process.client) return {}
    
    const token = localStorage.getItem('access_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }
  
  // Fonction pour ajouter les headers par défaut
  const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  })
  
  // Endpoints API centralisés
  const endpoints = {
    // Authentification
    auth: {
      login: () => buildUrl('/api/auth/login/'),
      logout: () => buildUrl('/api/auth/logout/'),
      me: () => buildUrl('/api/user/me/'),
      refresh: () => buildUrl('/api/auth/refresh/')
    },
    
    // Utilisateurs
    users: {
      list: (entrepriseId?: number) => buildUrl(`/api/users/${entrepriseId ? `?entreprise=${entrepriseId}` : ''}`),
      get: (id: number) => buildUrl(`/api/users/${id}/`),
      create: () => buildUrl('/api/users/'),
      update: (id: number) => buildUrl(`/api/users/${id}/`),
      delete: (id: number) => buildUrl(`/api/users/${id}/`)
    },
    
    // Entreprises
    entreprises: {
      list: () => buildUrl('/api/entreprises/'),
      get: (id: number) => buildUrl(`/api/entreprises/${id}/`),
      create: () => buildUrl('/api/entreprises/'),
      update: (id: number) => buildUrl(`/api/entreprises/${id}/`),
      delete: (id: number) => buildUrl(`/api/entreprises/${id}/`)
    },
    
    // Boutiques/Entrepôts
    boutiques: {
      list: () => buildUrl('/api/boutiques/'),
      get: (id: number) => buildUrl(`/api/boutiques/${id}/`),
      create: () => buildUrl('/api/boutiques/'),
      update: (id: number) => buildUrl(`/api/boutiques/${id}/`),
      delete: (id: number) => buildUrl(`/api/boutiques/${id}/`)
    },
    
    // Produits
    produits: {
      list: (entrepotId?: number) => buildUrl(`/api/produits/${entrepotId ? `?entrepot=${entrepotId}` : ''}`),
      get: (id: number) => buildUrl(`/api/produits/${id}/`),
      create: () => buildUrl('/api/produits/'),
      update: (id: number) => buildUrl(`/api/produits/${id}/`),
      delete: (id: number) => buildUrl(`/api/produits/${id}/`),
      byIds: (ids: string) => buildUrl(`/api/produits/?id__in=${ids}`)
    },
    
    // Stocks
    stocks: {
      list: (entrepotId?: number, produitId?: number) => {
        const params = new URLSearchParams()
        if (entrepotId) params.append('entrepot', entrepotId.toString())
        if (produitId) params.append('produit', produitId.toString())
        return buildUrl(`/api/stocks/?${params.toString()}`)
      },
      get: (id: number) => buildUrl(`/api/stocks/${id}/`),
      create: () => buildUrl('/api/stocks/'),
      update: (id: number) => buildUrl(`/api/stocks/${id}/`),
      delete: (id: number) => buildUrl(`/api/stocks/${id}/`)
    },
    
    // Mouvements de stock
    mouvements: {
      list: (entrepotId?: number) => buildUrl(`/api/mouvements-stock/${entrepotId ? `?entrepot=${entrepotId}` : ''}`),
      get: (id: number) => buildUrl(`/api/mouvements-stock/${id}/`),
      create: () => buildUrl('/api/mouvements-stock/'),
      update: (id: number) => buildUrl(`/api/mouvements-stock/${id}/`),
      delete: (id: number) => buildUrl(`/api/mouvements-stock/${id}/`)
    },
    
    // Partenaires
    partenaires: {
      list: (entrepriseId?: number) => buildUrl(`/api/partenaires/${entrepriseId ? `?entreprise=${entrepriseId}` : ''}`),
      get: (id: number) => buildUrl(`/api/partenaires/${id}/`),
      create: () => buildUrl('/api/partenaires/'),
      update: (id: number) => buildUrl(`/api/partenaires/${id}/`),
      delete: (id: number) => buildUrl(`/api/partenaires/${id}/`),
      factures: (id: number) => buildUrl(`/api/factures/?partenaire=${id}`),
      dettes: (id: number) => buildUrl(`/api/partenaires/${id}/dettes/`)
    },
    
    // Clients
    clients: {
      list: () => buildUrl('/api/clients/'),
      get: (id: number) => buildUrl(`/api/clients/${id}/`),
      create: () => buildUrl('/api/clients/'),
      update: (id: number) => buildUrl(`/api/clients/${id}/`),
      delete: (id: number) => buildUrl(`/api/clients/${id}/`),
      searchByPhone: (phone: string) => buildUrl(`/api/clients/search_by_phone/?phone=${phone}`)
    },
    
    // Factures
    factures: {
      list: (boutiqueId?: number, partenaireId?: number) => {
        const params = new URLSearchParams()
        if (boutiqueId) params.append('boutique', boutiqueId.toString())
        if (partenaireId) params.append('partenaire', partenaireId.toString())
        return buildUrl(`/api/factures/?${params.toString()}`)
      },
      get: (id: number) => buildUrl(`/api/factures/${id}/`),
      create: () => buildUrl('/api/factures/'),
      update: (id: number) => buildUrl(`/api/factures/${id}/`),
      delete: (id: number) => buildUrl(`/api/factures/${id}/`)
    }
  }
  
  // Fonction générique pour les requêtes GET avec cache
  const get = async (url: string, options: any = {}) => {
    return smartFetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
      ...options
    })
  }
  
  // Fonction générique pour les requêtes POST
  const post = async (url: string, data: any, options: any = {}) => {
    return smartFetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
      cache: false, // Pas de cache pour les POST
      ...options
    })
  }
  
  // Fonction générique pour les requêtes PUT
  const put = async (url: string, data: any, options: any = {}) => {
    return smartFetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
      cache: false, // Pas de cache pour les PUT
      ...options
    })
  }
  
  // Fonction générique pour les requêtes DELETE
  const del = async (url: string, options: any = {}) => {
    return smartFetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
      cache: false, // Pas de cache pour les DELETE
      ...options
    })
  }
  
  return {
    endpoints,
    buildUrl,
    getAuthHeaders,
    getDefaultHeaders,
    get,
    post,
    put,
    delete: del
  }
}










