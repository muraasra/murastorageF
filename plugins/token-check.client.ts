export default defineNuxtPlugin(async () => {
  // Plugin désactivé pour éviter les conflits avec le middleware d'authentification
  // Le middleware auth.global.ts gère maintenant toutes les redirections
  
  // Vérifier le token seulement côté client pour la validation
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    // Si on a un token et un utilisateur, vérifier la validité seulement
    if (token && user) {
      try {
        const { useTokenCheck } = await import('@/stores/useTokenCheck')
        const isValid = await useTokenCheck()
        
        if (!isValid) {
          // Token invalide, nettoyer le localStorage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          localStorage.removeItem('entreprise')
          localStorage.removeItem('boutique')
          localStorage.removeItem('permissions')
          
          console.log('[TokenCheck Plugin] Token invalide, nettoyage effectué')
        } else {
          console.log('[TokenCheck Plugin] Token valide')
        }
      } catch (error) {
        console.error('[TokenCheck Plugin] Erreur lors de la vérification:', error)
        // En cas d'erreur, nettoyer par sécurité
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('entreprise')
        localStorage.removeItem('boutique')
        localStorage.removeItem('permissions')
      }
    }
  }
})
