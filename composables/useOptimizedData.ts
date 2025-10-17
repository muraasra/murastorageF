// Composable pour optimiser le chargement des données communes
import { API_BASE_URL } from '@/constants'

export const useOptimizedData = () => {
  const { smartFetch, invalidateCache } = useSmartCache()
  
  // Cache des données communes
  const commonData = ref({
    produits: [],
    partenaires: [],
    boutiques: [],
    utilisateurs: [],
    lastFetch: null
  })
  
  // Fonction pour charger les données communes une seule fois
  const loadCommonData = async () => {
    const now = Date.now()
    const CACHE_DURATION = 60 * 60 * 1000 // 1 heure
    
    // Vérifier si les données sont encore valides
    if (commonData.value.lastFetch && (now - commonData.value.lastFetch) < CACHE_DURATION) {
      console.log('[OptimizedData] Utilisation du cache des données communes')
      return commonData.value
    }
    
    try {
      const token = process.client ? localStorage.getItem('access_token') : null
      const boutique = process.client ? JSON.parse(localStorage.getItem('boutique') || '{}') : {}
      
      if (!token || !boutique.id) {
        throw new Error('Token ou boutique manquant')
      }
      
      console.log('[OptimizedData] Chargement des données communes...')
      
      // Charger toutes les données en parallèle
      const [produits, partenaires, utilisateurs] = await Promise.all([
        smartFetch(`${API_BASE_URL}/api/produits/?entrepot=${boutique.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        smartFetch(`${API_BASE_URL}/api/partenaires/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        smartFetch(`${API_BASE_URL}/api/users/?entreprise=${boutique.entreprise}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      // Mettre à jour le cache
      commonData.value = {
        produits: produits || [],
        partenaires: partenaires || [],
        boutiques: [boutique], // Boutique actuelle
        utilisateurs: utilisateurs || [],
        lastFetch: now
      }
      
      console.log('[OptimizedData] Données communes chargées:', {
        produits: commonData.value.produits.length,
        partenaires: commonData.value.partenaires.length,
        utilisateurs: commonData.value.utilisateurs.length
      })
      
      return commonData.value
    } catch (err) {
      console.error('[OptimizedData] Erreur lors du chargement:', err)
      throw err
    }
  }
  
  // Fonction pour invalider le cache des données communes
  const invalidateCommonData = () => {
    commonData.value.lastFetch = null
    console.log('[OptimizedData] Cache des données communes invalidé')
  }
  
  // Fonction pour obtenir un produit par ID
  const getProduitById = (id: number) => {
    return commonData.value.produits.find(p => p.id === id)
  }
  
  // Fonction pour obtenir un partenaire par ID
  const getPartenaireById = (id: number) => {
    return commonData.value.partenaires.find(p => p.id === id)
  }
  
  // Fonction pour obtenir un utilisateur par ID
  const getUtilisateurById = (id: number) => {
    return commonData.value.utilisateurs.find(u => u.id === id)
  }
  
  return {
    loadCommonData,
    invalidateCommonData,
    getProduitById,
    getPartenaireById,
    getUtilisateurById,
    commonData: readonly(commonData)
  }
}

