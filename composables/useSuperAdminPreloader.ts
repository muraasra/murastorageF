// Composable pour le préchargement optimisé des données superadmin
import { ref, reactive } from 'vue'
import { useApi } from '@/stores/useApi'
import { API_BASE_URL } from '@/constants'

export const useSuperAdminPreloader = () => {
  const isLoading = ref(false)
  const preloadedData = reactive({
    entreprise: null as any,
    boutiques: [] as any[],
    users: [] as any[],
    produits: [] as any[],
    factures: [] as any[],
    categories: [] as any[],
    fournisseurs: [] as any[]
  })

  const cache = reactive({
    lastUpdate: null as Date | null,
    ttl: 5 * 60 * 1000, // 5 minutes
    isValid: false
  })

  // Vérifier si le cache est valide
  const isCacheValid = () => {
    if (!cache.lastUpdate) return false
    const now = new Date()
    const diff = now.getTime() - cache.lastUpdate.getTime()
    return diff < cache.ttl && cache.isValid
  }

  // Précharger toutes les données critiques
  const preloadAllData = async () => {
    if (isCacheValid()) {
      console.log('[Preloader] Utilisation du cache valide')
      return preloadedData
    }

    isLoading.value = true
    console.log('[Preloader] Début du préchargement des données')

    try {
      const entreprise = localStorage.getItem('entreprise')
      if (!entreprise) {
        throw new Error('Informations entreprise manquantes')
      }

      const entrepriseData = JSON.parse(entreprise)
      const entrepriseId = entrepriseData.id

      // Précharger toutes les données en parallèle
      const [
        entrepriseRes,
        boutiquesRes,
        usersRes,
        produitsRes,
        facturesRes,
        categoriesRes,
        fournisseursRes
      ] = await Promise.allSettled([
        // Données entreprise
        $fetch(`${API_BASE_URL}/api/entreprises/${entrepriseId}/`),
        
        // Boutiques/Entrepôts
        $fetch(`${API_BASE_URL}/api/boutiques/?entreprise=${entrepriseId}`),
        
        // Utilisateurs
        $fetch(`${API_BASE_URL}/api/users/?entreprise=${entrepriseId}`),
        
        // Produits
        $fetch(`${API_BASE_URL}/api/produits/?entreprise=${entrepriseId}`),
        
        // Factures
        $fetch(`${API_BASE_URL}/api/factures/?entreprise=${entrepriseId}`),
        
        // Catégories
        $fetch(`${API_BASE_URL}/api/categories/`),
        
        // Fournisseurs
        $fetch(`${API_BASE_URL}/api/fournisseurs/`)
      ])

      // Traiter les résultats
      if (entrepriseRes.status === 'fulfilled') {
        preloadedData.entreprise = entrepriseRes.value
      }

      if (boutiquesRes.status === 'fulfilled') {
        preloadedData.boutiques = Array.isArray(boutiquesRes.value) 
          ? boutiquesRes.value 
          : boutiquesRes.value?.results || []
      }

      if (usersRes.status === 'fulfilled') {
        preloadedData.users = Array.isArray(usersRes.value) 
          ? usersRes.value 
          : usersRes.value?.results || []
      }

      if (produitsRes.status === 'fulfilled') {
        preloadedData.produits = Array.isArray(produitsRes.value) 
          ? produitsRes.value 
          : produitsRes.value?.results || []
      }

      if (facturesRes.status === 'fulfilled') {
        preloadedData.factures = Array.isArray(facturesRes.value) 
          ? facturesRes.value 
          : facturesRes.value?.results || []
      }

      if (categoriesRes.status === 'fulfilled') {
        preloadedData.categories = Array.isArray(categoriesRes.value) 
          ? categoriesRes.value 
          : categoriesRes.value?.results || []
      }

      if (fournisseursRes.status === 'fulfilled') {
        preloadedData.fournisseurs = Array.isArray(fournisseursRes.value) 
          ? fournisseursRes.value 
          : fournisseursRes.value?.results || []
      }

      // Marquer le cache comme valide
      cache.lastUpdate = new Date()
      cache.isValid = true

      console.log('[Preloader] Préchargement terminé avec succès')
      console.log('[Preloader] Données:', {
        entreprise: !!preloadedData.entreprise,
        boutiques: preloadedData.boutiques.length,
        users: preloadedData.users.length,
        produits: preloadedData.produits.length,
        factures: preloadedData.factures.length,
        categories: preloadedData.categories.length,
        fournisseurs: preloadedData.fournisseurs.length
      })

      return preloadedData

    } catch (error) {
      console.error('[Preloader] Erreur lors du préchargement:', error)
      cache.isValid = false
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Précharger les données spécifiques à un entrepôt
  const preloadBoutiqueData = async (boutiqueId: number) => {
    try {
      const [stocksRes, mouvementsRes] = await Promise.allSettled([
        $fetch(`${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}`),
        $fetch(`${API_BASE_URL}/api/mouvements-stock/?entrepot=${boutiqueId}`)
      ])

      return {
        stocks: stocksRes.status === 'fulfilled' ? stocksRes.value : [],
        mouvements: mouvementsRes.status === 'fulfilled' ? mouvementsRes.value : []
      }
    } catch (error) {
      console.error('[Preloader] Erreur préchargement entrepôt:', error)
      return { stocks: [], mouvements: [] }
    }
  }

  // Invalider le cache
  const invalidateCache = () => {
    cache.isValid = false
    cache.lastUpdate = null
    console.log('[Preloader] Cache invalidé')
  }

  // Obtenir les données préchargées
  const getPreloadedData = () => {
    return preloadedData
  }

  // Vérifier si les données sont disponibles
  const hasData = (type: keyof typeof preloadedData) => {
    return preloadedData[type] !== null && Array.isArray(preloadedData[type]) 
      ? preloadedData[type].length > 0 
      : !!preloadedData[type]
  }

  return {
    isLoading,
    preloadedData,
    preloadAllData,
    preloadBoutiqueData,
    invalidateCache,
    getPreloadedData,
    hasData,
    isCacheValid
  }
}
