// Configuration d'optimisation des performances
export default {
  // Cache configuration
  cache: {
    // Durée du cache en millisecondes (5 minutes)
    duration: 300000,
    // Taille maximale du cache
    maxSize: 50,
    // Clés à mettre en cache
    cacheKeys: [
      'user-data',
      'entreprise-data', 
      'boutique-data',
      'stock-data',
      'products-data'
    ]
  },

  // Timeout configuration
  timeouts: {
    // Timeout pour les requêtes API (3 secondes)
    api: 3000,
    // Timeout pour les requêtes lourdes (10 secondes)
    heavy: 10000,
    // Timeout pour les requêtes de cache (1 seconde)
    cache: 1000
  },

  // Lazy loading configuration
  lazyLoading: {
    // Charger les graphiques seulement quand nécessaire
    charts: true,
    // Charger les images de manière paresseuse
    images: true,
    // Charger les composants lourds de manière paresseuse
    components: true
  },

  // Compression configuration
  compression: {
    // Activer la compression des données
    enabled: true,
    // Niveau de compression (1-9)
    level: 6
  },

  // Pagination configuration
  pagination: {
    // Taille par défaut des pages
    defaultSize: 20,
    // Taille maximale des pages
    maxSize: 100,
    // Taille pour les connexions lentes
    slowConnectionSize: 10
  }
}












