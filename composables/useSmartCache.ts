// Composable pour la gestion intelligente du cache
export const useSmartCache = () => {
  const nuxtApp = useNuxtApp()
  const $cachedFetch = nuxtApp?.$cachedFetch as any
  
  // Stratégies de cache par type de données - Durées augmentées
  const cacheStrategies = {
    // Données statiques (utilisateurs, entrepôts) - cache très long
    static: { ttl: 60 * 60 * 1000 }, // 1 heure
    
    // Données dynamiques (stocks, mouvements) - cache moyen
    dynamic: { ttl: 30 * 60 * 1000 }, // 30 minutes
    
    // Données critiques (authentification) - pas de cache
    critical: { cache: false },
    
    // Données de session (profil utilisateur) - cache long
    session: { ttl: 45 * 60 * 1000 }, // 45 minutes
    
    // Produits - cache long
    products: { ttl: 45 * 60 * 1000 }, // 45 minutes
    
    // Factures - cache moyen
    invoices: { ttl: 15 * 60 * 1000 } // 15 minutes
  }
  
  // Fonction pour déterminer la stratégie selon l'URL
  const getStrategy = (url: string): any => {
    if (url.includes('/auth/') || url.includes('/login/') || url.includes('/logout/')) {
      return cacheStrategies.critical
    }
    
    if (url.includes('/stocks/') || url.includes('/mouvements/') || url.includes('/factures/')) {
      return cacheStrategies.dynamic
    }
    
    if (url.includes('/utilisateurs/') || url.includes('/boutiques/') || url.includes('/entreprises/')) {
      return cacheStrategies.static
    }
    
    if (url.includes('/profile/') || url.includes('/user/')) {
      return cacheStrategies.session
    }
    
    if (url.includes('/produits/') || url.includes('/categories/') || url.includes('/fournisseurs/')) {
      return cacheStrategies.products
    }
    
    if (url.includes('/factures/') || url.includes('/commandes/')) {
      return cacheStrategies.invoices
    }
    
    // Par défaut, cache moyen
    return cacheStrategies.session
  }
  
  // Fonction principale pour les requêtes avec cache intelligent
  const smartFetch = async (url: string, options: any = {}) => {
    const strategy = getStrategy(url)
    const mergedOptions = {
      ...strategy,
      ...options
    }
    
    return $cachedFetch(url, mergedOptions)
  }
  
  // Fonction pour invalider le cache d'un pattern
  const invalidateCache = (pattern: string) => {
    if (!process.client) return
    
    try {
      const keys = Object.keys(localStorage)
      const regex = new RegExp(pattern)
      
      keys.forEach(key => {
        if (key.includes('app_cache_') && regex.test(key)) {
          localStorage.removeItem(key)
          console.log(`[Cache] Invalidé: ${key}`)
        }
      })
    } catch (e) {
      console.warn('Erreur lors de l\'invalidation du cache:', e)
    }
  }
  
  // Fonction pour précharger des données importantes
  const preloadData = async (urls: string[]) => {
    const promises = urls.map(url => smartFetch(url))
    try {
      await Promise.all(promises)
      console.log(`[Cache] Préchargé ${urls.length} endpoints`)
    } catch (e) {
      console.warn('Erreur lors du préchargement:', e)
    }
  }
  
  return {
    smartFetch,
    invalidateCache,
    preloadData,
    cacheStrategies
  }
}
