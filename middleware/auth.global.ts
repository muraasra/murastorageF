import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Ne rien faire côté serveur (SPA)
  if (process.server) return

  // Vérification de sécurité pour éviter les erreurs avec to undefined
  if (!to || !to.path) {
    console.warn('[Auth Middleware] Route ou path non défini, arrêt du middleware')
    return
  }

  // Vérifier si l'utilisateur est connecté
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')

    console.log('[Auth Middleware] Route:', to.path)
    console.log('[Auth Middleware] Token:', token ? 'Présent' : 'Absent')
    console.log('[Auth Middleware] User:', user ? 'Présent' : 'Absent')

    // Pages publiques autorisées sans authentification
    const publicPages = [
      // Pages de connexion et authentification
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
      
      // Pages d'inscription
      '/home/inscription',
      '/home/verification',
      '/home/about',
      '/home/mot-de-passe-oublie',
      '/reset-password',
      '/sitemap',
      '/sitemap.xml',
      '/BingSiteAuth.xml',
      '/BingSiteAuth',
      
      '/cookies',
      
      '/support',
      '/guide',
      '/security',
      
      '/robots.txt'
    ]

    // Si pas de token, rediriger vers la page d'accueil publique ou connexion
    if (!token) {
      console.log('[Auth Middleware] Pas de token, non connecté')

      if (to.path === '/') {
        console.log('[Auth Middleware] Accès à la racine sans token, redirection vers /home/accueil')
        return navigateTo('/home/accueil')
      }

      const isPublicPage = publicPages.some(page => to.path === page) || (to.path && to.path.startsWith('/home/'))

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
          
          // SuperAdmin peut accéder à /superadmin
          if (to.path && to.path.startsWith('/superadmin')) {
            console.log('[Auth Middleware] Accès autorisé à /superadmin')
            return
          }
          
          // SuperAdmin peut accéder à /user (peut sélectionner une boutique)
          if (to.path && to.path.startsWith('/user')) {
            console.log('[Auth Middleware] SuperAdmin accès à /user autorisé')
            return
          }
          
          // SuperAdmin ne peut pas accéder à la page d'attente (/)
          if (to.path === '/') {
            return navigateTo('/superadmin/dashboard')
          }
          
          // Par défaut, rester sur superadmin pour autres cibles interdites
          if (to.path === '/admin') {
            return navigateTo('/superadmin/dashboard')
          }
          
        } else if (userRole === 'admin' || userRole === 'user') {
          console.log('[Auth Middleware] Admin/User détecté')
          
          // Admin/User ne peut pas accéder à /superadmin
          if (to.path && to.path.startsWith('/superadmin')) {
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
          if (to.path && to.path.startsWith('/user')) {
            return
          }
          
          // Rediriger vers le dashboard user si pas déjà là
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
