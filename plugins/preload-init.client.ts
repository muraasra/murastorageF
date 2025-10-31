// Plugin pour initialiser le préchargement au démarrage
export default defineNuxtPlugin(async () => {
  // Client uniquement
  if (process.client) {
    const { preloadAllData } = useSuperAdminPreloader()
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Précharger seulement pour les superadmins
        if (userData.role === 'superadmin') {
          console.log('[PreloadPlugin] Préchargement initial pour superadmin')
          // Précharger en arrière-plan sans bloquer l'interface
          preloadAllData().catch(err => {
            console.warn('[PreloadPlugin] Erreur préchargement initial:', err)
          })
        }
      } catch (e) {
        console.warn('[PreloadPlugin] Erreur parsing user data:', e)
      }
    }
  }
})











