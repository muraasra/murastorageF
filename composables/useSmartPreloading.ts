// Composable pour le préchargement intelligent des données
import { ref, onMounted } from 'vue'
import { useApi } from '@/stores/useApi'
import { API_BASE_URL } from '@/constants'

export const useSmartPreloading = () => {
  const preloadedData = ref(new Map())
  const isPreloading = ref(false)
  const preloadQueue = ref<string[]>([])

  // Configuration du préchargement
  const preloadConfig = {
    cacheDuration: 300000, // 5 minutes
    maxCacheSize: 100,
    preloadDelay: 200, // Délai avant préchargement
    batchSize: 3 // Nombre de requêtes simultanées
  }

  // Précharger les données utilisateur
  const preloadUserData = async () => {
    const cacheKey = 'user-data'
    if (preloadedData.value.has(cacheKey)) return

    try {
      const user = localStorage.getItem('user')
      const entreprise = localStorage.getItem('entreprise')
      const boutique = localStorage.getItem('boutique')

      if (user && entreprise && boutique) {
        preloadedData.value.set(cacheKey, {
          user: JSON.parse(user),
          entreprise: JSON.parse(entreprise),
          boutique: JSON.parse(boutique),
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.warn('Erreur lors du préchargement des données utilisateur:', error)
    }
  }

  // Précharger les données de stock
  const preloadStockData = async (boutiqueId: number) => {
    const cacheKey = `stock-data-${boutiqueId}`
    if (preloadedData.value.has(cacheKey)) return

    try {
      const { data: stocksData, error: stocksError } = await useApi(
        `${API_BASE_URL}/api/stocks/?entrepot=${boutiqueId}`
      )

      if (!stocksError.value && stocksData.value) {
        preloadedData.value.set(cacheKey, {
          stocks: stocksData.value,
          timestamp: Date.now()
        })

        // Précharger aussi les produits associés
        const stocksAvecQuantite = stocksData.value.filter((stock: any) => stock.quantite > 0)
        if (stocksAvecQuantite.length > 0) {
          await preloadProductsData(stocksAvecQuantite.map((s: any) => s.produit))
        }
      }
    } catch (error) {
      console.warn('Erreur lors du préchargement des données de stock:', error)
    }
  }

  // Précharger les données de produits
  const preloadProductsData = async (productIds: number[]) => {
    const cacheKey = `products-data-${productIds.join(',')}`
    if (preloadedData.value.has(cacheKey)) return

    try {
      const { data: productsData, error: productsError } = await useApi(
        `${API_BASE_URL}/api/produits/?id__in=${productIds.join(',')}`
      )

      if (!productsError.value && productsData.value) {
        preloadedData.value.set(cacheKey, {
          products: productsData.value,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.warn('Erreur lors du préchargement des données de produits:', error)
    }
  }

  // Précharger les données de factures
  const preloadFacturesData = async (boutiqueId: number) => {
    const cacheKey = `factures-data-${boutiqueId}`
    if (preloadedData.value.has(cacheKey)) return

    try {
      const { data: facturesData, error: facturesError } = await useApi(
        `${API_BASE_URL}/api/factures/?boutique=${boutiqueId}&limit=50`
      )

      if (!facturesError.value && facturesData.value) {
        preloadedData.value.set(cacheKey, {
          factures: facturesData.value,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.warn('Erreur lors du préchargement des données de factures:', error)
    }
  }

  // Précharger les données de mouvements
  const preloadMouvementsData = async (boutiqueId: number) => {
    const cacheKey = `mouvements-data-${boutiqueId}`
    if (preloadedData.value.has(cacheKey)) return

    try {
      const { data: mouvementsData, error: mouvementsError } = await useApi(
        `${API_BASE_URL}/api/mouvements-stock/?entrepot=${boutiqueId}&limit=100`
      )

      if (!mouvementsError.value && mouvementsData.value) {
        preloadedData.value.set(cacheKey, {
          mouvements: mouvementsData.value,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.warn('Erreur lors du préchargement des données de mouvements:', error)
    }
  }

  // Préchargement intelligent basé sur la page actuelle
  const smartPreload = async (currentPath: string) => {
    isPreloading.value = true

    try {
      // Précharger les données utilisateur d'abord
      await preloadUserData()

      // Obtenir l'ID de la boutique
      const boutiqueData = preloadedData.value.get('user-data')
      if (!boutiqueData?.boutique?.id) return

      const boutiqueId = boutiqueData.boutique.id

      // Précharger selon la page actuelle
      switch (currentPath) {
        case '/user':
          await Promise.all([
            preloadStockData(boutiqueId),
            preloadFacturesData(boutiqueId)
          ])
          break

        case '/facturation':
          await Promise.all([
            preloadStockData(boutiqueId),
            preloadProductsData([]) // Précharger tous les produits
          ])
          break

        case '/listes-factures':
          await preloadFacturesData(boutiqueId)
          break

        case '/mouvements-stock':
          await Promise.all([
            preloadMouvementsData(boutiqueId),
            preloadStockData(boutiqueId)
          ])
          break

        case '/stock-produit':
          await Promise.all([
            preloadStockData(boutiqueId),
            preloadProductsData([])
          ])
          break
      }

      console.log(`✅ Données préchargées pour ${currentPath}`)
    } catch (error) {
      console.error('Erreur lors du préchargement intelligent:', error)
    } finally {
      isPreloading.value = false
    }
  }

  // Obtenir des données préchargées
  const getPreloadedData = (key: string) => {
    const cached = preloadedData.value.get(key)
    if (cached && (Date.now() - cached.timestamp) < preloadConfig.cacheDuration) {
      return cached
    }
    return null
  }

  // Nettoyer le cache
  const clearCache = () => {
    const now = Date.now()
    for (const [key, data] of preloadedData.value.entries()) {
      if (now - data.timestamp > preloadConfig.cacheDuration) {
        preloadedData.value.delete(key)
      }
    }
  }

  // Préchargement en arrière-plan
  const backgroundPreload = async () => {
    const importantPages = ['/user', '/facturation', '/listes-factures']
    
    for (const page of importantPages) {
      setTimeout(() => {
        smartPreload(page)
      }, preloadConfig.preloadDelay)
    }
  }

  // Initialisation
  onMounted(() => {
    // Précharger les données de base
    preloadUserData()
    
    // Préchargement en arrière-plan
    setTimeout(backgroundPreload, 1000)
    
    // Nettoyer le cache périodiquement
    const cleanupInterval = setInterval(clearCache, 60000)
    
    onUnmounted(() => {
      clearInterval(cleanupInterval)
    })
  })

  return {
    // État
    isPreloading,
    preloadedData: computed(() => preloadedData.value),
    
    // Fonctions
    smartPreload,
    preloadUserData,
    preloadStockData,
    preloadProductsData,
    preloadFacturesData,
    preloadMouvementsData,
    getPreloadedData,
    clearCache,
    backgroundPreload
  }
}



