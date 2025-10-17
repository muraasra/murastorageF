import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Vérifier si l'utilisateur est connecté
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    console.log('[Auth Middleware] Route:', to.path)
    console.log('[Auth Middleware] Token:', token ? 'Présent' : 'Absent')
    console.log('[Auth Middleware] User:', user ? 'Présent' : 'Absent')
    
    if (!token || !user) {
      console.log('[Auth Middleware] Pas connecté')
      
      // Pages publiques autorisées sans authentification
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
      
      // Redirection spéciale pour la racine "/"
      if (to.path === '/') {
        console.log('[Auth Middleware] Accès à la racine, redirection vers /home/accueil')
        return navigateTo('/home/accueil')
      }
      
      // Vérifier si la page est publique
      const isPublicPage = publicPages.some(page => to.path === page) || to.path.startsWith('/home/')
      
      if (!isPublicPage) {
        console.log('[Auth Middleware] Page privée, redirection vers /home/accueil')
        return navigateTo('/home/accueil')
      }
      
      console.log('[Auth Middleware] Page publique autorisée:', to.path)
      return
    }

    // Vérifier la validité du token seulement si nécessaire
    if (to.path === '/connexion') {
      return
    }
    
    try {
      const userData = JSON.parse(user)
      const userRole = userData.role
      
      console.log('[Auth Middleware] Rôle utilisateur:', userRole)
      
      // Logique de redirection selon le rôle
      if (userRole === 'superadmin') {
        console.log('[Auth Middleware] SuperAdmin détecté')
        
        // SuperAdmin peut accéder à /superadmin
        if (to.path.startsWith('/superadmin')) {
          console.log('[Auth Middleware] Accès autorisé à /superadmin')
          return
        }
        
        // Autoriser l'accès à /user si une boutique est sélectionnée
        if (to.path.startsWith('/user')) {
          const boutique = localStorage.getItem('boutique')
          let hasValidBoutique = false
          if (boutique && boutique !== 'null' && boutique !== 'undefined') {
            try {
              const boutiqueData = JSON.parse(boutique)
              hasValidBoutique = !!(boutiqueData && boutiqueData.id)
            } catch (e) {
              hasValidBoutique = false
            }
          }
          console.log('[Auth Middleware] Boutique valide:', hasValidBoutique)
          return hasValidBoutique ? undefined : navigateTo('/superadmin/')
        }
        
        // SuperAdmin ne peut pas accéder à la page d'attente (/)
        if (to.path === '/') {
          return navigateTo('/superadmin/')
        }
        
        // Par défaut, rester sur superadmin pour autres cibles interdites
        if (to.path === '/admin') {
          return navigateTo('/superadmin/')
        }
        
      } else if (userRole === 'admin' || userRole === 'user') {
        console.log('[Auth Middleware] Admin/User détecté')
        
        // Admin/User ne peut pas accéder à /superadmin
        if (to.path.startsWith('/superadmin')) {
          console.log('[Auth Middleware] Accès refusé à /superadmin pour Admin/User')
          const boutique = localStorage.getItem('boutique')
          let hasValidBoutique = false
          if (boutique && boutique !== 'null' && boutique !== 'undefined') {
            try {
              const boutiqueData = JSON.parse(boutique)
              hasValidBoutique = boutiqueData && boutiqueData.id
            } catch (e) {
              hasValidBoutique = false
            }
          }
          return navigateTo(hasValidBoutique ? '/user' : '/')
        }
        
        // Vérifier si l'utilisateur a une boutique assignée
        const boutique = localStorage.getItem('boutique')
        
        // Vérifier si la boutique existe et est valide
        let hasValidBoutique = false
        if (boutique && boutique !== 'null' && boutique !== 'undefined') {
          try {
            const boutiqueData = JSON.parse(boutique)
            hasValidBoutique = boutiqueData && boutiqueData.id
          } catch (e) {
            hasValidBoutique = false
          }
        }
        
        console.log('[Auth Middleware] Boutique valide pour Admin/User:', hasValidBoutique)
        
        if (!hasValidBoutique) {
          // Pas de boutique assignée, peut seulement accéder à la racine
          if (to.path !== '/') {
            return navigateTo('/')
          }
          return
        } else {
          // A une boutique assignée, ne peut pas accéder à la page d'attente (/)
          if (to.path === '/') {
            return navigateTo('/user')
          }
        }
        
        // A une boutique, peut accéder à /user
        if (to.path.startsWith('/user')) {
          return
        }
        
        // Rediriger vers le dashboard user si pas déjà là
        if (to.path === '/admin') {
          return navigateTo('/user')
        }
      }
      
    } catch (error) {
      console.error('[Auth Middleware] Erreur:', error)
      // Ne pas rediriger automatiquement en cas d'erreur de parsing
    }
  }
})