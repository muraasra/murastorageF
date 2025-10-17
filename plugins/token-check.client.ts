export default defineNuxtPlugin(async () => {
  // Vérifier le token seulement côté client
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    const boutique = localStorage.getItem('boutique')
    
    // Log réduit pour éviter d'exposer des informations en production
    
    // Si on a un token et un utilisateur, vérifier la validité
    if (token && user) {
      try {
        const { useTokenCheck } = await import('@/stores/useTokenCheck')
        const isValid = await useTokenCheck()
        
        if (!isValid) {
          // Token invalide, redirection vers la connexion
          // Nettoyer le localStorage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          localStorage.removeItem('entreprise')
          localStorage.removeItem('boutique')
          localStorage.removeItem('permissions')
          
          // Rediriger vers la connexion si on n'y est pas déjà
          if (window.location.pathname !== '/connexion') {
            window.location.href = '/connexion'
          }
        } else {
          // Token valide
          
          // Vérifier la logique de redirection selon le rôle et la boutique
          try {
            const userData = JSON.parse(user)
            const userRole = userData.role
            
            // Rôle utilisateur
            
            if (userRole === 'superadmin') {
              // SuperAdmin doit être sur /superadmin
              if (!window.location.pathname.startsWith('/superadmin')) {
                // SuperAdmin -> /superadmin
                window.location.href = '/superadmin/'
              }
            } else if (userRole === 'admin' || userRole === 'user') {
              // Vérifier si l'utilisateur a une boutique valide
              let hasValidBoutique = false
              if (boutique && boutique !== 'null' && boutique !== 'undefined') {
                try {
                  const boutiqueData = JSON.parse(boutique)
                  hasValidBoutique = boutiqueData && boutiqueData.id
                } catch (e) {
                  hasValidBoutique = false
                }
              }
              
              // Boutique valide?
              
              if (!hasValidBoutique) {
                // Pas de boutique, doit être sur la racine
                if (window.location.pathname !== '/') {
                  // Utilisateur sans boutique -> /
                  window.location.href = '/'
                }
              } else {
                // A une boutique, doit être sur /user
                if (!window.location.pathname.startsWith('/user')) {
                  // Utilisateur avec boutique -> /user
                  window.location.href = '/user'
                }
              }
            }
          } catch (error) {
            console.error('[TokenCheck Plugin] Erreur lors de la vérification des données utilisateur:', error)
          }
        }
      } catch (error) {
        console.error('[TokenCheck Plugin] Erreur lors de la vérification:', error)
        // En cas d'erreur, nettoyer et rediriger par sécurité
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('entreprise')
        localStorage.removeItem('boutique')
        localStorage.removeItem('permissions')
        
        if (window.location.pathname !== '/connexion') {
          window.location.href = '/connexion'
        }
      }
    } else {
      // Pas de token ou utilisateur: autoriser les pages publiques et rediriger la racine vers /home/accueil
      const path = window.location.pathname
      const publicPages = [
        '/connexion',
        '/test-public',
        '/home/accueil',
        '/home/a_propos',
        '/home/confidentialite',
        '/home/conditions',
        '/home/contact_accueil',
        '/home/faq',
        '/home/services',
        '/home/tarification',
        '/home/inscription',
        '/home/verification',
        '/home/about'
      ]

      const isPublic = publicPages.includes(path) || path.startsWith('/home/')

      if (path === '/') {
        // Rediriger la racine vers la page d'accueil publique
        window.location.href = '/home/accueil'
        return
      }

      // Si la page n'est pas publique, rediriger vers /home/accueil
      if (!isPublic) {
        window.location.href = '/home/accueil'
      }
    }
  }
})
