export default defineNuxtPlugin(() => {
  // Plugin simplifié pour éviter les erreurs de contexte
  
  if (process.client) {
    // Intercepter les erreurs globales de manière simple
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Erreur non gérée:', event.reason)
      // Ne pas empêcher l'affichage par défaut pour éviter les problèmes
    })
  }

  return {
    provide: {
      // Utilitaires pour l'optimisation
      optimizeImage: (src: string) => ({
        src: src,
        loading: 'lazy',
        decoding: 'async'
      })
    }
  }
})

