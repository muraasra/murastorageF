import { defineNuxtRouteMiddleware, navigateTo } from '#app'

const isDev = () => (typeof import.meta !== 'undefined' && !!import.meta.env?.DEV) || (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production')

/**
 * Décode le payload d'un JWT sans vérifier la signature (côté client).
 * Le rôle extrait ici est signé par le serveur Django — un attaquant ne peut
 * pas forger un token valide sans la clé secrète. C'est plus fiable que lire
 * role depuis localStorage['user'] qui est un simple JSON modifiable.
 */
function getRoleFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.role || null
  } catch {
    return null
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  // Ne rien faire côté serveur (SPA)
  if (process.server) return

  const log = (...args: unknown[]) => { if (isDev()) console.log(...args) }

  const normalizeBoolean = (value: unknown) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (normalized === 'true') return true
      if (normalized === 'false') return false
    }
    return undefined
  }

  const getEmailVerificationStatus = (userData: any) => {
    const keys = ['email_verified', 'emailVerified', 'is_email_verified', 'is_verified', 'verified', 'isVerified']
    if (!userData) return undefined
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(userData, key)) {
        return normalizeBoolean(userData[key])
      }
    }
    return undefined
  }

  // Si la route ou le path est invalide, rediriger vers une page valide pour éviter un écran blanc
  if (!to || !to.path) {
    if (process.client) return navigateTo('/home/accueil')
    return
  }

  // Vérifier si l'utilisateur est connecté
  if (process.client) {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    let parsedUserForVerification: any = null
    if (user) {
      try {
        parsedUserForVerification = JSON.parse(user)
      } catch (e) {
        parsedUserForVerification = null
      }
    }

    const explicitEmailVerified = getEmailVerificationStatus(parsedUserForVerification)
    const storedEmailVerified = normalizeBoolean(localStorage.getItem('email_verified'))
    const emailVerified = explicitEmailVerified ?? storedEmailVerified ?? false

    log('[Auth Middleware] Route:', to.path, 'Token:', token ? 'Présent' : 'Absent', 'User:', user ? 'Présent' : 'Absent')

    // Pages publiques autorisées sans authentification
    const publicPages = [
      // Pages de connexion et authentification
      '/connexion',
      '/home/accueil',
      '/home/a_propos',
      '/home/confidentialite',
      '/home/conditions',
      '/home/contact_accueil',
      '/home/faq',
      '/home/services',
      '/home/tarification',
      '/bingsiteauth.xml',
      '/bingsiteauth',
      
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
      if (to.path === '/') return navigateTo('/home/accueil')
      const isPublicPage = publicPages.some(page => to.path === page) || (to.path && to.path.startsWith('/home/'))
      if (!isPublicPage) return navigateTo('/connexion')
      return
    }

    // Compte non vérifié : accès uniquement aux pages publiques + connexion + déconnexion (via connexion/verification)
    if (token && emailVerified === false) {
      log('[Auth Middleware] Email non vérifié, accès restreint aux pages publiques et connexion')
      const isPublicPage = publicPages.some(page => to.path === page) || (to.path && to.path.startsWith('/home/'))
      if (!isPublicPage) {
        return navigateTo('/home/verification')
      }
      return
    }

    // Si connecté et essaie d'accéder à la page de connexion, rediriger vers le dashboard approprié
    if (token && to.path === '/connexion') {
      // Lire le rôle depuis le token JWT signé (pas depuis localStorage['user'])
      const userRole = getRoleFromToken(token)
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
    }

    // Logique de redirection basée sur le rôle si le token est présent
    if (token) {
      // Rôle lu depuis le payload JWT signé — résistant à la manipulation du localStorage
      const userRole = getRoleFromToken(token)

      log('[Auth Middleware] Rôle utilisateur (JWT):', userRole)

      if (userRole === 'superadmin') {
        log('[Auth Middleware] SuperAdmin détecté')

        if (to.path && to.path.startsWith('/superadmin')) return
        if (to.path === '/exercice-fiscal') return
        if (to.path && to.path.startsWith('/user')) return
        if (to.path === '/') return navigateTo('/superadmin/dashboard')
        if (to.path === '/admin') return navigateTo('/superadmin/dashboard')

      } else if (userRole === 'admin' || userRole === 'user') {
        log('[Auth Middleware] Admin/User détecté')

        // Routes réservées superadmin
        if (to.path === '/exercice-fiscal') return navigateTo('/admin')
        if (to.path && to.path.startsWith('/superadmin')) {
          const boutique = localStorage.getItem('boutique')
          let hasValidBoutique = false
          try {
            if (boutique && boutique !== 'null') {
              const b = JSON.parse(boutique)
              hasValidBoutique = !!(b && b.id)
            }
          } catch { hasValidBoutique = false }
          return navigateTo(hasValidBoutique ? '/user' : '/')
        }

        // Vérifier boutique assignée
        const boutique = localStorage.getItem('boutique')
        let hasValidBoutique = false
        try {
          if (boutique && boutique !== 'null') {
            const b = JSON.parse(boutique)
            hasValidBoutique = !!(b && b.id)
          }
        } catch { hasValidBoutique = false }

        if (!hasValidBoutique) {
          if (to.path !== '/') return navigateTo('/')
          return
        } else {
          if (to.path === '/') return navigateTo('/user')
        }
        return
      }
    }
  }
})
