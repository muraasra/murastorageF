import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Ne rien faire côté serveur (SPA)
  if (process.server) return

  // Vérifier si l'utilisateur est connecté
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user') // Garder pour la logique de rôle

    console.log('[Auth Middleware] Route:', to.path)
    console.log('[Auth Middleware] Token:', token ? 'Présent' : 'Absent')
    console.log('[Auth Middleware] User:', user ? 'Présent' : 'Absent')

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

    // Si pas de token, rediriger vers la page d'accueil publique ou connexion
    if (!token) {
      console.log('[Auth Middleware] Pas de token, non connecté')

      if (to.path === '/') {
        console.log('[Auth Middleware] Accès à la racine sans token, redirection vers /home/accueil')
        return navigateTo('/home/accueil')
      }

      const isPublicPage = publicPages.some(page => to.path === page) || to.path.startsWith('/home/')

      if (!isPublicPage) {
        console.log('[Auth Middleware] Page privée sans token, redirection vers /connexion')
        return navigateTo('/connexion')
      }

      console.log('[Auth Middleware] Page publique autorisée sans token:', to.path)
      return
    }

    // Si connecté et essaie d'accéder à la page de connexion, rediriger vers le dashboard approprié
    if (token && to.path === '/connexion') {
      try {
        const userData = user ? JSON.parse(user) : null
        const userRole = userData?.role

        if (userRole === 'superadmin') {
          return navigateTo('/superadmin/dashboard')
        } else if (userRole === 'admin' || userRole === 'user') {
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
          return navigateTo(hasValidBoutique ? '/user' : '/')
        }
      } catch (e) {
        console.error('[Auth Middleware] Erreur de parsing user data:', e)
        // En cas d'erreur, rediriger vers l'accueil ou la connexion
        return navigateTo('/connexion')
      }
    }

    // Logique de redirection basée sur le rôle si le token est présent
    if (user) {
      try {
        const userData = JSON.parse(user)
        const userRole = userData.role

        console.log('[Auth Middleware] Rôle utilisateur:', userRole)

        if (userRole === 'superadmin') {
          console.log('[Auth Middleware] SuperAdmin détecté')
          if (to.path.startsWith('/superadmin')) {
            console.log('[Auth Middleware] Accès autorisé à /superadmin')
            return
          }
          if (to.path.startsWith('/user')) {
            console.log('[Auth Middleware] SuperAdmin accès à /user autorisé')
            console.log('[Auth Middleware] Boutique dans localStorage:', localStorage.getItem('boutique'))
            return // Autoriser l'accès à /user pour les superadmins
          }
          if (to.path === '/') {
            return navigateTo('/superadmin/dashboard')
          }
          if (to.path === '/admin') {
            return navigateTo('/superadmin/dashboard')
          }
        } else if (userRole === 'admin' || userRole === 'user') {
          console.log('[Auth Middleware] Admin/User détecté')
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
          console.log('[Auth Middleware] Boutique valide pour Admin/User:', hasValidBoutique)
          if (!hasValidBoutique) {
            if (to.path !== '/') {
              return navigateTo('/')
            }
            return
          } else {
            if (to.path === '/') {
              return navigateTo('/user')
            }
          }
          if (to.path.startsWith('/user')) {
            return
          }
          if (to.path === '/admin') {
            return navigateTo('/user')
          }
        }
      } catch (error) {
        console.error('[Auth Middleware] Erreur de parsing des données utilisateur:', error)
        // En cas d'erreur de parsing, rediriger vers la connexion pour re-authentification
        return navigateTo('/connexion')
      }
    } else {
      // Si token présent mais pas de données utilisateur (corrompu ou manquant), rediriger vers connexion
      console.log('[Auth Middleware] Token présent mais données utilisateur manquantes/corrompues, redirection vers /connexion')
      return navigateTo('/connexion')
    }
  }
})